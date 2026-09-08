import os
import requests
from strands import tool

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


@tool
def find_available_locations(
    start_time: str,
    end_time: str,
    min_capacity: int = 0,
    needs_computers: bool = False,
    needs_projector: bool = False,
) -> list:
    """Find real locations available for a given time window.

    Args:
        start_time: ISO 8601 datetime string, e.g. "2026-09-10T14:00:00"
        end_time: ISO 8601 datetime string, e.g. "2026-09-10T16:00:00"
        min_capacity: minimum number of people the room must fit
        needs_computers: whether the room must have computers
        needs_projector: whether the room must have a projector

    Returns:
        A list of available locations with their id, name, capacity, and equipment.
    """
    resp = requests.get(
        f"{BACKEND_URL}/locations/available",
        params={
            "start_time": start_time,
            "end_time": end_time,
            "min_capacity": min_capacity,
            "needs_computers": needs_computers,
            "needs_projector": needs_projector,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


@tool
def create_event(
    organization_id: int,
    title: str,
    participants: int,
    start_time: str,
    end_time: str,
    location_id: int = None,
) -> dict:
    """Create a real event and, if a location_id is given, book that room for it.

    Args:
        organization_id: id of the organization this event belongs to
        title: short title for the event
        participants: expected number of participants
        start_time: ISO 8601 datetime string
        end_time: ISO 8601 datetime string
        location_id: id of the chosen location, if one has been picked

    Returns:
        The created event record, including its id.
    """
    payload = {
        "organization_id": organization_id,
        "title": title,
        "participants": participants,
        "start_time": start_time,
        "end_time": end_time,
        "location_id": location_id,
    }
    resp = requests.post(f"{BACKEND_URL}/events", json=payload, timeout=10)
    resp.raise_for_status()
    return resp.json()


@tool
def create_task(event_id: int, title: str) -> dict:
    """Create a real task attached to an event.

    Args:
        event_id: id of the event this task belongs to
        title: short description of the task, e.g. "Prepare equipment"

    Returns:
        The created task record.
    """
    resp = requests.post(
        f"{BACKEND_URL}/tasks", json={"event_id": event_id, "title": title}, timeout=10
    )
    resp.raise_for_status()
    return resp.json()


@tool
def get_pending_tasks(event_id: int = None) -> list:
    """Get tasks that still need to be done, optionally filtered to one event.

    Args:
        event_id: id of the event to filter by, or omit for all tasks

    Returns:
        A list of task records.
    """
    params = {"event_id": event_id} if event_id is not None else {}
    resp = requests.get(f"{BACKEND_URL}/tasks", params=params, timeout=10)
    resp.raise_for_status()
    tasks = resp.json()
    return [t for t in tasks if t["status"] == "pending"]


@tool
def add_budget_item(event_id: int, label: str, amount: float) -> dict:
    """Add a real budget line item to an event.

    Args:
        event_id: id of the event this cost belongs to
        label: short description, e.g. "Catering"
        amount: cost amount (same currency the organization budgets use)

    Returns:
        The created budget item record.
    """
    resp = requests.post(
        f"{BACKEND_URL}/budget-items",
        json={"event_id": event_id, "label": label, "amount": amount},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


@tool
def get_budget_status(event_id: int) -> dict:
    """Get the real running budget total for an event and whether it needs approval.

    Args:
        event_id: id of the event to check

    Returns:
        A dict with total, threshold, and requires_approval (bool), all computed
        from real budget items and the organization's real policy threshold.
    """
    resp = requests.get(f"{BACKEND_URL}/events/{event_id}/budget-total", timeout=10)
    resp.raise_for_status()
    return resp.json()


@tool
def request_approval(event_id: int, reason: str, amount: float = None) -> dict:
    """Create a real pending approval request. Use this instead of assuming approval.

    Args:
        event_id: id of the event needing approval
        reason: why approval is needed, e.g. "Budget exceeds organization threshold"
        amount: the amount in question, if relevant

    Returns:
        The created approval record, with status "pending".
    """
    resp = requests.post(
        f"{BACKEND_URL}/approvals",
        json={"event_id": event_id, "reason": reason, "amount": amount},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


@tool
def get_pending_approvals() -> list:
    """Get all approvals still waiting on a human decision.

    Returns:
        A list of pending approval records.
    """
    resp = requests.get(f"{BACKEND_URL}/approvals", params={"status": "pending"}, timeout=10)
    resp.raise_for_status()
    return resp.json()


@tool
def record_agent_action(action: str, details: str = None, event_id: int = None) -> dict:
    """Log a meaningful reasoning step to the real audit trail (beyond what's
    logged automatically when you create things). Use this for steps like
    recommending an alternative room, so the activity log tells the full story.

    Args:
        action: short label for what happened, e.g. "recommended_alternative"
        details: a sentence explaining it
        event_id: id of the related event, if any

    Returns:
        The created audit log entry.
    """
    resp = requests.post(
        f"{BACKEND_URL}/activity",
        json={"action": action, "details": details, "event_id": event_id},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
