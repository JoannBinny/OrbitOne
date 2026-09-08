# Person 2 — Backend

Read PROJECT_CONTEXT.md first. This file is your specific job.

## What you own

The database, the real project data, and every FastAPI endpoint. Business logic for location availability, policy checks, tasks, budget, approvals, and the audit log. You are the critical path — Person 1 and Person 3 both build against your endpoints, so getting this stable early matters more than making it fancy.

## Structure

```
backend/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── seed.py
└── services/
    ├── locations.py
    ├── policies.py
    ├── tasks.py
    ├── budget.py
    ├── approvals.py
    └── audit.py
```

Use SQLite locally, no need for anything heavier.

## Database entities

```
organizations
users
locations
bookings
policies
events
tasks
approvals
budget_items
agent_actions
```

Seed with real-feeling data, not placeholder text — e.g.:

- Innovation Hall — capacity 150, projector, microphone
- Computer Lab 2 — capacity 60, computers, projector
- Seminar Room 3 — capacity 40, projector, whiteboard

Include at least one policy with a budget threshold (e.g. anything over ₹5,000 needs approval) so scenario 3 has something real to check against.

## Endpoints to expose

```
GET  /locations
GET  /locations/available

GET  /events
POST /events

GET  /tasks
POST /tasks

GET  /approvals
POST /approvals/{id}/approve
POST /approvals/{id}/reject

GET  /activity

POST /agent/run
```

Test everything through `http://localhost:8000/docs` before anyone else touches it. The backend needs to work completely on its own, with no frontend and no agent, before you hand it off.

## Dependencies

None going in — you go first. Everyone else is blocked on you, so prioritize getting a minimal but real version of every endpoint live over polishing any single one.

## Testing you own

Booking conflicts (does requesting an unavailable room actually fail correctly), policy threshold logic, task creation, and approval state transitions (pending → approved/rejected).

## API keys / env

Anything sensitive (DB path, any external service key) goes in `.env`, and `.env` goes in `.gitignore` before the first commit. Don't let Antigravity write a real key into a committed file.

## Your piece of the timeline

- Sep 4–5: schema designed, seed data written.
- Sep 6–8: every endpoint above built and verified in `/docs`.
- Sep 9–10: whatever Person 1 needs for scenarios 2 and 3 (e.g. an endpoint returning alternative rooms, or the approval threshold check) — this is close collaboration time.
- Sep 11–13: support Person 3's frontend integration, fix bugs found during full-stack testing.
