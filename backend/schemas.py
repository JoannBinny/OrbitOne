from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LocationOut(BaseModel):
    id: int
    organization_id: int
    name: str
    capacity: int
    has_computers: bool
    has_projector: bool
    has_whiteboard: bool
    has_microphone: bool

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    organization_id: int
    title: str
    participants: int
    start_time: datetime
    end_time: datetime
    location_id: Optional[int] = None
    agent_run_id: Optional[int] = None


class EventOut(BaseModel):
    id: int
    organization_id: int
    title: str
    participants: int
    start_time: datetime
    end_time: datetime
    location_id: Optional[int]
    status: str

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    event_id: int
    title: str


class TaskUpdate(BaseModel):
    status: str


class TaskOut(BaseModel):
    id: int
    event_id: int
    title: str
    status: str

    class Config:
        from_attributes = True


class ApprovalOut(BaseModel):
    id: int
    event_id: int
    reason: str
    amount: Optional[float]
    status: str
    created_at: datetime
    agent_run_id: Optional[int] = None

    class Config:
        from_attributes = True


class ApprovalCreate(BaseModel):
    event_id: int
    reason: str
    amount: Optional[float] = None
    agent_run_id: Optional[int] = None


class BudgetItemCreate(BaseModel):
    event_id: int
    label: str
    amount: float


class BudgetItemOut(BaseModel):
    id: int
    event_id: int
    label: str
    amount: float

    class Config:
        from_attributes = True


class AgentActionOut(BaseModel):
    id: int
    event_id: Optional[int]
    action: str
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class AgentActionCreate(BaseModel):
    event_id: Optional[int] = None
    action: str
    details: Optional[str] = None


class OrganizationOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class AgentRunCreate(BaseModel):
    organization_id: int
    message: str


class AgentRunOut(BaseModel):
    id: int
    organization_id: int
    message: str
    status: str
    result_text: Optional[str]
    event_id: Optional[int]
    error: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
