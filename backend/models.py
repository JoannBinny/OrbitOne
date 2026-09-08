from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    policies = relationship("Policy", back_populates="organization")
    events = relationship("Event", back_populates="organization")


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    has_computers = Column(Boolean, default=False)
    has_projector = Column(Boolean, default=False)
    has_whiteboard = Column(Boolean, default=False)
    has_microphone = Column(Boolean, default=False)

    bookings = relationship("Booking", back_populates="location")


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    location = relationship("Location", back_populates="bookings")


class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    budget_threshold = Column(Float, nullable=False)

    organization = relationship("Organization", back_populates="policies")


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    title = Column(String, nullable=False)
    participants = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    status = Column(String, default="draft")  # draft, confirmed, needs_approval

    organization = relationship("Organization", back_populates="events")
    tasks = relationship("Task", back_populates="event")
    budget_items = relationship("BudgetItem", back_populates="event")
    approvals = relationship("Approval", back_populates="event")
    actions = relationship("AgentAction", back_populates="event")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, done

    event = relationship("Event", back_populates="tasks")


class BudgetItem(Base):
    __tablename__ = "budget_items"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    label = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    event = relationship("Event", back_populates="budget_items")


class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    reason = Column(String, nullable=False)
    amount = Column(Float, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="approvals")


class AgentAction(Base):
    __tablename__ = "agent_actions"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="actions")
