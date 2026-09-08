from sqlalchemy.orm import Session
import models


def total_budget_for_event(db: Session, event_id: int) -> float:
    items = (
        db.query(models.BudgetItem)
        .filter(models.BudgetItem.event_id == event_id)
        .all()
    )
    return sum(item.amount for item in items)
