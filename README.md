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

- Existing room bookings (overlapping `Booking` rows)
- Insufficient room capacity
- Missing equipment
- Scheduling conflicts

**Not implemented in this MVP:** booking-notice-period checks and any other
organization-specific policy beyond the budget threshold — no such policies exist in
the data model yet.

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

Tasks currently have only a `title` and a `status` (`pending`/`done`). Owners, due
dates, and priorities are **planned, not implemented**.

---

### Budget Estimation

OrbitOne can estimate event expenses and compare them against organizational budget
policies — via the LLM's own reasoning plus the real `add_budget_item` and
`get_budget_status` tools, not a dedicated `estimate_budget` tool (see Agent Tools
below for what actually exists).

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
- Retrieve budget/policy thresholds
- Create tasks
- Add budget line items
- Hold a room for the requested time slot (creates a real `Booking` so a second
  request can't double-book it — see "Reservation Semantics" note below)
- Suggest alternatives
- Update event status (`draft` → `needs_approval`/`confirmed`/`cancelled`)

#### Approval required

- Spending/committing budget above the organization's threshold
- Confirming an event whose budget requires approval (the event stays
  `needs_approval` — not `confirmed` — until a human decides)

**Not implemented in this MVP** (listed here so the gap is explicit, not silently
dropped): sending external messages, drafting communications, sharing sensitive
information, and any approval gate on the room hold itself. The room hold (`Booking`
row) is created immediately when the event is created, specifically so that a second
concurrent request can't book the same slot — approval governs the *spend*, not the
reservation. If the approval is rejected, that booking is deleted, releasing the room.

This keeps the system useful without removing human control.

---

### Draft Communication (planned, not implemented)

Generating event announcements, reminders, or internal notifications is not built in
this MVP — there is no `draft_notification` tool or equivalent. Approval requests
themselves are real (`request_approval`), but they are structured `Approval` records,
not drafted messages.

---

### Background Task Monitoring

OrbitOne can identify pending tasks (via `get_pending_tasks`), globally or for one
event. **Not implemented in this MVP:** tasks have no due date, so there is no
"overdue" or "approaching deadline" concept, and no reminder-drafting capability
exists yet.

---

### Audit Trail

Every important agent action can be recorded in an activity log (the `AgentAction` /
`GET|POST /activity` model).

The audit trail actually stores, per row:

- `action` — a short label (e.g. `event_created`, `approval_approved`)
- `details` — a free-text description (may summarize an input/outcome, but is not a
  separate structured field for tool input/output)
- `event_id` — which event the action relates to, if any
- `timestamp`

It does **not** currently store, as separate fields: the original user request, which
tool was called, structured tool input/output, a distinct "action status," or a
distinct "approval status" beyond what's implied by the `action` label itself
(`approval_requested` / `approval_approved` / `approval_rejected`). Anything beyond
those four fields is planned, not implemented, in this MVP.

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

OrbitOne is designed around domain-specific tools that allow the AI agent to interact
with the organization's data. These are the 9 tools that actually exist, built by
`agent/tools.py::build_tools(organization_id, run_id)` — `organization_id` and
`run_id` are injected directly into each tool as a closure rather than being arguments
the model has to supply, so the agent can never accidentally query or write another
organization's data by getting an id wrong.

### `find_available_locations`

Finds verified locations (scoped to the caller's organization) that satisfy capacity,
equipment (computers/projector), and time-window availability, excluding anything with
a conflicting booking.

### `create_event`

Creates a real event and, if a `location_id` is given, books that room for it
(organization id and the originating agent run id are attached automatically).

### `create_task`

Creates a task with a `title`, attached to an event. The `Task` model currently only
has `title` and `status` (`pending`/`done`) — owner, due date, and priority are
**planned, not implemented**.

### `get_pending_tasks`

Retrieves tasks with `status == "pending"`, optionally filtered to one event. There is
no separate "overdue" concept — no task has a due date to be overdue against yet.

### `add_budget_item`

Adds a real budget line item (label + amount) to an event.

### `get_budget_status`

Returns the real running budget total for an event, the organization's policy
threshold, and whether it's exceeded.

### `request_approval`

Creates a real pending `Approval` record tied to the event and to the agent run that
requested it, so approving/rejecting it later can resume or terminate that same run.

### `get_pending_approvals`

Retrieves approvals still awaiting a human decision, scoped to the caller's
organization.

### `record_agent_action`

Logs a reasoning step to the audit trail (see Audit Trail above for exactly what's
stored).

### Planned, not implemented in this MVP

`estimate_budget` (budgets are estimated by the LLM's own reasoning plus
`add_budget_item`/`get_budget_status`, not a dedicated calculation tool),
`draft_notification` (no announcement/reminder drafting tool exists),
`get_organization_policy` (there is no direct policy-lookup tool; the budget threshold
is only reachable indirectly through `get_budget_status`).

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

### Approval Continuation (real, not simulated)

When `request_approval` is called during a run, that `AgentRun` is marked
`paused_for_approval` (not `completed`) and the `Approval` record stores the
`agent_run_id` that requested it. The event's own status becomes `needs_approval`.

- **Approve** (`POST /approvals/{id}/approve`): the event's status becomes `confirmed`,
  and if the linked run is still `paused_for_approval`, a **second, real Strands agent
  turn** is started on a background thread against that same `AgentRun` row. It's told
  exactly what was approved and for which event, and continues the same workflow (e.g.
  creating remaining tasks) before the run is finally marked `completed`.
- **Reject** (`POST /approvals/{id}/reject`): the event's status becomes `cancelled`,
  its room booking is deleted (releasing the slot for other requests), and the run is
  marked `rejected` — no further agent turn runs.

**Known limitation:** there is no persisted in-memory conversation/session carried
across the pause. The resuming turn is a fresh `Agent` instance, not a literal resume
of the first turn's internal state — Strands doesn't expose a serializable session
store for this, and building one was out of scope for this MVP. What *is* real: the
same `AgentRun` database row, the same event, and a genuine second LLM call with real
tool execution — not a frontend-simulated "continuation."

---

## Data and Organization Model

OrbitOne is designed to work with organization-specific data.

For the MVP, the seeded organization is (see `backend/seed.py`, real integer `id`,
not a string slug):

```text
Organization: Christ University CS Dept
Organization ID: 1
```

Example locations include (12 total, see `backend/seed.py`):

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

The only policy that actually exists is a per-organization budget threshold:

```text
Spending above ₹5,000 requires additional approval.
```

"Events with more than 50 participants require faculty approval" and "room requests
require 3 days' notice" are **not implemented** — there is no participant-count policy
and no booking-notice-period check anywhere in the backend or agent.

### Organization Isolation

`Location` (via its own `organization_id`), `Event` (`organization_id`), and
`Task`/`Approval`/`AgentAction` (scoped indirectly through their parent `Event`) are
all attachable to exactly one organization. `GET /locations`, `/locations/available`,
`/events`, `/tasks`, `/approvals`, and `/activity` all accept an optional
`organization_id` query parameter that filters to that organization (omitting it
preserves the old unfiltered behavior for backward compatibility). The agent's tools
never take `organization_id` as an LLM-supplied argument — it's injected directly by
`agent/tools.py::build_tools(organization_id, run_id)` when the run starts, so a
request against one organization cannot read or write another organization's rooms,
events, tasks, or approvals.

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



## License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.


## Project Tagline

> **OrbitOne: One agent. Every moving part.**
