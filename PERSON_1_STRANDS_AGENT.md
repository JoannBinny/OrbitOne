# Person 1 — AI / Strands Agent

Read PROJECT_CONTEXT.md first. This file is your specific job.

## What you own

The agent itself: reasoning, tools, approval decisions, and the integration between the agent and Person 2's backend. You're also responsible for final end-to-end testing once all three pieces connect.

## Setup

```bash
pip install strands-agents
pip install strands-agents-tools
```

Structure:

```
agent/
├── __init__.py
├── agent.py
├── prompts.py
└── tools.py
```

## Build order

**Step 1 — bare agent.** Get a Strands agent responding to a plain text request with no tools at all. Confirm the model call works before adding any complexity.

**Step 2 — tools, one at a time, against the REAL backend.** Do not write a tool that returns a hardcoded list. Every tool should make an HTTP call to Person 2's FastAPI endpoints and return whatever comes back.

Build tools in this order:

1. `find_available_locations` — hits `GET /locations/available`
2. `get_organization_policy` — hits the policy endpoint
3. `create_task` — hits `POST /tasks`
4. `estimate_budget` — calculates against real budget data, not a fixed number
5. `request_approval` — hits `POST /approvals`
6. `get_pending_tasks`
7. `record_agent_action` — writes to the audit log, this needs to run after every meaningful step
8. `draft_notification` (lower priority, only if time allows)

**Step 3 — wire the 3 demo scenarios.** Test each one as a standalone script before the frontend exists:

- Scenario 1 (normal): request → find room → create tasks → done.
- Scenario 2 (conflict): requested room taken → search alternatives → recommend one with matching capacity/equipment, don't just say "unavailable."
- Scenario 3 (approval): budget estimate exceeds the policy threshold → `request_approval` → wait for human decision → continue or stop based on the result.

## Dependencies

You need Person 2's endpoints to be real and stable before your tools mean anything. Coordinate with them daily on what's live in `/docs`. Until an endpoint exists, don't fake its response in your tool — wait, or build the next tool that doesn't depend on it yet.

## Testing you own

Agent reasoning across all 3 scenarios, tool call correctness, approval logic (does it actually stop and wait, not just log that it should have), and failure handling (what happens if a tool call fails or returns nothing).

## Antigravity note

If any of this agent code is generated rather than hand-written, check every tool function individually — confirm it's making a real call to Person 2's API and not returning a stub value that happens to look right in one test. This is the easiest place for a generator to quietly fake something, because a fake tool response is indistinguishable from a real one in a quick demo run.

## Your piece of the timeline

- Sep 4–5: bare agent working, no tools.
- Sep 6–8: all core tools built and tested individually against real endpoints.
- Sep 8: scenario 1 working end to end via a script.
- Sep 9–10: scenarios 2 and 3 working, working closely with Person 2.
- Sep 11–12: support Person 3 wiring the frontend to agent output.
- Sep 13: bug fixes, edge cases (what if no room fits, what if approval is rejected).
