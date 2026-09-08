from sqlalchemy.orm import Session
import models


def get_budget_threshold(db: Session, organization_id: int) -> float:
    policy = (
        db.query(models.Policy)
        .filter(models.Policy.organization_id == organization_id)
        .first()
    )
    if policy is None:
        return float("inf")
    return policy.budget_threshold
