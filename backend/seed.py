from database import Base, engine, SessionLocal
import models


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.Organization).first():
        print("Already seeded, skipping.")
        db.close()
        return

    org = models.Organization(name="Christ University CS Dept")
    db.add(org)
    db.commit()
    db.refresh(org)

    policy = models.Policy(organization_id=org.id, budget_threshold=5000)
    db.add(policy)

    locations = [
        # Auditoriums — large capacity, presentation-ready
        models.Location(
            name="Innovation Hall", capacity=150,
            has_computers=False, has_projector=True, has_microphone=True,
        ),
        models.Location(
            name="Main Auditorium", capacity=300,
            has_computers=False, has_projector=True, has_microphone=True,
        ),

        # Computer labs — for hands-on technical sessions
        models.Location(
            name="Computer Lab 2", capacity=60,
            has_computers=True, has_projector=True,
        ),
        models.Location(
            name="Computer Lab 3", capacity=45,
            has_computers=True, has_projector=True,
        ),

        # Classrooms — general teaching spaces
        models.Location(
            name="Seminar Room 3", capacity=40,
            has_projector=True, has_whiteboard=True,
        ),
        models.Location(
            name="Classroom 101", capacity=35,
            has_projector=True, has_whiteboard=True,
        ),
        models.Location(
            name="Classroom 204", capacity=50,
            has_projector=True, has_whiteboard=True,
        ),

        # Meeting rooms — small, discussion-focused
        models.Location(
            name="Meeting Room A", capacity=10,
            has_projector=True, has_whiteboard=True,
        ),
        models.Location(
            name="Meeting Room B", capacity=15,
            has_projector=True, has_whiteboard=True, has_microphone=True,
        ),
        models.Location(
            name="Boardroom", capacity=12,
            has_projector=True, has_microphone=True,
        ),

        # Outdoor areas — no built-in equipment, but real bookable spaces
        models.Location(
            name="Central Lawn", capacity=200,
            has_computers=False, has_projector=False, has_microphone=False,
        ),
        models.Location(
            name="Amphitheater", capacity=100,
            has_computers=False, has_projector=False, has_microphone=True,
        ),
    ]
    db.add_all(locations)
    db.commit()

    print(f"Seeded organization id={org.id}, {len(locations)} locations, 1 policy (threshold ₹5000).")
    db.close()


if __name__ == "__main__":
    seed()
