from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import Base, engine, get_db
import models
import schemas
from services import locations as location_service
from services import policies as policy_service
from services import budget as budget_service
from services import audit as audit_service

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrbitOne Backend")


# ---------- Locations ----------

@app.get("/locations", response_model=List[schemas.LocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()


@app.get("/locations/available", response_model=List[schemas.LocationOut])
def available_locations(
    start_time: datetime,
    end_time: datetime,
    min_capacity: int = 0,
    needs_computers: bool = False,
    needs_projector: bool = False,
    db: Session = Depends(get_db),
):
    return location_service.get_available_locations(
        db, start_time, end_time, min_capacity, needs_computers, needs_projector
    )


# ---------- Events ----------

@app.get("/events", response_model=List[schemas.EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()


@app.post("/events", response_model=schemas.EventOut)
def create_event(payload: schemas.EventCreate, db: Session = Depends(get_db)):
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

    audit_service.log_action(db, "event_created", f"Created event '{event.title}'", event.id)
    return event


# ---------- Tasks ----------

@app.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(event_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Task)
    if event_id is not None:
        query = query.filter(models.Task.event_id == event_id)
    return query.all()


@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Task(event_id=payload.event_id, title=payload.title, status="pending")
    db.add(task)
    db.commit()
    db.refresh(task)
    audit_service.log_action(db, "task_created", task.title, task.event_id)
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
def list_approvals(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Approval)
    if status:
        query = query.filter(models.Approval.status == status)
    return query.all()


@app.post("/approvals", response_model=schemas.ApprovalOut)
def create_approval(payload: schemas.ApprovalCreate, db: Session = Depends(get_db)):
    approval = models.Approval(
        event_id=payload.event_id, reason=payload.reason, amount=payload.amount, status="pending"
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    audit_service.log_action(db, "approval_requested", payload.reason, payload.event_id)
    return approval


@app.post("/approvals/{approval_id}/approve", response_model=schemas.ApprovalOut)
def approve(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = "approved"
    db.commit()
    db.refresh(approval)
    audit_service.log_action(db, "approval_approved", approval.reason, approval.event_id)
    return approval


@app.post("/approvals/{approval_id}/reject", response_model=schemas.ApprovalOut)
def reject(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = "rejected"
    db.commit()
    db.refresh(approval)
    audit_service.log_action(db, "approval_rejected", approval.reason, approval.event_id)
    return approval


# ---------- Activity / audit log ----------

@app.get("/activity", response_model=List[schemas.AgentActionOut])
def list_activity(event_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.AgentAction).order_by(models.AgentAction.timestamp.desc())
    if event_id is not None:
        query = query.filter(models.AgentAction.event_id == event_id)
    return query.all()


@app.post("/activity", response_model=schemas.AgentActionOut)
def record_activity(payload: schemas.AgentActionCreate, db: Session = Depends(get_db)):
    return audit_service.log_action(db, payload.action, payload.details, payload.event_id)
