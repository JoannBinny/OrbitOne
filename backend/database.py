from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./orbitone.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def upgrade_schema():
    """Apply additive schema changes to existing local SQLite databases."""
    columns = {column["name"] for column in inspect(engine).get_columns("approvals")}
    if "agent_run_id" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE approvals ADD COLUMN agent_run_id INTEGER")
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
