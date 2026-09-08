from sqlalchemy.orm import Session
from datetime import datetime
import models


def get_available_locations(
    db: Session,
    start_time: datetime,
    end_time: datetime,
    min_capacity: int = 0,
    needs_computers: bool = False,
    needs_projector: bool = False,
):
    query = db.query(models.Location).filter(models.Location.capacity >= min_capacity)

    if needs_computers:
        query = query.filter(models.Location.has_computers == True)  # noqa: E712
    if needs_projector:
        query = query.filter(models.Location.has_projector == True)  # noqa: E712

    candidates = query.all()

    available = []
    for loc in candidates:
        conflicting = (
            db.query(models.Booking)
            .filter(
                models.Booking.location_id == loc.id,
                models.Booking.start_time < end_time,
                models.Booking.end_time > start_time,
            )
            .first()
        )
        if not conflicting:
            available.append(loc)

    return available
