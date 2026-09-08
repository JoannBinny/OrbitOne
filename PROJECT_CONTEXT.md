# OrbitOne — Project Context (read this first, all 3 people)

## What we're building

OrbitOne is an AI agent that handles repetitive event/organization coordination work. Instead of someone manually checking room availability, checking policy, creating tasks, estimating budget, asking for approval, and notifying people, they give OrbitOne one request:

> "Organize a Python workshop for 40 students tomorrow from 2–4 PM. We need computers and a projector."

OrbitOne figures out the steps, calls tools that hit our real backend and database, takes safe actions on its own, and asks a human when approval is actually needed (money over a threshold, external communication, irreversible actions).

This is NOT a chatbot that returns canned text. Every "decision" the agent makes has to come from a real tool call against real data.

## Hackathon requirements (Agents for Humans, AWS)

- Must be built with the **Strands Agents SDK**. This is the core scoring criterion (Technological Implementation) — genuine, non-trivial use of Strands, not a thin wrapper.
- Track: **Professional Agents** — an agent that makes someone dramatically better at work they already do (event/ops coordinators, in our case).
- AgentCore / AWS deployment strengthens the score but is **not required**. We are treating it as optional, only if time allows at the very end.
- Judged on: Technological Implementation, Design (complete coherent product, not just a proof of concept), Potential Impact (credible, specific problem/audience), Creativity & Originality, Presentation (demo video, clear pitch).
- Deadline: **September 15**.

## Architecture

```
User
 ↓
Frontend
 ↓
FastAPI
 ↓
Strands Agent
 ↓
Tools
 ↓
Real Database / Backend
 ↓
Actions
 ↓
Approval when needed
 ↓
Audit Log
 ↓
Frontend
```

The database is the single source of truth. No hardcoded rooms, events, tasks, approvals, or budgets anywhere in the agent or frontend code.

## The 3 roles (see your individual file for detail)

- **Person 1 — AI / Strands agent**: agent reasoning, tools, approval logic, agent↔backend integration.
- **Person 2 — Backend**: database, FastAPI endpoints, business logic (availability, policy, budget, approvals, audit).
- **Person 3 — Frontend**: dashboard, event flow UI, approval UI, activity log, wiring to the real backend.

Backend has to exist and be stable before the agent and frontend can build against it for real, so Person 2 is the critical path early on.

## We're using Antigravity to generate code

Because code is being generated rather than hand-written line by line, the single biggest risk is the generator quietly filling in dummy data, fake endpoints, or mocked logic to make something "work" on the first try. Before generating backend, agent, or frontend code, give Antigravity the real schema/API contract and these explicit instructions:

> Do not create dummy data. Do not create fake APIs. Do not hardcode rooms, events, tasks, approvals, bookings, policies, or budgets. Use the existing FastAPI backend as the source of truth. If an API doesn't exist yet, report it as missing instead of mocking it.

After generating anything, a human has to actually read it and trace at least one real call end to end (does it really query the DB / really call the API with the real key, or is there a stub still sitting in there). Do this early, not the night before the demo.

## API keys

Keys go in a `.env` file, never committed. Add `.env` to `.gitignore` before pasting any real key into a prompt or a file. Code should read keys from environment variables, not literal strings.

## The 3 demo scenarios (all three must work live, not just be narrated)

1. **Normal**: workshop request → agent finds a suitable room via real data → creates tasks.
2. **Conflict**: requested room unavailable → agent searches the database → recommends a real alternative with matching capacity/equipment.
3. **Approval**: estimated budget exceeds the policy threshold → agent requests human approval → human approves/rejects → agent continues.

## Timeline (today is September 4, deadline September 15)

| Dates | Focus |
|---|---|
| Sep 4–5 | Repo/env setup, shared requirements.txt. Person 2 starts DB schema + seed data. Person 1 gets a bare Strands agent responding (no tools yet). Person 3 sketches screens, sets up frontend project. |
| Sep 6–8 | Person 2 finishes and tests all API endpoints via `/docs`, no frontend needed yet. Person 1 builds real tools against those endpoints. Scenario 1 working end to end via a terminal script by end of Sep 8. |
| Sep 9–10 | Get scenarios 2 and 3 working (Person 1 + Person 2 together). Person 3 starts wiring frontend to real, stable endpoints, simplest screens first. |
| Sep 11–12 | Frontend covers all 3 scenarios visually. Full team tests request → tasks/budget/approval appearing correctly in the UI. |
| Sep 13 | Bug fixing, polish, make the audit log readable as a timeline. |
| Sep 14 | Record demo video (script it, under 5 min), write README, draw architecture diagram. |
| Sep 15 | Submit, buffer time built in. |

## Submission checklist

- README.md
- LICENSE
- Architecture diagram
- Source code (public GitHub repo)
- Setup instructions + environment variables documented
- Demo video, under 5 minutes, showing all 3 scenarios live
- (Optional, only if time allows) AWS/Bedrock/AgentCore deployment
