from sqlalchemy.orm import Session
from typing import Optional
import models


def get_budget_threshold(db: Session, organization_id: int) -> Optional[float]:
    policy = (
        db.query(models.Policy)
        .filter(models.Policy.organization_id == organization_id)
        .first()
    )
    if policy is None:
        return None
    return policy.budget_threshold
