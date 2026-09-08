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
        models.Location(
            name="Innovation Hall", capacity=150,
            has_computers=False, has_projector=True, has_microphone=True,
        ),
        models.Location(
            name="Computer Lab 2", capacity=60,
            has_computers=True, has_projector=True,
        ),
        models.Location(
            name="Seminar Room 3", capacity=40,
            has_projector=True, has_whiteboard=True,
        ),
    ]
    db.add_all(locations)
    db.commit()

    print(f"Seeded organization id={org.id}, {len(locations)} locations, 1 policy (threshold ₹5000).")
    db.close()


if __name__ == "__main__":
    seed()
