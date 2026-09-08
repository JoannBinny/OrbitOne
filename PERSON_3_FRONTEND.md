# Person 3 — Frontend

Read PROJECT_CONTEXT.md first. This file is your specific job.

## What you own

The UI: dashboard, event flow, approval screen, task screen, activity log, and wiring all of it to the real backend. Visual polish matters for the "Design" scoring criterion, but a working connection to real data matters more than how it looks.

## Screens (don't build more than this)

- Dashboard
- New Event (the "what do you need to organize?" input)
- Event Details (shows recommended location, tasks, budget)
- Approvals (shows pending approvals, approve/reject buttons)
- Tasks
- Activity Log (the audit trail — see note below)

## Main user flow to build toward

```
"What do you need to organize?"
[ Organize a Python workshop for 40 students... ]
        [Let OrbitOne Handle It]

↓

OrbitOne is working...
✓ Understanding request
✓ Checking available locations
✓ Checking policies
✓ Creating tasks
✓ Estimating budget

↓

PYTHON WORKSHOP
40 participants, 2:00–4:00 PM
Recommended Location: Computer Lab 2
Tasks: Prepare equipment, Prepare registration, Confirm coordinator
```

## Activity log — make this a strength, not an afterthought

Most agent hackathon projects show a chat bubble and stop there. Showing the actual sequence of tool calls as they happen (checked availability → found conflict → searched alternatives → budget calculated → approval requested) is what makes this look like a real agent instead of a chatbot with extra steps. If you have any spare time, put it here.

## Dependencies

You are blocked on Person 2's endpoints being stable. Don't start wiring real screens until an endpoint is confirmed working in `/docs`. Until then, prep the screen structure and static layout so you're not idle.

## Antigravity note

When generating frontend code, give Antigravity the real API contract (endpoint list, request/response shapes, actual seed data examples) before it writes anything, plus this instruction explicitly:

> Do not create dummy data. Do not create fake APIs. Use the existing FastAPI backend as the source of truth. If an API doesn't exist yet, report it as missing instead of mocking it.

After it generates a screen, check that it's actually calling the backend endpoint and rendering the real response, not rendering a placeholder that looks identical in a demo. This is easy to miss because a well-styled fake screen looks exactly like a working one until you check the network request.

## Testing you own

API integration, loading states, error states, the approve/reject flow actually changing state on the backend (not just visually), and basic responsive layout.

## Your piece of the timeline

- Sep 4–5: screen sketches, frontend project skeleton, no real data yet.
- Sep 6–8: wait on Person 2, keep static layouts ready.
- Sep 9–10: start wiring the simplest screens (event list, task list) to real, stable endpoints.
- Sep 11–12: all 3 demo scenarios visible and working in the UI end to end.
- Sep 13: polish, especially the activity log.
