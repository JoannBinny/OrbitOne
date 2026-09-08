from sqlalchemy.orm import Session
import models


def log_action(db: Session, action: str, details: str = None, event_id: int = None):
    entry = models.AgentAction(event_id=event_id, action=action, details=details)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
