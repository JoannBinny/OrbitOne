# OrbitOne — Final Project Specification

## 1. Project identity

**Project name:** OrbitOne  
**Tagline:** *One agent. Every moving part.*  
**Hackathon:** Agents for Humans  
**Required SDK:** Strands Agents SDK  
**Recommended track:** Professional Agents  
**Alternative track:** Good Neighbor Agents, if positioned for student communities or local organizations.

### One-line concept

OrbitOne is an autonomous AI operations agent that handles repetitive coordination work for student clubs, project teams, and small organizations, while asking humans for approval only when an important decision is required.

---

## 2. Hackathon requirements to remember

The project must be a genuine AI agent built with the **Strands Agents SDK**. It should perform real work end-to-end rather than acting only as a chatbot.

The important challenge requirements are:

- Handle routine and repetitive tasks for real people.
- Work autonomously in the background where possible.
- Surface itself only when a real decision is required.
- Submit a text description explaining what the project does, who it is for, and how it works.
- Provide a public URL to the source-code repository.
- Include all source code, assets, and setup instructions.
- Include a visible MIT or Apache open-source license.
- Include a README.
- Include an architecture diagram.
- Submit a demo video of no more than five minutes.
- The video must demonstrate the working project and explain the problem, audience, and importance.
- Include the AWS Builder ID.
- A live demo link is optional but can strengthen the technical score.
- Publishing a public build story on builder.aws.com with “Agents for Humans” in the title may earn bonus points.

The project will be judged on technological implementation, design, potential impact, creativity and originality, and presentation. A live demo and/or Amazon Bedrock AgentCore deployment may strengthen the technical implementation score, but AgentCore is not required.

The team has approximately **12 days**, not six weeks. The implementation must therefore prioritize one reliable, polished workflow over a large number of features.

---

## 3. Problem statement

Student clubs, project teams, and small organizations lose substantial time managing repetitive coordination work. A single event can require collecting details, checking rooms, requesting approval, arranging equipment, estimating expenses, assigning tasks, drafting announcements, sending reminders, and following up with people.

Each task is small, but together they drain time and attention. Work is often spread across chats, spreadsheets, forms, calendars, and verbal conversations. This causes missed deadlines, unclear responsibilities, delayed approvals, scheduling conflicts, and repeated manual data entry.

The problem is not that people cannot perform these tasks. The problem is that they repeatedly spend human attention on low-value administrative coordination.

---

## 4. Proposed solution

### What OrbitOne does

OrbitOne receives a natural-language request and turns it into an organized, trackable execution plan. It uses tools to check organization-specific information, creates tasks, estimates budgets, drafts communications, monitors pending work, and requests approval for sensitive or irreversible actions.

Example request:

> Organize a web development workshop for 60 students on September 12 from 10 AM to 1 PM. Find an available room, prepare the task list, estimate the refreshment cost, draft an announcement, and prepare the faculty approval request.

OrbitOne should:

1. Extract the event name, date, time, audience size, location requirements, equipment, budget, and approval needs.
2. Check the organization’s available locations.
3. Detect room or schedule conflicts.
4. Find suitable alternatives.
5. Estimate expenses.
6. Create preparation tasks.
7. Suggest or assign task owners.
8. Draft announcements and approval requests.
9. Track deadlines and incomplete work.
10. Prepare reminders for overdue tasks.
11. Record all agent actions.
12. Ask the user for approval when a meaningful decision is required.

### Product promise

> OrbitOne turns a messy request into a completed, trackable plan while keeping humans in control of important decisions.

### What makes it different from a chatbot

OrbitOne should not merely answer questions. It should:

- Select and call tools.
- Perform multiple steps.
- Update records.
- Track progress.
- Continue monitoring work.
- Escalate only meaningful decisions.
- Provide an audit trail of what happened.

The central loop is:

> **Input → reasoning → tool calls → background action → approval → completion**

---

## 5. Target users

### Primary target audience

For the hackathon demonstration, focus on **student clubs and project teams that organize workshops, meetings, and campus events**.

Potential future users include:

- Student club coordinators.
- College event organizers.
- Faculty coordinators.
- Hackathon and project teams.
- Small nonprofit teams.
- Community organizers.
- Small-business administrators.

### User persona

A student club coordinator wants to organize a workshop but must coordinate the room, faculty approval, volunteers, equipment, refreshments, announcement, and reminders. OrbitOne allows the coordinator to submit one request and receive a complete plan, with only important decisions requiring attention.

---

## 6. Real-world feasibility and organization-specific data

Every college has different rooms, equipment, calendars, budgets, and approval processes. OrbitOne should not pretend to know every campus automatically.

The correct design is a **configurable organization workspace**:

- The AI reasoning layer understands requests and decides which tools to use.
- The organization data layer stores verified rooms, capacities, equipment, bookings, budgets, and policies.
- Tools query the organization data and return authoritative results.
- The language model interprets the results but does not invent local facts.

OrbitOne should learn an organization through administrator configuration, uploaded data, or future integrations.

### Three ways to provide organization data

#### 1. Administrator setup

An administrator enters:

- Organization name.
- Buildings and rooms.
- Room capacity.
- Equipment.
- Operating hours.
- Booking rules.
- Budget limits.
- Approval requirements.
- Approval contacts.
- Holiday or examination schedules.

#### 2. File upload

A future version could accept CSV, Excel, PDF, calendar, and policy files. Extracted data should be verified by an administrator before it becomes authoritative.

#### 3. Direct integrations

A mature version could integrate with Google Calendar, Microsoft Outlook, university ERP systems, student portals, email, Slack, or Microsoft Teams. These integrations are out of scope for the initial 12-day MVP.

### Important principle

> **Hardcode the initial data, not the behavior.**

Use preloaded fictional university data for the hackathon, but store it in SQLite or JSON and access it through real tools. Do not write rules such as “if the request says workshop, always return Innovation Hall.”

### Unknown information policy

OrbitOne must never guess local facts.

If data is missing, it should say:

> I do not have verified information about locations matching those requirements. Please ask an administrator to add the organization’s location data or connect a booking calendar.

If a room’s capacity is missing:

> Room C204 exists in the organization directory, but its capacity is unverified. I cannot recommend it until an administrator confirms the capacity.

If the calendar is unavailable:

> I could not verify live availability because the calendar service is unavailable. I have not made a booking.

---

## 7. Recommended implementation approach for 12 days

Build a **hybrid system**:

- A lightweight administration side.
- A user side for submitting requests and approving decisions.
- One fictional university workspace with preloaded data.
- Database-backed configuration rather than agent-code hardcoding.
- A real Strands agent with custom tools.
- Mock calendar, booking, budget, and notification services.

Do not build a full multi-college SaaS platform or real payment and calendar integrations during the MVP.

### Fictional organization

Use:

```text
Organization: Orbit University
Organization ID: orbit-university-001
```

Sample locations:

```text
Innovation Hall
- Capacity: 150
- Equipment: projector, microphone
- Suitable for: seminars, workshops

Computer Lab 2
- Capacity: 60
- Equipment: computers, projector
- Suitable for: coding workshops

Seminar Room 3
- Capacity: 40
- Equipment: projector, whiteboard
- Suitable for: small meetings
```

Sample policies:

```text
- Events with more than 50 participants require faculty approval.
- Spending above ₹5,000 requires additional approval.
- Room requests require at least 3 days’ notice.
```

Sample bookings:

```text
- Innovation Hall is unavailable on the demo date from 10:00 AM to 1:00 PM.
- Computer Lab 2 is available.
- Seminar Room 3 is available but cannot hold more than 40 participants.
```

The fictional data is acceptable for a hackathon. The important point is that it is queried through the application rather than embedded in the agent’s response logic.

---

## 8. Administration side

The administration side should be small but real enough to demonstrate configurability.

### Admin features

- Set organization name.
- Add or edit a location.
- Set capacity and equipment.
- Add a booking.
- Set budget limits.
- Configure approval rules.
- View the last update date.
- Reset sample data for the demonstration.

Authentication can be simplified for the hackathon. A role switch or demo login is sufficient, provided the interface clearly distinguishes administrator and user behavior.

### Admin pages

#### Organization settings

- Organization name.
- Currency.
- Default budget limit.
- Minimum booking notice.

#### Locations

- Location name.
- Building.
- Capacity.
- Equipment.
- Availability status.

#### Bookings

- Location.
- Event name.
- Date.
- Start time.
- End time.
- Status.

#### Policies

- Participant threshold for approval.
- Spending threshold.
- Required approval role.
- Booking notice period.

---

## 9. User side

The user side should allow a student or organizer to:

- Submit a natural-language event request.
- View extracted details.
- See recommended locations.
- View conflicts and alternatives.
- View generated tasks.
- Review budget estimates.
- Approve, reject, or modify decisions.
- View agent activity.
- See pending or overdue work.

### Recommended screens

#### Dashboard

Show active events, pending approvals, overdue tasks, recent agent actions, and upcoming deadlines.

#### New request

A text area accepts a natural-language request. Include example prompts to make the demo easy to operate.

#### Event workspace

Show event details, progress, tasks, budget, location status, approvals, and draft communications.

#### Approval center

Show the decision, reason, alternatives, and approve, reject, and modify actions.

#### Activity timeline

Show what the agent understood, which tools it called, what it completed, and what remains pending.

---

## 10. Main user workflow

### Example request

> Organize a web development workshop for 55 students on September 11 from 10 AM to 1 PM. We need computers and a projector.

### Processing steps

1. The user submits the request.
2. OrbitOne extracts the event details.
3. The backend identifies the user’s organization as `orbit-university-001`.
4. OrbitOne calls `find_available_locations`.
5. The tool queries only Orbit University’s locations and bookings.
6. Unsuitable or unavailable locations are excluded.
7. OrbitOne recommends a verified location.
8. OrbitOne checks the organization’s approval policy.
9. OrbitOne creates preparation tasks.
10. OrbitOne drafts the faculty approval request.
11. OrbitOne displays the action requiring approval.
12. The user approves or rejects it.
13. OrbitOne updates the event and activity log.

### Example result

> Computer Lab 2 is available from 10 AM to 1 PM. It supports 60 people and has computers and a projector. Innovation Hall is already booked during this period, and Seminar Room 3 is too small. Because the event has more than 50 participants, faculty approval is required. Should I prepare the approval request for Computer Lab 2?

---

## 11. Core MVP features

### Feature 1: Natural-language request intake

Extract:

- Event title.
- Date.
- Time.
- Participant count.
- Location requirements.
- Equipment.
- Budget.
- Approval requirements.
- People or teams involved.

### Feature 2: Location search

Find locations that satisfy:

- Organization.
- Capacity.
- Date and time.
- Equipment.
- Event type.
- Booking status.

### Feature 3: Conflict detection

Detect:

- Room already booked.
- Room too small.
- Missing equipment.
- Insufficient booking notice.
- Conflicting event times.

### Feature 4: Task generation

Create tasks such as:

- Request faculty approval.
- Reserve the room.
- Confirm the speaker.
- Arrange equipment.
- Order refreshments.
- Publish announcement.
- Collect attendance.
- Submit expense report.

### Feature 5: Budget estimation

Calculate line items and compare them with a policy limit.

### Feature 6: Draft communication

Generate announcements, approval requests, and reminders. In the MVP, drafts should not be sent to real recipients.

### Feature 7: Approval workflow

Require approval before bookings, spending, external messages, sensitive data sharing, or irreversible changes.

### Feature 8: Background monitoring

Find overdue tasks and prepare reminders. This can be demonstrated through a scheduled backend job or a “run background check” button.

### Feature 9: Audit trail

Log requests, tool calls, outputs, decisions, failures, and approval status.

---

## 12. Technical architecture

```text
                         +----------------------+
                         |        User          |
                         | Student / Organizer  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    Web Application    |
                         | HTML/CSS/JS or React  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    FastAPI Backend    |
                         | API + approval logic  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    OrbitOne Agent     |
                         |     Strands SDK       |
                         +----------+-----------+
                                    |
          +-------------------------+--------------------------+
          |                         |                          |
          v                         v                          v
+------------------+     +------------------+       +------------------+
| Location Tool    |     | Task Tool       |       | Budget Tool      |
| Search conflicts |     | Create tasks    |       | Estimate costs   |
+------------------+     +------------------+       +------------------+
          |                         |                          |
          +-------------------------+--------------------------+
                                    |
                                    v
                         +----------------------+
                         | SQLite / JSON data  |
                         | Org, rooms, tasks,  |
                         | bookings, policies  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Approval + Audit Log |
                         +----------------------+
```

### Optional AWS architecture

```text
User
 |
 v
Frontend
 |
 v
FastAPI service
 |
 v
Amazon Bedrock AgentCore Runtime
 |
 v
Strands Agents SDK
 |
 +--> Custom tools or AgentCore Gateway
 +--> Organization data
 +--> Booking data
 +--> Policy data
 |
 v
Database, logs, and approvals
```

AgentCore deployment is optional. First make the local application reliable. Attempt AgentCore Runtime only after the core workflow is stable. The official Strands documentation describes deployment to AgentCore Runtime as a supported serverless deployment path. 

---

## 13. Strands agent design

The project must use Strands meaningfully. The agent should dynamically select tools based on the request.

### Recommended tools

1. `find_available_locations`
2. `create_task`
3. `estimate_budget`
4. `draft_notification`
5. `request_approval`
6. `get_pending_tasks`
7. `get_organization_policy`
8. `record_agent_action`

### Tool responsibilities

#### `find_available_locations`

Checks verified locations for capacity, equipment, time availability, and event type.

#### `create_task`

Creates an internal task with an owner, due date, priority, and status.

#### `estimate_budget`

Calculates costs and compares the result with the organization’s budget policy.

#### `draft_notification`

Creates an announcement, reminder, or approval request but does not send it.

#### `request_approval`

Creates a pending approval record with a clear explanation and available options.

#### `get_pending_tasks`

Finds overdue or incomplete tasks.

#### `get_organization_policy`

Retrieves approval thresholds, budget limits, booking notice rules, and other policies.

#### `record_agent_action`

Stores the action, tool name, inputs, result, timestamp, and status.

### Example tool

```python
from strands import tool

@tool
def find_available_locations(
    organization_id: str,
    date: str,
    start_time: str,
    end_time: str,
    participant_count: int,
    required_equipment: list[str]
) -> dict:
    """Find verified locations matching an event's requirements."""
    # Query SQLite or JSON data for the organization.
    # Apply capacity, equipment, time, and booking filters.
    return {
        "available": [],
        "conflicts": [],
        "message": "No matching locations found."
    }
```

Strands supports custom Python tools, allowing normal Python functions to extend the agent with domain-specific operations. Use clear names, type hints, and docstrings so the model can select the correct tool. 

### System prompt

```text
You are OrbitOne, an autonomous operations agent for student organizations
and small teams.

Your job is to turn natural-language requests into completed coordination work.
Use tools to retrieve organization data, check locations, create tasks, estimate
budgets, draft messages, monitor pending work, and request approvals.

The organization_id provided by the backend identifies the user's organization.
Never use data from another organization. Never invent rooms, capacities,
bookings, policies, budgets, or contacts.

Perform low-risk internal actions automatically.
Never spend money, send an external message, finalize a booking, cancel a booking,
share sensitive information, or approve a financial action without explicit user
approval.

If data is missing, say that it is unverified and ask for clarification or
administrator configuration. If there is a conflict, provide the best verified
alternative. When approval is required, explain why and ask one clear question.
Record every tool call and result in the activity log.
Never claim that an action succeeded if a tool failed.
```

---

## 14. Autonomy and approval policy

### Actions OrbitOne can perform automatically

- Extract event details.
- Check locations and schedules.
- Retrieve policies.
- Create internal draft tasks.
- Calculate budget estimates.
- Draft announcements and reminders.
- Detect approaching deadlines.
- Identify overdue tasks.
- Update internal statuses.
- Summarize progress.
- Suggest alternatives.

### Actions requiring approval

- Send an external message.
- Reserve a room.
- Cancel or modify a booking.
- Approve or spend money.
- Share personal or confidential information.
- Make an irreversible change.
- Commit the organization to an external arrangement.

### Policy table

| Action | Automatic? | Reason |
|---|---:|---|
| Extract request details | Yes | Low risk |
| Check availability | Yes | Read-only |
| Create internal draft task | Yes | Reversible |
| Calculate estimate | Yes | Informational |
| Draft announcement | Yes | Not yet sent |
| Send announcement | No | External communication |
| Reserve a room | No | Creates a commitment |
| Approve spending | No | Financial decision |
| Prepare a reminder | Usually yes | Low risk if predefined |
| Cancel event | No | Disruptive and potentially irreversible |

---

## 15. Data model

Use SQLite for the MVP.

### Organizations

```text
id
name
created_at
```

### Users

```text
id
name
email
role
organization_id
```

### Locations

```text
id
organization_id
name
building
capacity
equipment
status
```

### Bookings

```text
id
organization_id
location_id
event_name
date
start_time
end_time
status
```

### Policies

```text
id
organization_id
policy_name
policy_value
```

### Events

```text
id
organization_id
created_by
title
date
start_time
end_time
participant_count
status
```

### Tasks

```text
id
event_id
title
description
owner
due_date
status
priority
created_at
```

### Approvals

```text
id
event_id
action
reason
options
status
created_at
resolved_at
```

### Budget items

```text
id
event_id
item_name
quantity
unit_price
total_price
```

### Agent actions

```text
id
event_id
action_type
tool_name
input_data
result
status
timestamp
```

Every organization-specific record must contain `organization_id`.

---

## 16. Safety and trust requirements

- Use mock data for rooms, tasks, budgets, and notifications during the demo.
- Never store API keys in the repository.
- Use environment variables for secrets.
- Include `.env.example` with placeholders.
- Keep an audit trail of agent actions.
- Explain why approval is needed.
- Let users reject or modify a proposed action.
- Show tool failures clearly.
- Do not claim success when a tool fails.
- Mark communications as drafts until approved.
- Prevent duplicate tasks from repeated submissions.
- Confirm important dates and times.
- Use organization context in every query.
- Do not allow users to access another organization’s data.
- Do not let the language model be the authoritative source for availability or budgets.
- Let deterministic backend tools calculate costs and detect booking conflicts.

---

## 17. Twelve-day development plan

### Days 1–2: Scope and design

- Confirm OrbitOne name and tagline.
- Confirm the student-event coordination workflow.
- Create three demo scenarios.
- Define automatic and approval-required actions.
- Prepare fictional Orbit University data.
- Create the repository.

### Days 3–4: Strands agent

- Install and configure Strands Agents.
- Create the OrbitOne agent.
- Implement location, task, budget, notification, policy, and approval tools.
- Test tool selection in the terminal.
- Add structured outputs and logging.

### Days 5–6: Backend

- Create FastAPI endpoints.
- Add SQLite models.
- Add organization context.
- Connect the agent to the backend.
- Store events, tasks, approvals, budgets, bookings, and actions.
- Add error handling.

### Days 7–8: Frontend

- Build the user dashboard.
- Build the request form.
- Build the event workspace.
- Build the approval center.
- Build the activity timeline.
- Add a small admin panel.

### Days 9–10: Autonomy and testing

- Add pending-task detection.
- Add reminder behavior.
- Test a normal event.
- Test a room conflict.
- Test a budget limit.
- Test missing information.
- Test approval, rejection, and modification.
- Test tool failures and duplicate requests.

### Day 11: Deployment and documentation

- Deploy the application if possible.
- Attempt AgentCore only if the local demo works.
- Create the architecture diagram.
- Complete the README.
- Add the license.
- Add screenshots and setup instructions.

### Day 12: Video and submission

- Record the five-minute demo.
- Test every scenario from a clean environment.
- Publish the repository.
- Confirm the repository is public.
- Confirm the license is visible.
- Submit the project description and demo.
- Add the AWS Builder ID.
- Publish the optional Builder post if time remains.

---

## 18. Technology stack

### Required

- Strands Agents SDK.
- Python.
- A supported model provider.
- Public source-code repository.

### Recommended

- FastAPI.
- HTML/CSS/JavaScript or React.
- SQLite.
- Amazon Bedrock.
- Amazon Bedrock AgentCore Runtime, optionally.
- GitHub.
- YouTube or Vimeo for the demo.

### Why mock integrations are appropriate

The hackathon demo needs to prove that OrbitOne can reason, select tools, execute a workflow, and request approval safely. Mock services provide reliable behavior within 12 days. Real calendar, email, and payment integrations can be future work.

---

## 19. Demo scenarios

### Scenario A: Normal event

Input:

> Organize a Python workshop for 40 students next Friday from 2 PM to 4 PM. We need a room and projector.

Expected behavior:

- Extract details.
- Find an available room.
- Confirm projector availability.
- Create tasks.
- Draft the announcement.
- Show the plan.

### Scenario B: Location conflict

Input:

> Organize a workshop in Innovation Hall from 10 AM to 1 PM.

Expected behavior:

- Detect that Innovation Hall is booked.
- Search for alternatives.
- Exclude rooms with insufficient capacity.
- Present available options.
- Ask which option the user wants.

### Scenario C: Policy and budget issue

Input:

> Arrange refreshments for 80 students with a ₹5,000 budget.

Expected behavior:

- Calculate the estimated cost.
- Detect whether the limit is exceeded.
- Suggest reducing the order or requesting approval.
- Wait for a human decision.

---

## 20. Five-minute demo video

The video must be no longer than five minutes.

### Suggested structure

#### 0:00–0:30 — Problem

Explain that student teams lose time coordinating rooms, approvals, tasks, budgets, messages, and reminders.

#### 0:30–0:55 — Solution

Introduce OrbitOne as an autonomous operations agent that handles routine work and interrupts users only for meaningful decisions.

#### 0:55–2:00 — Normal workflow

Submit a request, show extraction, location search, task creation, budget estimate, and draft announcement.

#### 2:00–3:10 — Conflict workflow

Show an unavailable room, an alternative recommendation, and an approval decision.

#### 3:10–4:10 — Background behavior

Show an overdue task, a prepared reminder, and the activity log.

#### 4:10–4:40 — Technical implementation

Mention Strands Agents, custom tools, FastAPI, SQLite, approval workflow, and optional AWS services.

#### 4:40–5:00 — Impact

Use:

> OrbitOne does not ask users to manage another task list. It handles operational details in the background and brings people back only when their judgment is needed.

---

## 21. Judging strategy

### Technological implementation

Show:

- Genuine Strands agent usage.
- Multiple custom tools.
- Dynamic tool selection.
- Structured tool outputs.
- Organization-specific retrieval.
- Approval and escalation logic.
- Activity logging.
- Error handling.
- Optional live deployment.
- Optional AgentCore deployment.

### Design

Show:

- A simple request-to-result flow.
- Clear status indicators.
- Approval cards.
- Visible agent activity.
- Loading, success, empty, and error states.
- A consistent OrbitOne visual identity.

### Potential impact

Explain:

- Who loses time today.
- Which repetitive tasks are removed.
- Why scattered tools are inconvenient.
- How OrbitOne reduces coordination overhead.
- Why human approval is retained.
- How the product can expand to nonprofits and small organizations.

### Creativity and originality

Emphasize:

- Background operation.
- Decision-based interruption.
- Autonomous follow-up.
- Multi-step tool execution.
- Human-controlled commitments.
- A complete workflow instead of a single generated answer.

### Presentation

Make the video scenario-driven, visual, short, and easy to follow. Focus on one user and clearly show what the agent did and when it needed human help.

---

## 22. README requirements

The repository README should contain:

```text
# OrbitOne

## Overview
## Problem
## Solution
## Target users
## Features
## Demo workflow
## Organization configuration
## Architecture
## Technology stack
## Project structure
## Installation
## Environment variables
## Running locally
## Example prompts
## Safety and approval policy
## Known limitations
## Future improvements
## Demo video
## Live demo
## License
```

Include:

- Complete source code.
- Frontend and backend.
- Agent and tools.
- Mock data or database setup.
- Installation commands.
- Environment-variable instructions.
- Architecture diagram.
- MIT or Apache license.
- Demo instructions.
- Screenshots if useful.
- Test examples.
- Known limitations.

---

## 23. Optional AWS Builder post

Suggested title:

> Agents for Humans: Building OrbitOne, an Autonomous Operations Agent with Strands

Suggested sections:

1. The repetitive coordination problem.
2. Why the team chose this use case.
3. OrbitOne’s workflow.
4. Organization-specific configuration.
5. Designing Strands tools.
6. Implementing human approval.
7. Using AWS and Amazon Bedrock.
8. Testing or deploying with AgentCore.
9. Lessons learned in 12 days.
10. Future improvements.
11. Demo and repository links.

---

## 24. Out-of-scope features

Do not build these in the MVP:

- Real payments.
- Full Gmail integration.
- Full WhatsApp integration.
- Complex calendar OAuth.
- University ERP integrations.
- Multi-tenant enterprise authentication.
- Mobile applications.
- Voice assistant support.
- Multiple unrelated domains.
- Fully automatic room booking.
- Autonomous sending of real messages.
- A complex multi-agent system before the basic agent works.

List these as future scope instead.

---

## 25. Future scope

OrbitOne could later support:

- Multiple organizations.
- Google Calendar and Microsoft Outlook.
- Gmail, Slack, Teams, or WhatsApp notifications.
- Real approval workflows.
- Document and form extraction.
- Expense and reimbursement processing.
- Role-based access control.
- Agent memory for recurring events.
- Analytics showing time saved.
- Voice-based requests.
- Community-resource coordination.
- Nonprofit volunteer management.
- Small-business administrative operations.

---

## 26. Final product description

OrbitOne is an autonomous AI operations agent for student clubs, project teams, and small organizations. It converts natural-language requests into completed, trackable coordination work by extracting event details, checking organization-specific locations and schedules, creating tasks, estimating budgets, drafting communications, and monitoring deadlines. It works in the background and asks for human input only when the action involves a meaningful decision, financial approval, external communication, sensitive information, or an irreversible commitment.

OrbitOne does not assume that every college has the same rooms or rules. Each organization has a configurable workspace containing verified locations, equipment, bookings, budgets, and policies. OrbitOne retrieves this data through tools and never invents local facts. For the hackathon, the system uses one fictional university with preloaded data, but the data is stored separately from the agent logic so the same architecture can support other organizations later.

---

## 27. Direct instruction for an AI coding assistant

Build a full-stack application called **OrbitOne**.

OrbitOne is an autonomous AI operations agent for student clubs, project teams,
and small organizations. It handles repetitive coordination work for events and
team activities. It must understand natural-language requests, extract event
details, check organization-specific locations, create operational tasks,
estimate budgets, draft notifications, track pending work, and request human
approval for actions involving money, external communication, bookings, sensitive
information, or irreversible changes.

The project must use the Strands Agents SDK genuinely. Create a Strands agent
with custom Python tools. The agent must decide which tools to call based on the
request rather than relying on hard-coded responses.

Use one fictional organization for the MVP:
Orbit University, organization_id = orbit-university-001.
Store its rooms, bookings, equipment, policies, and budgets in SQLite or JSON.
Do not hardcode the behavior into if/else responses.

Core tools:
1. find_available_locations(organization_id, date, start_time, end_time,
   participant_count, required_equipment)
2. create_task(event_id, title, owner, due_date)
3. estimate_budget(event_id, items, budget_limit)
4. draft_notification(event_id, notification_type, audience)
5. request_approval(event_id, action, reason, options)
6. get_pending_tasks(event_id or all_events)
7. get_organization_policy(organization_id)
8. record_agent_action(event_id, action_type, tool_name, input_data, result)

Build:
- A Python FastAPI backend.
- A responsive frontend using React or HTML/CSS/JavaScript.
- SQLite persistence.
- Models for organizations, users, locations, bookings, policies, events,
  tasks, approvals, budget items, and agent actions.
- A dashboard.
- A natural-language request form.
- An event workspace.
- An approval center.
- An activity timeline.
- A lightweight administrator configuration side.
- Pending-task and reminder behavior.

Autonomy rules:
- Automatically extract information.
- Automatically check availability.
- Automatically create internal tasks.
- Automatically calculate budget estimates.
- Automatically draft messages.
- Automatically identify overdue tasks.
- Never send external messages without approval.
- Never approve spending without approval.
- Never finalize or cancel a booking without approval.
- Never share sensitive data without approval.
- Explain why approval is needed.
- Ask one clear decision question.
- Log every tool call and result.
- Never claim an action succeeded if the tool failed.
- Never invent organization-specific rooms, capacities, bookings, policies, or
  contacts.

Main demo scenario:
A user requests a workshop for 55 or 60 students. OrbitOne extracts the details,
checks rooms, detects a conflict, finds an alternative, calculates refreshment
cost, creates preparation tasks, drafts an announcement, checks the organization
approval policy, and asks the user whether to approve the alternative room or
request additional budget approval.

Prioritize a reliable end-to-end workflow over extra features. The project will
be judged on technical implementation, design, potential impact, creativity,
and presentation. The final result must look like a complete working product,
not merely a chatbot.

Include:
- Clean UI.
- Loading, error, success, and empty states.
- Approval and rejection buttons.
- Mock data.
- Example prompts.
- .env.example.
- requirements.txt.
- README.md.
- Architecture diagram.
- MIT license.
- Local setup instructions.
- Demo instructions.
- Public-repository-ready structure.
```

---

## 28. Final implementation principle

> **Build one configurable organization, not one hardcoded answer.**

Use fictional Orbit University data for speed, but store the data in a database or JSON and expose it through Strands tools. The AI should retrieve verified information, perform routine work, and request human approval for important decisions. This is feasible within 12 days and provides a credible path toward real-world deployment.
