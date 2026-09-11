# OrbitOne Frontend Design Specification

## Purpose

This document is the single source of truth for the OrbitOne frontend's visual language, interaction design, motion system, and product experience.

OrbitOne is an autonomous AI operations agent. The frontend should feel like a **luxury Apple product from 2030** combined with a **magical operating system**.

The frontend must NOT look like a generic AI SaaS dashboard, chatbot template, developer console, or cyberpunk interface.

### Signature phrase

> I'll take it from here.

### Core personality

OrbitOne is:

- Intelligent
- Calm
- Confident
- Friendly
- Elegant
- Slightly mysterious
- Operational rather than conversational

OrbitOne should feel like a competent operator, not a customer-service chatbot.

---


# CRITICAL REQUIREMENT: REAL BACKEND INTEGRATION

This is one of the most important requirements of the frontend.

OrbitOne is NOT a static visual prototype and NOT a frontend with mocked/demo data.

The frontend MUST be a real client of the existing FastAPI backend in this repository.

## Backend is the source of truth

The existing backend, database, services, models, schemas, and API behavior must be treated as the source of truth.

Before implementing the frontend:

1. Inspect `backend/main.py`
2. Inspect `backend/models.py`
3. Inspect `backend/schemas.py`
4. Inspect every relevant file under `backend/services/`
5. Inspect `backend/database.py`
6. Inspect `backend/seed.py`
7. Inspect `PERSON_2_BACKEND.md`
8. Inspect `PROJECT_CONTEXT.md`
9. Identify the actual response/request shapes of every endpoint
10. Run the backend locally if possible and verify the endpoints
11. Only then design the frontend API layer

DO NOT assume endpoint response formats from the documentation alone.

## Required API integration

The frontend should integrate with the existing endpoints, including:

- `GET /locations`
- `GET /locations/available`
- `GET /events`
- `POST /events`
- `GET /tasks`
- `POST /tasks`
- `GET /approvals`
- `POST /approvals/{id}/approve`
- `POST /approvals/{id}/reject`
- `GET /activity`
- `POST /agent/run`

If the backend exposes additional useful endpoints after inspection, use them where appropriate.

If an endpoint is missing, DO NOT invent it.

Instead:
- clearly report the missing endpoint
- determine whether the feature can be implemented using an existing endpoint
- if a backend change is genuinely necessary, isolate and document the required backend change before making it

## No fake data

Do NOT use:

- hardcoded events
- fake task lists
- fake approval objects
- fake activity logs
- fake locations
- fake budgets
- fake agent progress
- fake API responses
- placeholder JSON pretending to be backend data

Static UI copy, empty-state text, examples inside an input placeholder, and visual labels are fine.

Actual operational information must come from the backend.

## Agent Run integration

The `POST /agent/run` flow is especially important.

The New Event experience must send the user's natural-language request to the real agent endpoint.

The frontend must then represent the real result/state returned by the backend.

Do NOT simulate a sequence such as:

"Checking availability..."
"Found a room..."
"Calculating budget..."
"Creating tasks..."

unless those states are actually supported by the backend response/activity data.

Where possible, use the real `/activity` data to show what OrbitOne actually did.

The UI should translate technical backend activity into beautiful human-readable activity, but must not fabricate activity that did not happen.

Example presentation:

- "Checked room availability"
- "Found a scheduling conflict"
- "Searched available alternatives"
- "Calculated estimated budget"
- "Approval required"

These should correspond to real backend actions/results.

## Real event creation

When a user submits a new event:

1. Capture the natural-language request.
2. Send it to the real backend/agent.
3. Wait for the actual response.
4. Handle loading, success, and failure states.
5. Refresh relevant backend data after successful creation.
6. Navigate to the appropriate event/run view using real identifiers returned by the backend.

Do not create a fake event object in React state and pretend it exists in the database.

## Real location availability

Location recommendations must come from the backend.

The frontend should:

- query real locations
- display real capacity/equipment
- represent real availability
- show conflicts when the backend reports them
- show real alternatives returned by the backend

Never invent an alternative room just to make the UI look complete.

## Real tasks

Tasks shown in the dashboard, event details, and Tasks page must come from the backend.

Task creation must use the real backend endpoint.

If task status updates are not currently supported by the backend, do not fake persistence with frontend-only state.

Instead, clearly identify the backend limitation.

## Real approvals

Approval UI must be connected to the actual approval records.

Approve:

- call `POST /approvals/{id}/approve`
- handle the real response
- refresh the approval/event/task/activity state

Reject:

- call `POST /approvals/{id}/reject`
- handle the real response
- refresh the relevant state

The Approve and Reject buttons MUST NOT merely change the visual appearance.

A successful click must actually update backend state.

If the backend returns an error, show the error and keep the UI consistent with the backend.

## Real activity / Orbit

The UI may call this experience "Orbit" because that is the product language.

The actual backend endpoint remains:

`GET /activity`

Use real activity records to power:

- activity timeline
- event activity
- agent execution history
- audit-style views
- contextual status where appropriate

The activity experience should make it obvious that OrbitOne is an autonomous system performing real operations.

## Data fetching architecture

Create a clean frontend API/data layer.

Do not scatter raw `fetch()` calls throughout every component.

Prefer a structure such as:

`src/api/`
or another clean equivalent discovered after inspecting the existing frontend setup.

Centralize:

- API base URL
- request helpers
- error handling
- endpoint functions
- response normalization only when genuinely necessary

Use environment configuration for the backend URL.

For example, use a frontend environment variable rather than hardcoding a deployment-specific URL.

Do not commit secrets or credentials.

## State management

Use the simplest state architecture that is sufficient.

The frontend should distinguish between:

- server state
- UI state
- transient animation state

Server state must ultimately reflect backend responses.

Animation state can be local and visual.

Never let animation state become the source of truth for whether an event/task/approval actually exists or changed.

## Refresh / synchronization

After any mutation, refresh or invalidate the relevant backend data.

Important mutations include:

- creating an event
- creating a task
- approving
- rejecting
- running the agent

Do not require a full page reload unless there is a genuine reason.

Prefer clean targeted refreshes or a query/data-fetching strategy if the existing stack supports it.

## Loading states

Loading states must be real.

Do not use arbitrary fake delays just to make the interface feel cinematic.

If the backend responds quickly, the UI should respond quickly.

If the backend takes time, use the actual waiting period to display an appropriate agent state.

The orb can animate while waiting, but the animation must not imply backend progress that has not occurred.

## Error handling

Every backend-connected screen needs a graceful error state.

Examples:

- backend unavailable
- request failed
- validation error
- agent failure
- location lookup failure
- approval action failure
- malformed/unexpected response

Use OrbitOne's personality:

"I couldn't complete that."

Then explain what actually failed in concise language.

Do not hide errors behind a generic success animation.

## Backend development boundary

The primary task is FRONTEND.

Do not rewrite or refactor the backend just because a frontend implementation would be easier that way.

Backend changes are allowed only when:

- a required frontend feature genuinely cannot work with the current API
- the change is minimal
- the reason is documented
- the existing backend architecture is respected

If you discover a backend limitation, report it before making broad backend changes.

## CORS / local development

Verify how the FastAPI backend is configured for local frontend development.

If CORS is already configured, use it.

If CORS is missing and is required for the frontend to communicate with the backend, make the smallest appropriate backend change and document it clearly.

Do not add broad insecure CORS configuration such as allowing everything in production.

## Integration testing checklist

Before considering the frontend complete, verify real end-to-end flows.

### Flow 1: Normal event

Natural-language request
→ frontend sends request
→ backend agent runs
→ real location is checked
→ event/tasks are created as supported by backend
→ frontend displays returned data
→ activity reflects actual operations

### Flow 2: Location conflict

Request
→ backend detects conflict
→ frontend displays the conflict
→ real alternative locations are shown
→ no fabricated alternatives

### Flow 3: Approval

Request
→ backend determines approval is required
→ frontend displays approval state
→ user clicks Approve or Reject
→ real backend endpoint is called
→ backend state changes
→ frontend refreshes
→ activity reflects the decision

### Flow 4: Refresh persistence

Create/update something
→ refresh the browser
→ information still comes from backend
→ UI does not depend on in-memory fake state

## Definition of done for backend integration

The frontend is NOT considered finished if it only looks beautiful.

It is finished when:

- it runs against the real FastAPI backend
- real backend data appears in the UI
- real agent execution can be triggered
- real events are displayed
- real locations are displayed
- real tasks are displayed
- real approvals are displayed
- Approve/Reject mutate real backend state
- real activity is displayed
- errors are handled
- refresh persistence works
- no fake operational data is being used
- the demo can be performed end-to-end using the actual backend

THE VISUAL DESIGN IS IMPORTANT, BUT REAL BACKEND INTEGRATION IS NON-NEGOTIABLE.


# 1. Design North Star

## The core idea

**OrbitOne is an AI operating environment, not a chatbot.**

The user gives OrbitOne a request. OrbitOne understands it, executes work through the real backend, surfaces meaningful progress, asks for human approval when required, and records what happened.

The interface should visually communicate this lifecycle:

```text
USER REQUEST
     ↓
ORBITONE
     ↓
THINKING
     ↓
WORKING
     ↓
DECISION
     ↓
HUMAN APPROVAL
     ↓
COMPLETION
     ↓
ORBIT / HISTORY
```

The UI should feel like one continuous environment rather than a collection of disconnected pages.

---

# 2. Visual Personality

## Three primary adjectives

### LUXURIOUS

- Restrained
- Precise
- Spacious
- High-quality typography
- Subtle details
- No visual clutter

### MAGICAL

- Living AI Core
- Atmospheric light
- Tiny sparkles
- Spatial transitions
- Interactive orbital visualization
- Delightful microinteractions

### ALIVE

- Background responds to cursor
- Glass responds to hover
- Particles react to agent state
- Orb changes state
- Environment changes subtly when approval is required
- Completion creates a tiny visual moment

---

# 3. Things to Avoid

Do NOT create:

- Generic AI SaaS dashboard layouts
- Generic purple gradient landing pages
- Excessive cards
- Excessive rounded rectangles
- Huge "AI assistant" chat bubbles
- Robot illustrations
- AI avatars with faces
- Cyberpunk/hacker aesthetics
- Excessive neon
- Rainbow gradients
- Excessive glow
- Excessive animation
- Excessive glassmorphism
- Giant gradient buttons
- Stock illustrations
- Generic AI sparkles everywhere
- Fake analytics that are not backed by the API
- Fake backend data
- Fake API endpoints
- Hardcoded organization-specific data
- Raw JSON as the primary user experience
- Developer-console-looking tool traces

### Critical principle

> Every visual effect must communicate state, hierarchy, or delight.

If an effect has no purpose, remove it.

---

# 4. Color System

The visual environment is dark purple.

Purple is the atmosphere and represents OrbitOne intelligence.

Amber represents human attention.

## Base colors

Suggested tokens:

```css
--background: #09070F;
--background-secondary: #100B1C;
--surface: rgba(255, 255, 255, 0.045);
--surface-strong: rgba(255, 255, 255, 0.075);
--surface-hover: rgba(255, 255, 255, 0.085);

--text-primary: rgba(255, 255, 255, 0.96);
--text-secondary: rgba(255, 255, 255, 0.68);
--text-tertiary: rgba(255, 255, 255, 0.42);

--border: rgba(255, 255, 255, 0.10);
--border-subtle: rgba(255, 255, 255, 0.065);

--purple: #8B5CF6;
--purple-bright: #A78BFA;
--indigo: #6366F1;

--amber: #F59E0B;
--green: #34D399;
--red: #F87171;
```

These are starting tokens. Adjust values visually while preserving the semantic system.

## Semantic color rules

```text
PURPLE  = OrbitOne / AI / autonomous activity
GREEN   = successful / healthy / completed
AMBER   = requires human attention / approval
RED     = failure / blocked / error
WHITE   = neutral information
```

Do not use amber as a general accent.

Do not use red for ordinary warnings.

Do not make every interactive element purple.

---

# 5. Atmospheric Background

The background should feel like a living spatial environment.

Use very large, heavily blurred atmospheric gradients.

Preferred gradient family:

```text
Deep Violet
    ↓
Purple
    ↓
Indigo
```

Do not create obvious gradient stripes.

The gradients should look like light existing inside the environment.

## Background behavior

### Idle

Very slow movement.

### Cursor movement

The local light source subtly follows the cursor.

### Agent working

Atmospheric activity becomes slightly more energetic.

### Approval required

A subtle amber atmosphere enters the environment.

### Completion

A brief radial light pulse occurs.

### Error

The environment becomes quieter and slightly dimmer.

---

# 6. Grain / Noise

Use a very subtle grain/noise texture over the environment.

Purpose:

- Reduce synthetic gradient appearance
- Add physicality
- Make the environment feel premium
- Prevent the background from looking like a generic AI template

The grain should be barely noticeable.

Never make it visually noisy.

---

# 7. Glassmorphism System

Glass is important, but should be used intentionally.

There are three primary spatial depths.

## Level 1: Environment

No glass.

The atmospheric background.

## Level 2: Standard glass

Used for:

- Navigation
- Secondary panels
- Lists
- Supporting information

Characteristics:

- Low-opacity white surface
- Backdrop blur
- Very subtle border
- Soft depth

## Level 3: Crystal glass

Used for:

- Approvals
- Active run
- Important event information
- Major decisions
- Focused content

Characteristics:

- Slightly more transparent
- Stronger backdrop blur
- More visible background refraction
- More defined border
- Subtle internal highlight

### Glass rules

Do not put glass containers around every element.

Not everything needs a card.

Use:

- Flat content
- Dividers
- Glass panels
- Lists
- Timelines
- Floating surfaces

to create hierarchy.

---

# 8. Glass Refraction

Glass should respond to hover where practical.

When the cursor moves over a glass surface:

- Background lighting subtly shifts
- Reflection changes
- Internal highlight moves
- Background appears to refract slightly

This must remain subtle.

The user should feel that the surface has physical depth without consciously thinking about the effect.

---

# 9. Typography

Typography should feel:

**Apple-clean + subtly futuristic.**

Use a clean modern sans-serif for UI.

Potential primary fonts:

- Inter
- Manrope
- Plus Jakarta Sans

Potential display font:

- Sora
- Space Grotesk

Do not use a stereotypical sci-fi font.

The visual effects create the futuristic feeling.

## Typography hierarchy

Use:

- Large display headings
- Medium section headings
- Clean body text
- Small uppercase system labels

Example:

```text
ACTIVE RUN

CYBERSECURITY WORKSHOP

Finding the best option
```

Micro-labels should often be uppercase:

```text
NEEDS YOUR ATTENTION
IN MOTION
ACTIVE RUN
RECENT ORBIT
APPROVAL REQUIRED
```

Use letter spacing carefully.

---

# 10. OrbitOne Symbol

The OrbitOne mark is:

> **A four-point star surrounding / associated with a central dot.**

Concept:

```text
    ✦
```

The central star represents OrbitOne intelligence.

It appears in:

- Logo
- Cursor
- AI-generated content
- Agent completion
- Empty states
- Loading states
- Microinteractions
- AI-related UI

The star is a visual language element, not decorative noise.

---

# 11. The OrbitOne Core

The central AI orb is the primary visual identity.

## Physical concept

The Core is:

- A floating glass sphere
- With luminous purple energy inside
- Subtle plasma movement
- Tiny particles
- A four-point star at its center
- Translucent orbital rings
- A miniature universe-like internal structure

The Core should feel like:

> energy contained inside glass

combined with:

> a miniature universe

It should NOT look like a simple CSS glowing circle.

---

# 12. Orb Lighting

The Core should cast subtle purple illumination onto nearby UI.

For example:

```text
             ORBITONE CORE
                  ◉
               purple
               light
                  ↓
        glass surface catches
        a faint purple glow
```

This gives the interface physical depth.

---

# 13. Orb States

The Core has meaningful states.

## IDLE

- Soft breathing
- Calm purple glow
- Slow orbital motion
- Minimal particles

The orb should not demand attention.

## THINKING

- Core becomes brighter
- Internal movement increases
- Orbital rings accelerate slightly
- Particle activity increases

## WORKING

- Active orbital particles
- Stronger internal plasma movement
- More visible environmental response

## WAITING FOR APPROVAL

- Purple remains dominant
- Amber enters subtly into the environment
- Orb motion becomes calmer
- Core remains active

Meaning:

> OrbitOne is waiting for its human.

## COMPLETING

- Energy contracts toward the center

## COMPLETE

- Short radial light pulse
- Tiny four-point sparkle
- Return to calm state

## ERROR

- Core becomes dimmer
- Environment becomes quieter
- Avoid aggressive red glow

---

# 14. Orb Size

## First launch / welcome

The orb is:

> **large and centered**

It is the primary visual object.

## Dashboard

The giant orb is NOT always present.

Show the Core prominently when something is actively running.

This makes the orb meaningful rather than decorative.

## Active run

The Core becomes a major visual element.

## Approval

The Core moves toward the center and the approval surface appears beside it.

## Active event Orbit view

The Core becomes the central node.

---

# 15. Cursor System

The browser cursor should be replaced with a custom OrbitOne pointer where technically appropriate.

## Default cursor

A tiny four-point star:

```text
✦
```

with a very subtle purple glow.

## Cursor movement

The cursor:

- Has a tiny breathing animation
- Leaves a microscopic fading light trail
- Acts as a subtle local light source
- Influences background gradients
- Influences glass reflections
- Causes nearby particles to react

Do NOT use a magnetic cursor.

Do NOT make the cursor oversized.

Do NOT create a distracting trail.

---

# 16. Cursor Hover States

## Normal

```text
✦
```

## Interactive element

The star becomes slightly brighter.

Glass reflection shifts.

## AI-generated content

The star gets a subtle halo and the related content can receive a faint purple outline.

## Approval interaction

Use a slightly warmer / amber response where appropriate.

---

# 17. Particles

Use an extremely subtle ambient particle system.

Particles should feel like:

> microscopic elements inside the environment

not a visible starfield wallpaper.

## Idle

Barely visible.

## Active agent

More visible.

## Agent execution

Particles subtly react to the Core.

## Completion

Tiny localized sparkle moment.

Particles should never overwhelm text.

---

# 18. Parallax

Use subtle layered parallax where technically practical.

Different layers can move at slightly different speeds:

- Atmospheric gradients
- Particles
- Glass reflections
- Orbital rings

The effect must remain restrained.

The product should still feel like an application, not a portfolio animation.

---

# 19. Global Ambient State

The frontend should conceptually maintain a global visual state:

```text
IDLE
LISTENING
THINKING
WORKING
WAITING_FOR_APPROVAL
COMPLETING
COMPLETE
ERROR
```

The environment can react to this state.

The visual system should not require every page to independently reinvent the agent state.

---

# 20. First Launch Experience

The initial screen should feel like entering an environment.

Do NOT immediately show a conventional dashboard.

## Composition

Full-screen.

No full sidebar initially.

Centered Core.

Minimal copy.

Example structure:

```text
ORBITONE

            ✦
        [ CORE ]

     Your AI assistant

  Tell me what you need...

  [ command input ]

  Recent activity
```

The actual hero phrase can be refined during implementation, but the experience should remain extremely minimal.

---

# 21. Sidebar

After the product becomes operational, the navigation appears as a floating glass sidebar.

## Expanded

```text
✦ ORBITONE

◉ Overview
◌ Runs
✓ Tasks
◇ Approvals
◷ Calendar
✦ Orbit
◌ Audit

⚙ Settings

◉ User
```

## Collapsed

Icons only.

## Behavior

- Floating
- Glass
- Collapsible
- Expanded state has labels
- Collapsed state uses icons
- Smooth Apple-like transition

## Active navigation

Use:

> subtle glass pill + tiny glowing dot

Do NOT use a giant glowing purple block.

---

# 22. Dashboard

The dashboard is human-first.

Primary question:

> Does OrbitOne need me?

Secondary question:

> What is OrbitOne currently handling?

Suggested hierarchy:

```text
GOOD MORNING

I've got 7 things under control.

NEEDS YOU
2 approvals
1 blocked action

IN MOTION
3 active runs

UPCOMING
4 events

RECENT ORBIT
Recent agent activity
```

The dashboard should remain clean and spacious.

Do not fill it with unnecessary analytics.

---

# 23. New Event

The New Event screen is the primary AI interaction surface.

## Initial state

Large Core.

Minimal interface.

Prompt:

```text
WHAT DO YOU NEED TO ORGANIZE?
```

Large glass command input.

The user should be able to type a natural-language event request.

Example:

```text
Organize a cybersecurity workshop for 60 students
next Friday from 2 PM to 4 PM.
We need computers and a projector.
```

## Submission transition

The Core wakes up.

The interface transitions into an active run.

The Core moves from hero position into the active-run composition.

This transition should feel cinematic.

---

# 24. Agent Interaction

Do NOT build OrbitOne as a conventional chat application.

Avoid:

```text
User bubble
AI bubble
User bubble
AI bubble
```

Instead, represent the interaction as:

> request → understanding → execution → decision → completion

OrbitOne should speak concisely.

Examples:

```text
Got it.

I'll take it from here.
```

```text
I've found the best option.
```

```text
I need your approval before I continue.
```

```text
I couldn't complete that.
```

Do not use excessive conversational filler.

---

# 25. Active Run

This is one of the signature screens.

The composition should include:

- Core on the left
- Timeline on the right
- Context beneath / alongside
- Spacious environment
- Active agent state
- Real backend data

Example:

```text
ACTIVE RUN

CYBERSECURITY WORKSHOP

             ◉

      Finding the best option

✓ Requirements understood
✓ Organization policy checked
● Searching available locations
○ Checking equipment
○ Estimating budget

CONTEXT

60 attendees
Friday
2:00 PM → 4:00 PM
Computers + projector
```

The timeline should be left-aligned within its content region.

Do not show raw function names by default.

Instead of:

```text
find_available_locations()
```

show:

```text
Searching available locations
```

Technical tool details can appear in deeper audit/run detail views.

---

# 26. Active Run Motion

When a run begins:

1. Core wakes
2. Orbital motion increases
3. Background activity increases
4. Timeline appears progressively
5. Context materializes
6. Tool/activity states update

Example:

```text
Understanding your request
        ↓
Checking organization policies
        ↓
Searching available locations
        ↓
Checking equipment
        ↓
Estimating budget
```

The UI should react to real backend state where possible.

Do not fake progress purely for visual effect.

---

# 27. Event Details

Event Details should combine:

> Apple-like minimalism + operational depth

Primary information:

- Event name
- Date
- Time
- Participants
- Location
- Equipment
- Tasks
- Budget
- Approval status

Example:

```text
CYBERSECURITY WORKSHOP

60 participants
Friday · 2 PM → 4 PM

COMPUTER LAB 2
Recommended

60 seats
Computers
Projector

TASKS

✓ Prepare equipment
○ Confirm coordinator
○ Prepare registration

BUDGET

₹4,250 estimated
```

Information should progressively disclose more detail when the user interacts with it.

---

# 28. Active Event Orbit View

This is a signature feature.

Use it ONLY for active events.

Do not make every event an orbital visualization.

## Entry

Use a subtle orbital icon / control.

Possible interaction:

```text
◌ View Orbit
```

or a minimal orbital icon.

## Visualization

The Core is the center.

Surrounding nodes represent:

- Location
- Budget
- Tasks
- Policy
- Approval
- Agent activity

Example:

```text
                 LOCATION
                    ○
                   /
                  /
          POLICY ○──●──○ BUDGET
                  |
                  |
                 ○
                TASKS
```

Nodes should move gently.

Clicking a node expands its information.

The user can return to the standard event view.

This feature should feel like discovering a hidden layer of the product.

---

# 29. Approval Center

Approval is one of the most important experiences in the product because it demonstrates human-in-the-loop AI.

## Composition

When approval is needed:

- Core moves toward the center
- Approval surface appears beside it
- Background subtly shifts toward amber
- Motion calms
- The page visually communicates that OrbitOne is waiting

Example:

```text
ORBITONE NEEDS YOU

One decision is ready.

Reserve Computer Lab 2

60 seats
Computers
Projector

Estimated cost
₹4,250

WHY THIS OPTION

✓ Best capacity match
✓ Available
✓ Required equipment

[ Decline ]   [ Approve ]
```

## Approval design

The user must understand:

1. What OrbitOne wants to do
2. Why it selected this action
3. What it will cost / affect
4. What happens if approved

Do not hide important context behind the button.

Approval buttons must trigger the real backend actions.

---

# 30. Approval State

### Pending

Amber attention state.

### Approved

Green confirmation.

### Rejected

Neutral / muted state.

### Processing

Core becomes active again.

### Complete

Subtle purple completion pulse.

---

# 31. Tasks

Default task view:

> Beautiful glass Kanban

Columns:

```text
TO DO
IN PROGRESS
DONE
```

Tasks should use real backend data.

Avoid fake tasks.

## Task completion

When a task completes:

1. Checkmark appears
2. Tiny ✦ sparkle
3. Task transitions into Completed
4. Motion settles

Do not use confetti.

The moment should be elegant.

---

# 32. Task Event Orbit

For a specific active event, users can enter the Orbit view to see relationships between:

- Event
- Tasks
- Location
- Budget
- Policy
- Approval

Do not use the orbital visualization as the default task board.

---

# 33. Activity / Orbit

The user-facing name for the activity experience can be:

> **Orbit**

The backend endpoint remains the activity endpoint.

The UI concept:

> Everything OrbitOne has done.

Example:

```text
TODAY

11:42

✦ Approval requested
Cybersecurity Workshop

₹4,250 exceeds approval threshold.

11:40

◉ Budget calculated
Estimated ₹4,250

11:37

✦ Alternative found
Computer Lab 2
```

This should feel like an agent history rather than a database table.

---

# 34. Activity Visualization

New activity should appear naturally in the timeline.

Do NOT make activity literally emerge from the Core every time.

The Core is not a notification dispenser.

Use the Core-to-activity relationship primarily in active run experiences.

---

# 35. Audit

Audit should expose deeper technical information when needed.

Default view should remain human-readable.

Potential information:

- Timestamp
- User request
- Agent action
- Tool used
- Input
- Result
- Status
- Approval state

Raw technical information can be progressively disclosed.

The surface remains elegant.

The detail layer can be technical.

---

# 36. Empty States

Empty states should feel intentional and magical.

## No approvals

```text
✦

Nothing needs you.

OrbitOne has everything under control.
```

## No tasks

```text
◉

Nothing to do.

You're all caught up.
```

## No activity

```text
✦

It's quiet here.

I'll let you know when something happens.
```

Use small, calm Core/star visuals.

---

# 37. Error States

OrbitOne speaks in first person.

Instead of:

```text
ERROR 500
```

use:

```text
◉

I couldn't complete that.

Something went wrong while checking
room availability.

Try again
```

The environment becomes slightly darker / quieter.

Avoid aggressive error animations.

---

# 38. Loading States

Prefer semantic loading states.

Bad:

```text
Loading...
```

Better:

```text
Searching available locations
```

```text
Checking organization policies
```

```text
Calculating estimated budget
```

```text
Preparing approval
```

The Core should visually reflect the loading state.

---

# 39. Motion Language

The motion system has two levels.

## Normal application motion

Apple-like.

- Smooth
- Fast enough to feel responsive
- Subtle
- Spatial
- No excessive bounce

## Agent motion

Cinematic.

- Core wakes
- Core moves
- Orbital activity increases
- Environment changes
- Approval state transforms the scene
- Completion creates a pulse

This distinction is essential.

Do not animate every button and panel dramatically.

---

# 40. Page Transitions

Normal navigation:

> Smooth Apple-like transition.

Agent state transitions:

> Cinematic.

Examples:

### New Event → Active Run

Core physically transitions from hero position into the active-run composition.

### Active Run → Approval

Core shifts toward center.

Approval surface materializes beside it.

### Approval → Completion

Core pulses.

### Event → Orbit

Interface transitions into the orbital spatial view.

---

# 41. Ambient State System

The frontend should conceptually support:

```text
ambientState:
  idle
  thinking
  working
  approval
  completing
  success
  error
```

This state can control:

- Gradient intensity
- Particle activity
- Orb animation
- Lighting
- Glass accent
- Cursor atmosphere

Keep this centralized rather than duplicating behavior across components.

---

# 42. Microinteractions

## Logo click

Clicking the OrbitOne logo triggers a tiny orbital animation.

The four-point star:

```text
✦
```

briefly separates into particles, orbits the center once, then returns.

Target duration:

approximately 600 to 900ms.

Keep it subtle.

## Task completion

Tiny ✦ sparkle.

## Agent completion

Short radial light pulse.

## Hover

Glass reflection shifts.

## AI content

Subtle purple halo.

---

# 43. Mobile

Desktop is the primary experience.

Do not simply shrink the desktop layout.

Mobile should become:

> **OrbitOne in your pocket.**

Prioritize:

- Core
- Command interface
- Active runs
- Approvals
- Tasks

Mobile can simplify navigation and secondary information.

---

# 44. Responsive Philosophy

Desktop:

> Full AI operating environment.

Tablet:

> Simplified spatial interface.

Mobile:

> Command + essential operations.

Do not allow glass panels, typography, or the Core to become cramped.

---

# 45. Backend Integration Rules

The frontend MUST use the existing backend.

Do not create fake APIs.

Do not create fake backend responses.

Do not hardcode organization-specific data.

Do not invent room availability.

Do not invent budgets.

Do not invent task states.

Do not invent approvals.

Use the real API and existing backend data.

The backend is the source of truth.

---

# 46. Expected Backend Capabilities

The frontend is expected to work with the existing backend capabilities, including concepts such as:

```text
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

Verify the actual routes and response schemas from the current backend code before implementation.

Do not assume a route exists if it does not.

---

# 47. Real Data Rule

Every visible operational value should come from backend data when the backend supports it.

Examples:

- Number of approvals
- Number of active tasks
- Event details
- Room availability
- Budget
- Approval state
- Activity history

If the backend does not yet expose a value:

1. Do not invent it.
2. Check whether an existing endpoint can provide it.
3. If not, make the UI gracefully omit or label the unavailable information.

---

# 48. API Error Handling

If the backend fails:

- Do not crash the interface
- Show a human-readable OrbitOne message
- Keep the environment intact
- Offer retry where appropriate
- Do not fabricate a successful result

Example:

```text
I couldn't reach the operations system.

Try again.
```

---

# 49. Frontend Architecture Principles

Prefer reusable components.

Potential component groups:

```text
/core
  OrbitCore
  OrbitCoreState
  OrbitalRings
  ParticleField

/atmosphere
  AmbientBackground
  CursorGlow
  GlassSurface

/navigation
  Sidebar
  NavItem

/agent
  AgentStatus
  AgentTimeline
  AgentRun
  CommandInput

/events
  EventCard
  EventDetails
  EventOrbit

/approvals
  ApprovalCard
  ApprovalCenter

/tasks
  TaskBoard
  TaskCard

/activity
  OrbitTimeline
  ActivityItem

/shared
  GlassButton
  StatusPill
  EmptyState
  ErrorState
```

Use the actual project architecture and framework already present in the repository.

Do not restructure the backend to build the frontend.

---

# 50. Accessibility

Fancy visuals must not compromise usability.

Requirements:

- Keyboard accessible controls
- Visible focus states
- Sufficient text contrast
- Respect `prefers-reduced-motion`
- Do not communicate state using color alone
- Buttons must have accessible labels
- Interactive orbital nodes need accessible alternatives
- Cursor effects must not interfere with pointer usability

For reduced motion:

- Disable or greatly reduce particles
- Disable parallax
- Reduce orb animation
- Replace cinematic transitions with simple fades

---

# 51. Performance

The frontend must remain performant.

Be careful with:

- WebGL
- Canvas particles
- Blur
- Backdrop filters
- Large shadows
- Multiple animated gradients

Prefer CSS and lightweight animation where sufficient.

If using a canvas/WebGL particle system, keep the particle count modest.

Do not sacrifice application responsiveness for visual effects.

The app must still feel like a serious operational tool.

---

# 52. Visual Hierarchy Rules

When designing any screen:

1. Determine the user's primary action.
2. Determine the most important information.
3. Determine whether OrbitOne is active.
4. Show the Core only when it adds meaning.
5. Use glass to establish depth, not decoration.
6. Use purple to indicate AI/autonomous activity.
7. Use amber only when human attention is required.
8. Hide technical detail until requested.
9. Use whitespace aggressively.
10. Remove anything that does not serve the user.

---

# 53. Product Personality Rules

OrbitOne should say:

```text
Got it.
I'll take it from here.

I've found the best option.

I need your approval before I continue.

I couldn't complete that.
```

OrbitOne should NOT say:

```text
Absolutely!!! 😊
I'd be delighted to help you with that!
As an AI assistant, I can...
```

The voice is:

> Friendly + confident + concise.

---

# 54. Signature Demo Experience

The main hackathon demo should feel cinematic but must be driven by real backend behavior.

Example request:

```text
Organize a cybersecurity workshop for 60 students
next Friday from 2 PM to 4 PM.
We need computers and a projector.
```

Expected experience:

```text
IDLE
  ↓
Core wakes
  ↓
Understanding request
  ↓
Checking organization policy
  ↓
Searching available locations
  ↓
Checking equipment
  ↓
Budget calculation
  ↓
Best option identified
  ↓
Approval required
  ↓
Core moves to center
  ↓
Approval card appears
  ↓
User approves
  ↓
Backend state changes
  ↓
OrbitOne continues
  ↓
Completion pulse
  ↓
Tiny ✦
  ↓
Event becomes part of Orbit
```

The exact timing must NOT be hardcoded if the backend is still processing.

Visual transitions should respond to actual application state.

---

# 55. Completion Experience

When an event is completed:

1. Core performs a short inward energy contraction.
2. A subtle radial pulse expands.
3. A tiny ✦ appears.
4. The interface settles.
5. The event becomes part of the user's operational history.
6. OrbitOne returns to a calm state.

Do not use confetti.

The feeling should be:

> quietly satisfying.

---

# 56. Design Quality Bar

Before considering a screen complete, ask:

### Does it look like a generic AI dashboard?

If yes, redesign.

### Is every glass surface necessary?

If no, remove some.

### Is the purple doing too much?

Reduce it.

### Are animations communicating state?

If no, remove them.

### Is the Core meaningful on this screen?

If no, reduce or remove it.

### Is information easy to scan?

If no, simplify.

### Is the interface responsive?

If no, fix layout before adding effects.

### Is the visual polish hiding a functional problem?

If yes, fix functionality first.

---

# 57. Implementation Priority

Build in this order:

## Phase 1: Foundation

- Global theme
- Typography
- Background
- Glass system
- Cursor
- Core
- Responsive layout
- Sidebar

## Phase 2: Welcome

- Full-screen Core
- Command input
- Intro animation

## Phase 3: Dashboard

- Real API data
- Needs You
- In Motion
- Upcoming
- Recent Orbit

## Phase 4: New Event

- Natural-language input
- Real agent endpoint
- State handling
- Cinematic transition

## Phase 5: Active Run

- Core
- Timeline
- Context
- Real activity/progress

## Phase 6: Event Details

- Real event
- Location
- Tasks
- Budget
- Approval

## Phase 7: Approval Center

- Real pending approvals
- Approve/reject
- Backend state updates
- Approval animation

## Phase 8: Tasks

- Real tasks
- Kanban
- Completion states

## Phase 9: Orbit

- Activity timeline
- Active event orbital visualization

## Phase 10: Audit

- Technical detail
- Progressive disclosure

## Phase 11: Polish

- Refraction
- Particles
- Parallax
- Microinteractions
- Empty states
- Error states
- Reduced-motion support
- Performance optimization

---

# 58. Working Rules for AI Coding Agents

This document is the design source of truth.

When implementing the frontend:

### DO

- Inspect the existing repository before changing anything.
- Inspect the backend API and response schemas.
- Reuse the existing project setup where possible.
- Build reusable components.
- Use real backend data.
- Preserve existing backend functionality.
- Keep frontend changes isolated to frontend-related files.
- Test builds frequently.
- Test API integration.
- Check responsive behavior.
- Keep animations performant.
- Follow this design language consistently.

### DO NOT

- Modify backend logic unless explicitly required for frontend integration and approved.
- Create fake API endpoints.
- Add dummy data to make screens look populated.
- Commit secrets.
- Commit `.env` files.
- Replace working backend functionality.
- Add random dependencies without checking necessity.
- Rewrite the entire repository unnecessarily.
- Generate a generic dashboard template.
- Add unnecessary AI chat UI.
- Add visual effects just because they look impressive.
- Sacrifice functionality for aesthetics.

---

# 59. Git / Repository Rule for Claude Code or Other Coding Agents

The coding agent is being used as a development tool, not as a repository contributor.

The agent should:

- Work locally in the existing OrbitOne repository.
- Modify only the frontend implementation and necessary frontend configuration.
- NOT create a new GitHub contributor identity.
- NOT add itself as a contributor.
- NOT create or use a separate GitHub account.
- NOT invite or add any user to the repository.
- NOT change repository permissions.
- NOT create GitHub collaborators.
- NOT push to GitHub unless explicitly instructed by the human developer.
- NOT create commits unless explicitly requested.
- NOT create pull requests unless explicitly requested.
- NOT modify GitHub repository settings.
- NOT alter branch protection.
- NOT alter remotes.
- NOT force-push.
- NOT rewrite Git history.
- NOT commit secrets or credentials.

The human developer remains the repository owner and controls:

- Git commits
- GitHub pushes
- Pull requests
- Branches
- Repository permissions
- Contributors

If the coding agent needs to verify Git status, it may run read-only Git commands.

Preferred workflow:

```text
Human developer
      ↓
opens local OrbitOne repository
      ↓
coding agent works locally
      ↓
agent modifies frontend
      ↓
agent runs build/tests
      ↓
human reviews changes
      ↓
human commits
      ↓
human pushes to GitHub
```

---

# 60. Final Design Statement

OrbitOne should feel like:

> **A luxury Apple product from 2030 that has somehow become a magical operating system for getting things done.**

It should be:

**Dark.**
**Purple.**
**Glass.**
**Spatial.**
**Alive.**
**Calm.**
**Intelligent.**
**Premium.**

The Core is the agent.

The four-point star is the intelligence mark.

Purple represents autonomous intelligence.

Amber represents human attention.

Orbit represents connected work.

Glass represents information existing inside the AI environment.

Motion communicates state.

The interface is minimal until complexity becomes necessary.

And throughout the product, the feeling should be:

> **I'll take it from here.**
