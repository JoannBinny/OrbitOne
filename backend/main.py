import os
import sys
import threading

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import Base, engine, get_db, SessionLocal, upgrade_schema
import models
import schemas
from services import locations as location_service
from services import policies as policy_service
from services import budget as budget_service
from services import audit as audit_service

Base.metadata.create_all(bind=engine)
upgrade_schema()

app = FastAPI(title="OrbitOne Backend")

# Local frontend dev origins only — not a wildcard. Add the real deployed
# frontend origin here (never "*") if this is ever deployed.
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Organizations ----------

@app.get("/organizations", response_model=List[schemas.OrganizationOut])
def list_organizations(db: Session = Depends(get_db)):
    return db.query(models.Organization).all()


# ---------- Locations ----------

@app.get("/locations", response_model=List[schemas.LocationOut])
def list_locations(organization_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Location)
    if organization_id is not None:
        query = query.filter(models.Location.organization_id == organization_id)
    return query.all()


@app.get("/locations/available", response_model=List[schemas.LocationOut])
def available_locations(
    start_time: datetime,
    end_time: datetime,
    organization_id: Optional[int] = None,
    min_capacity: int = 0,
    needs_computers: bool = False,
    needs_projector: bool = False,
    db: Session = Depends(get_db),
):
    return location_service.get_available_locations(
        db, organization_id, start_time, end_time, min_capacity, needs_computers, needs_projector
    )


# ---------- Events ----------

@app.get("/events", response_model=List[schemas.EventOut])
def list_events(organization_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Event)
    if organization_id is not None:
        query = query.filter(models.Event.organization_id == organization_id)
    return query.all()


@app.get("/events/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    title = event.title
    # Release the room hold and remove everything that only exists in
    # relation to this event. AgentRun rows are preserved (a run is its own
    # audit record) but detached from the deleted event.
    db.query(models.Booking).filter(models.Booking.event_id == event_id).delete()
    db.query(models.Task).filter(models.Task.event_id == event_id).delete()
    db.query(models.BudgetItem).filter(models.BudgetItem.event_id == event_id).delete()
    db.query(models.Approval).filter(models.Approval.event_id == event_id).delete()
    db.query(models.AgentAction).filter(models.AgentAction.event_id == event_id).update({"event_id": None})
    db.query(models.AgentRun).filter(models.AgentRun.event_id == event_id).update({"event_id": None})
    db.delete(event)
    db.commit()

    audit_service.log_action(db, "event_deleted", f"Deleted event '{title}'", None)
    return None


@app.post("/events", response_model=schemas.EventOut)
def create_event(payload: schemas.EventCreate, db: Session = Depends(get_db)):
    if payload.location_id:
        conflicting = (
            db.query(models.Booking)
            .filter(
                models.Booking.location_id == payload.location_id,
                models.Booking.start_time < payload.end_time,
                models.Booking.end_time > payload.start_time,
            )
            .first()
        )
        if conflicting:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Location {payload.location_id} is already booked "
                    f"for an overlapping time slot."
                ),
            )

    event = models.Event(
        organization_id=payload.organization_id,
        title=payload.title,
        participants=payload.participants,
        start_time=payload.start_time,
        end_time=payload.end_time,
        location_id=payload.location_id,
        status="draft",
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    if payload.location_id:
        booking = models.Booking(
            location_id=payload.location_id,
            event_id=event.id,
            start_time=payload.start_time,
            end_time=payload.end_time,
        )
        db.add(booking)
        db.commit()

    if payload.agent_run_id is not None:
        run = db.query(models.AgentRun).filter(models.AgentRun.id == payload.agent_run_id).first()
        if run:
            run.event_id = event.id
            run.updated_at = datetime.utcnow()
            db.commit()

    audit_service.log_action(db, "event_created", f"Created event '{event.title}'", event.id)
    return event


# ---------- Tasks ----------

@app.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(
    event_id: Optional[int] = None,
    organization_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Task)
    if event_id is not None:
        query = query.filter(models.Task.event_id == event_id)
    if organization_id is not None:
        query = query.join(models.Event).filter(models.Event.organization_id == organization_id)
    return query.all()


@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Task(event_id=payload.event_id, title=payload.title, status="pending")
    db.add(task)
    db.commit()
    db.refresh(task)
    audit_service.log_action(db, "task_created", task.title, task.event_id)
    return task


@app.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    if payload.status not in ("pending", "done"):
        raise HTTPException(status_code=422, detail="status must be 'pending' or 'done'")
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = payload.status
    db.commit()
    db.refresh(task)
    action = "task_completed" if payload.status == "done" else "task_reopened"
    audit_service.log_action(db, action, task.title, task.event_id)
    return task


# ---------- Budget ----------

@app.post("/budget-items", response_model=schemas.BudgetItemOut)
def create_budget_item(payload: schemas.BudgetItemCreate, db: Session = Depends(get_db)):
    item = models.BudgetItem(event_id=payload.event_id, label=payload.label, amount=payload.amount)
    db.add(item)
    db.commit()
    db.refresh(item)
    audit_service.log_action(db, "budget_item_added", f"{item.label}: {item.amount}", item.event_id)
    return item


@app.get("/events/{event_id}/budget-total")
def budget_total(event_id: int, db: Session = Depends(get_db)):
    total = budget_service.total_budget_for_event(db, event_id)
    threshold = None
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if event:
        threshold = policy_service.get_budget_threshold(db, event.organization_id)
    return {
        "event_id": event_id,
        "total": total,
        "threshold": threshold,
        "requires_approval": threshold is not None and total > threshold,
    }


# ---------- Approvals ----------

@app.get("/approvals", response_model=List[schemas.ApprovalOut])
def list_approvals(
    status: Optional[str] = None,
    organization_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Approval)
    if status:
        query = query.filter(models.Approval.status == status)
    if organization_id is not None:
        query = query.join(models.Event).filter(models.Event.organization_id == organization_id)
    return query.all()


@app.post("/approvals", response_model=schemas.ApprovalOut)
def create_approval(payload: schemas.ApprovalCreate, db: Session = Depends(get_db)):
    approval = models.Approval(
        event_id=payload.event_id,
        reason=payload.reason,
        amount=payload.amount,
        status="pending",
        agent_run_id=payload.agent_run_id,
    )
    db.add(approval)

    event = db.query(models.Event).filter(models.Event.id == payload.event_id).first()
    if event and event.status == "draft":
        event.status = "needs_approval"

    db.commit()
    db.refresh(approval)
    audit_service.log_action(db, "approval_requested", payload.reason, payload.event_id)
    return approval


def _resume_agent_job(run_id: int, approval_id: int):
    """Resume the workflow a paused AgentRun belongs to after a human
    approves it. This is a real second Strands agent turn against the same
    AgentRun row — not a simulated continuation. There is no persisted
    in-memory conversation/session to resume verbatim (Strands gives us no
    serializable session store here, and building one is out of scope for
    this MVP); instead the fresh turn is told exactly what was approved and
    for which event, and continues that same real workflow to completion.
    """
    db = SessionLocal()
    try:
        run = db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
        approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
        if not run or not approval:
            return
        run.status = "running"
        run.updated_at = datetime.utcnow()
        db.commit()

        event = db.query(models.Event).filter(models.Event.id == approval.event_id).first()

        if AGENT_DIR not in sys.path:
            sys.path.insert(0, AGENT_DIR)
        import agent as agent_module

        amount_note = f" for ₹{approval.amount:,.0f}" if approval.amount is not None else ""
        resume_message = (
            f"Your pending approval request \"{approval.reason}\"{amount_note} for event "
            f"#{event.id} (\"{event.title}\") has just been APPROVED by a human. "
            f"Continue that same workflow to completion: make sure the remaining tasks for "
            f"event_id={event.id} are in place, then give a brief final confirmation. "
            f"Do not create a new event."
        )
        strands_agent = agent_module.build_agent(run.organization_id, run_id=run.id)
        response = strands_agent(resume_message)

        db.refresh(run)
        run.status = "completed"
        run.result_text = (run.result_text or "") + "\n\n---\nAfter approval:\n" + str(response)
        run.updated_at = datetime.utcnow()
        db.commit()
    except Exception as exc:
        error_db = SessionLocal()
        try:
            run = error_db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
            if run:
                run.status = "failed"
                run.error = str(exc)
                run.updated_at = datetime.utcnow()
                error_db.commit()
        finally:
            error_db.close()
    finally:
        db.close()


@app.post("/approvals/{approval_id}/approve", response_model=schemas.ApprovalOut)
def approve(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = "approved"

    event = db.query(models.Event).filter(models.Event.id == approval.event_id).first()
    if event:
        event.status = "confirmed"

    db.commit()
    db.refresh(approval)
    audit_service.log_action(db, "approval_approved", approval.reason, approval.event_id)

    if approval.agent_run_id is not None:
        run = db.query(models.AgentRun).filter(models.AgentRun.id == approval.agent_run_id).first()
        if run and run.status == "paused_for_approval":
            thread = threading.Thread(
                target=_resume_agent_job, args=(run.id, approval.id), daemon=True
            )
            thread.start()

    return approval


@app.post("/approvals/{approval_id}/reject", response_model=schemas.ApprovalOut)
def reject(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = "rejected"

    event = db.query(models.Event).filter(models.Event.id == approval.event_id).first()
    if event:
        event.status = "cancelled"
        # Rejecting the spend means the room hold is no longer authorized —
        # release it so it's genuinely available for other requests again.
        db.query(models.Booking).filter(models.Booking.event_id == event.id).delete()

    db.commit()
    db.refresh(approval)
    audit_service.log_action(db, "approval_rejected", approval.reason, approval.event_id)

    if approval.agent_run_id is not None:
        run = db.query(models.AgentRun).filter(models.AgentRun.id == approval.agent_run_id).first()
        if run:
            run.status = "rejected"
            run.updated_at = datetime.utcnow()
            db.commit()

    return approval


# ---------- Activity / audit log ----------

@app.get("/activity", response_model=List[schemas.AgentActionOut])
def list_activity(
    event_id: Optional[int] = None,
    organization_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.AgentAction).order_by(models.AgentAction.timestamp.desc())
    if event_id is not None:
        query = query.filter(models.AgentAction.event_id == event_id)
    if organization_id is not None:
        # Excludes AgentAction rows with no event_id (global entries) when this
        # filter is applied — those have no organization to scope them to.
        query = query.join(models.Event).filter(models.Event.organization_id == organization_id)
    return query.all()


@app.post("/activity", response_model=schemas.AgentActionOut)
def record_activity(payload: schemas.AgentActionCreate, db: Session = Depends(get_db)):
    return audit_service.log_action(db, payload.action, payload.details, payload.event_id)


# ---------- Agent runs (async job + polling) ----------
#
# POST /agent/run enqueues a run and returns immediately (status "queued").
# The actual Strands agent call happens on a background thread so it never
# blocks the request — the frontend is expected to poll GET /agent/run/{id}
# and, for step-by-step progress, GET /activity?event_id=... once an event_id
# is known. We do not invent intermediate statuses beyond
# queued/running/completed/failed; real progress comes from real activity rows.

AGENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "agent")


def _run_agent_job(run_id: int, message: str, organization_id: int):
    db = SessionLocal()
    try:
        run = db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
        if not run:
            return
        run.status = "running"
        run.updated_at = datetime.utcnow()
        db.commit()

        if AGENT_DIR not in sys.path:
            sys.path.insert(0, AGENT_DIR)
        import agent as agent_module  # agent/agent.py, importable once AGENT_DIR is on sys.path

        # organization_id and run_id are injected directly into the tools'
        # closures (see agent/tools.py::build_tools) rather than relying on
        # the LLM to correctly supply them as arguments, and the same run_id
        # is what create_event/request_approval use to set
        # AgentRun.event_id / Approval.agent_run_id deterministically — no
        # "newest event" heuristic needed.
        strands_agent = agent_module.build_agent(organization_id, run_id=run_id)
        response = strands_agent(message)

        db.refresh(run)  # pick up event_id set synchronously by a tool call during this turn
        pending_approval = (
            db.query(models.Approval)
            .filter(models.Approval.agent_run_id == run_id, models.Approval.status == "pending")
            .first()
        )
        if pending_approval:
            run.status = "paused_for_approval"
        else:
            run.status = "completed"
            if run.event_id:
                event = db.query(models.Event).filter(models.Event.id == run.event_id).first()
                if event and event.status == "draft":
                    event.status = "confirmed"
        run.result_text = str(response)
        run.updated_at = datetime.utcnow()
        db.commit()
    except Exception as exc:
        error_db = SessionLocal()
        try:
            run = error_db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
            if run:
                run.status = "failed"
                run.error = str(exc)
                run.updated_at = datetime.utcnow()
                error_db.commit()
        finally:
            error_db.close()
    finally:
        db.close()


@app.post("/agent/run", response_model=schemas.AgentRunOut, status_code=202)
def start_agent_run(payload: schemas.AgentRunCreate, db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.id == payload.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    run = models.AgentRun(
        organization_id=payload.organization_id,
        message=payload.message,
        status="queued",
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    thread = threading.Thread(
        target=_run_agent_job,
        args=(run.id, payload.message, payload.organization_id),
        daemon=True,
    )
    thread.start()

    return run


@app.get("/agent/run/{run_id}", response_model=schemas.AgentRunOut)
def get_agent_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(models.AgentRun).filter(models.AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return run


@app.get("/agent/run", response_model=List[schemas.AgentRunOut])
def list_agent_runs(organization_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.AgentRun).order_by(models.AgentRun.created_at.desc())
    if organization_id is not None:
        query = query.filter(models.AgentRun.organization_id == organization_id)
    return query.all()
