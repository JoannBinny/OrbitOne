# OrbitOne

### One agent. Every moving part.

**OrbitOne** is an autonomous AI operations agent designed to automate repetitive coordination work for student clubs, project teams, and small organizations.

Instead of manually checking room availability, creating tasks, estimating budgets, preparing announcements, tracking deadlines, and requesting approvals, users can give OrbitOne a single natural-language request. The agent interprets the request, retrieves verified organization data, uses the appropriate tools, performs low-risk actions automatically, and asks a human for approval whenever an important or irreversible decision is required.

> **Turn a messy request into a completed, trackable plan while keeping humans in control.**

---

## Overview

Organizing a workshop, meeting, or campus event often involves many small administrative tasks:

- Finding an appropriate room
- Checking room availability
- Verifying capacity and equipment
- Detecting scheduling conflicts
- Creating preparation tasks
- Estimating expenses
- Checking budget policies
- Preparing announcements
- Requesting faculty or organizational approval
- Tracking pending and overdue tasks
- Maintaining an activity history

OrbitOne brings these processes together through an AI agent that can reason about the request and interact with real backend tools.

Unlike a traditional chatbot, OrbitOne does not simply generate a response.

It follows an execution loop:

```text
User Request
     ↓
AI Reasoning
     ↓
Tool Selection
     ↓
Real Backend / Database
     ↓
Action
     ↓
Approval if Required
     ↓
Completion
     ↓
Audit Log
```

---

## Key Features

### Natural Language Event Requests

Users can describe an event naturally instead of filling out multiple forms.

Example:

```text
Organize a web development workshop for 55 students
on September 11 from 10 AM to 1 PM.
We need computers and a projector.
```

OrbitOne extracts relevant information such as:

- Event name
- Date
- Time
- Participant count
- Location requirements
- Required equipment
- Budget requirements
- Approval requirements

---

### Intelligent Location Search

OrbitOne searches verified organization data to find suitable locations based on:

- Capacity
- Date and time
- Required equipment
- Event type
- Booking status
- Organization

It can also identify why a location is unsuitable.

For example:

```text
Innovation Hall is unavailable during the requested time.

Seminar Room 3 is available but cannot accommodate
55 participants.

Computer Lab 2 is available and supports 60 participants
with computers and a projector.
```

---

### Conflict Detection

OrbitOne can detect:

- Existing room bookings
- Insufficient room capacity
- Missing equipment
- Scheduling conflicts
- Insufficient booking notice
- Other organization-specific policy violations

When a conflict occurs, OrbitOne searches for verified alternatives instead of simply reporting the problem.

---

### Automated Task Generation

The agent can create internal preparation tasks such as:

- Request faculty approval
- Reserve the room
- Confirm the speaker
- Arrange equipment
- Order refreshments
- Publish announcement
- Collect attendance
- Submit expense report

Tasks can contain owners, due dates, priorities, and statuses.

---

### Budget Estimation

OrbitOne can estimate event expenses and compare them against organizational budget policies.

For example:

```text
Estimated refreshments: ₹4,500
Equipment: ₹1,000
Miscellaneous: ₹750

Estimated total: ₹6,250

Organization approval threshold: ₹5,000

Additional approval required.
```

---

### Human-in-the-Loop Approvals

OrbitOne is autonomous where it is safe to be autonomous.

Actions involving significant consequences require human approval.

#### Automatically handled

- Extract event details
- Check availability
- Retrieve policies
- Create internal draft tasks
- Calculate estimates
- Draft communications
- Detect overdue tasks
- Suggest alternatives
- Update internal statuses

#### Approval required

- Sending external messages
- Finalizing room reservations
- Cancelling or modifying bookings
- Spending or approving money
- Sharing sensitive information
- Making irreversible changes
- Committing the organization to an external arrangement

This keeps the system useful without removing human control.

---

### Draft Communication

OrbitOne can generate:

- Event announcements
- Faculty approval requests
- Reminders
- Internal notifications

In the MVP, these are prepared as drafts rather than being automatically sent to real recipients.

---

### Background Task Monitoring

OrbitOne can identify:

- Pending tasks
- Overdue tasks
- Approaching deadlines
- Incomplete event preparation

It can prepare reminders and surface work that requires attention.

---

### Audit Trail

Every important agent action can be recorded in an activity log.

The audit trail captures information such as:

- User request
- Agent action
- Tool used
- Tool input
- Tool result
- Timestamp
- Action status
- Approval status
- Failures

This makes the agent's behavior traceable and transparent.

---

## Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         │ Student / Organizer │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Web Frontend     │
                         │ Dashboard / UI      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         │ API + Business Logic│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    OrbitOne Agent   │
                         │   Strands Agents    │
                         │        SDK          │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
     │ Location Tools │   │   Task Tools   │   │  Budget Tools  │
     │ Availability   │   │ Task Creation  │   │ Cost Estimates │
     │ Conflict Check │   │ Task Tracking  │   │ Policy Checks  │
     └────────┬───────┘   └────────┬───────┘   └────────┬───────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │    SQLite / Data    │
                         │ Organizations       │
                         │ Locations           │
                         │ Bookings            │
                         │ Tasks               │
                         │ Policies            │
                         │ Approvals            │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Approval + Audit    │
                         │       System        │
                         └─────────────────────┘
```

The architecture is designed around a key principle:

> **The database is the source of truth. The AI should never invent organization-specific information.**

---

## Technology Stack

| Component | Technology |
|---|---|
| AI Agent | Strands Agents SDK |
| Agent Tools | Python |
| Backend | FastAPI |
| Database | SQLite |
| Frontend | Web-based frontend |
| API Communication | REST |
| Configuration | Environment variables |
| Version Control | Git / GitHub |
| License | MIT |

OrbitOne uses the **Strands Agents SDK** as the core agent framework rather than implementing a simple chatbot wrapper. The agent dynamically selects tools based on the user's request.

---

## Agent Tools

OrbitOne is designed around domain-specific tools that allow the AI agent to interact with the organization's data.

### `find_available_locations`

Finds verified locations that satisfy:

- Capacity requirements
- Equipment requirements
- Date and time
- Event requirements
- Booking availability

### `create_task`

Creates internal tasks with:

- Task owner
- Due date
- Priority
- Status

### `estimate_budget`

Calculates estimated costs and checks them against organization budget policies.

### `draft_notification`

Creates drafts for:

- Announcements
- Reminders
- Approval requests

### `request_approval`

Creates a pending approval request when human authorization is required.

### `get_pending_tasks`

Retrieves incomplete or overdue tasks.

### `get_organization_policy`

Retrieves organization-specific policies such as:

- Budget thresholds
- Approval requirements
- Booking notice periods

### `record_agent_action`

Records agent activity for transparency and auditing.

---

## Example Workflow

Consider the following request:

```text
Organize a Python workshop for 40 students tomorrow
from 2 PM to 4 PM. We need computers and a projector.
```

OrbitOne processes the request through the following steps:

```text
1. Understand the request
          ↓
2. Extract event requirements
          ↓
3. Identify the organization
          ↓
4. Search available locations
          ↓
5. Check capacity and equipment
          ↓
6. Detect scheduling conflicts
          ↓
7. Recommend the best verified location
          ↓
8. Check organization policies
          ↓
9. Create preparation tasks
          ↓
10. Estimate budget
          ↓
11. Draft required communications
          ↓
12. Request approval if required
          ↓
13. Record actions in the audit log
```

---

## Human-in-the-Loop Design

OrbitOne follows a risk-based autonomy model.

```text
                    User Request
                         │
                         ▼
                  Agent Reasoning
                         │
             ┌───────────┴───────────┐
             │                       │
       Low-risk action         High-risk action
             │                       │
             ▼                       ▼
       Execute directly       Request approval
             │                       │
             │                 ┌─────┴─────┐
             │                 │           │
             │              Approve      Reject
             │                 │           │
             └────────────┬────┘           │
                          ▼                ▼
                       Continue        Stop / Revise
                          │
                          ▼
                     Audit Log
```

This approach allows OrbitOne to automate repetitive work while ensuring that humans remain responsible for important decisions.

---

## Demo Scenarios

The project is designed around three core scenarios.

### 1. Normal Event

A user submits a workshop request.

OrbitOne:

1. Understands the request
2. Searches real organization data
3. Finds a suitable room
4. Creates preparation tasks
5. Continues the workflow

---

### 2. Room Conflict

The requested room is unavailable.

OrbitOne:

1. Detects the conflict
2. Searches the database
3. Checks alternative locations
4. Filters alternatives by capacity and equipment
5. Recommends a verified alternative

---

### 3. Approval Required

An event exceeds an organization's approval threshold.

OrbitOne:

1. Calculates the estimated budget
2. Checks the organization policy
3. Detects that approval is required
4. Creates an approval request
5. Waits for the user's decision
6. Continues after approval

These scenarios demonstrate that OrbitOne is an operational agent rather than a simple conversational AI.

---

## Data and Organization Model

OrbitOne is designed to work with organization-specific data.

For the MVP, the project uses a fictional organization:

```text
Organization: Orbit University
Organization ID: orbit-university-001
```

Example locations include:

```text
Innovation Hall
Capacity: 150
Equipment: Projector, Microphone

Computer Lab 2
Capacity: 60
Equipment: Computers, Projector

Seminar Room 3
Capacity: 40
Equipment: Projector, Whiteboard
```

Example policies include:

```text
Events with more than 50 participants require faculty approval.

Spending above ₹5,000 requires additional approval.

Room requests require at least 3 days' notice.
```

The important distinction is that this information is stored as organization data and accessed through tools. It is not hardcoded into the agent's reasoning.

---

## Project Structure

```text
OrbitOne/
│
├── agent/
│   └── Strands agent implementation
│
├── backend/
│   └── FastAPI backend
│
├── OrbitOne_Final_Project_Specification.md
├── PROJECT_CONTEXT.md
├── PERSON_1_STRANDS_AGENT.md
├── PERSON_2_BACKEND.md
├── PERSON_3_FRONTEND.md
├── LICENSE
└── README.md
```

The repository separates the major responsibilities into:

- AI / Strands Agent
- Backend / API and database
- Frontend / User experience

---

## Installation

### Prerequisites

Make sure the following are installed:

- Python 3.10+
- Git
- pip
- Node.js and npm, if using the frontend
- A supported LLM provider / API key

### Clone the repository

```bash
git clone https://github.com/JoannBinny/OrbitOne.git
cd OrbitOne
```

### Create a virtual environment

```bash
python -m venv .venv
```

Activate it on macOS / Linux:

```bash
source .venv/bin/activate
```

On Windows:

```bash
.venv\Scripts\activate
```

### Install Python dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file:

```env
MODEL_API_KEY=your_api_key_here
```

> Never commit `.env` or API keys to GitHub.

Add the following to `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

---

## Running the Backend

Start the FastAPI server using the project's backend entry point.

For example:

```bash
uvicorn backend.main:app --reload
```

The API should then be available at:

```text
http://localhost:8000
```

FastAPI's interactive API documentation can be accessed at:

```text
http://localhost:8000/docs
```

---

## Running the Agent

After configuring the environment and backend, start the OrbitOne agent using the project's agent entry point.

```bash
python agent/main.py
```

The exact command may vary depending on the final agent entry point.

---

## Running the Frontend

If the frontend is configured as a Node.js application:

```bash
cd frontend
npm install
npm run dev
```

The frontend can then communicate with the FastAPI backend through the configured API URL.

---

## Security

OrbitOne follows several important security principles:

- API keys are stored in environment variables.
- Secrets are never hardcoded.
- Organization data is isolated by organization ID.
- The agent must not invent organization-specific information.
- Sensitive or irreversible actions require approval.
- External communication requires explicit authorization.
- Financial actions require approval.
- Agent actions are recorded in an audit log.

---

## Design Principles

### 1. Real Tools, Not Fake Responses

The agent must use backend tools to obtain information.

It should never respond with invented rooms, budgets, bookings, or policies.

### 2. Database as the Source of Truth

Organization-specific information should come from the backend/database.

### 3. Autonomy With Boundaries

OrbitOne can perform low-risk repetitive work autonomously while escalating meaningful decisions.

### 4. Human Control

The user remains responsible for actions that involve money, external communication, sensitive information, or irreversible changes.

### 5. Transparency

Agent actions should be visible through the activity timeline and audit log.

---

## Future Improvements

OrbitOne's MVP focuses on reliable event coordination. Future versions could extend the platform with:

- Google Calendar integration
- Microsoft Outlook integration
- Slack / Microsoft Teams integration
- University ERP integration
- Email integration
- Real notification delivery
- Multi-organization SaaS support
- Advanced role-based access control
- File and document ingestion
- Calendar synchronization
- Automated recurring events
- Rich analytics and reporting
- Amazon Bedrock integration
- Amazon Bedrock AgentCore deployment
- Long-term organizational memory

The project specification specifically treats real external integrations and AgentCore deployment as future or optional extensions beyond the initial MVP.

---

## Why OrbitOne?

Traditional event coordination requires people to repeatedly switch between:

```text
Chat
 ↓
Spreadsheet
 ↓
Calendar
 ↓
Forms
 ↓
Email
 ↓
Task List
 ↓
Approval
 ↓
Back to Chat
```

OrbitOne aims to turn this into:

```text
One Request
     ↓
OrbitOne
     ↓
Coordinated Execution
     ↓
Human Approval When Needed
     ↓
Completed Event Plan
```

The goal is not to replace the coordinator.

The goal is to remove the repetitive coordination work so that the coordinator can focus on decisions that actually require human judgment.

---

## Hackathon

OrbitOne was developed for the **Agents for Humans** hackathon under the **Professional Agents** track.

The project uses the **Strands Agents SDK** as its core agent framework and focuses on building an AI agent that performs meaningful operational work for real users.

---

## Team

**OrbitOne**

Built by:

- Joann Binny
- Project Team

---

## License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

## Repository

**GitHub:**  
https://github.com/JoannBinny/OrbitOne

---

## Project Tagline

> **OrbitOne: One agent. Every moving part.**