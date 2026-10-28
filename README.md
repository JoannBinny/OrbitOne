<div align="center">

# OrbitOne

### One agent. Every moving part.

An AI operations agent that turns a single plain-language request into a booked room, prep tasks, a budget check, and an approval request, while keeping a human in charge of the big decisions.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Strands Agents](https://img.shields.io/badge/Strands_Agents_SDK-black)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

<!-- Add a screenshot or demo GIF here, for example: ![OrbitOne dashboard](docs/screenshot.png) -->

## What it does

Organizing a workshop usually means checking room availability, creating tasks, estimating costs, and chasing approvals across chats, sheets, and forms. With OrbitOne you just describe the event:

```
Organize a web development workshop for 55 students
on September 11 from 10 AM to 1 PM.
We need computers and a projector.
```

The agent pulls the details out of the request, searches real organization data, and does the routine work itself. When money or a final decision is involved, it stops and asks a person.

## Features

**Natural language requests.** Describe the event once instead of filling in several forms.

**Room search and conflict detection.** Finds rooms that fit the headcount, equipment, and time slot, and suggests verified alternatives when the first choice is taken.

**Task and budget handling.** Creates preparation tasks, adds budget line items, and checks the total against the organization's approval threshold.

**Human-in-the-loop approvals.** Spending above the threshold creates an approval request. Approving it confirms the event and resumes the agent. Rejecting it cancels the event and releases the room.

**Audit trail.** Important agent actions are logged so you can see what happened and when.

## How it works

```
User request
     |
     v
Strands agent  -->  picks a tool  -->  FastAPI backend  -->  SQLite
     |
     v
Low risk: act directly      High risk: request approval --> approve / reject
     |
     v
Audit log
```

The database is the source of truth. The agent only works with organization data it gets through its tools, so it cannot make up rooms, budgets, or policies. Each tool is tied to one organization when a run starts, so a request can never touch another organization's data.

## Tech stack

| Part | Technology |
|------|------------|
| Agent | Strands Agents SDK |
| Backend | FastAPI |
| Database | SQLite |
| Frontend | Node.js web app |
| API | REST |

## Getting started

You'll need Python 3.10+, Git, and Node.js with npm for the frontend. You'll also need an API key for your LLM provider.

**1. Clone the repo**

```bash
git clone https://github.com/JoannBinny/OrbitOne.git
cd OrbitOne
```

**2. Set up Python**

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**3. Add your API key**

Create a `.env` file in the project root:

```
MODEL_API_KEY=your_api_key_here
```

Never commit this file. It's already covered by `.gitignore`.

**4. Start the backend**

```bash
cd backend
uvicorn backend.main:app --reload
```

The API runs at `http://localhost:8000`, and the interactive docs are at `http://localhost:8000/docs`.

**5. Start the agent**

```bash
python agent/main.py
```

**6. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

## Project structure

```
OrbitOne/
├── agent/          Strands agent and its tools
├── backend/        FastAPI app, models, seed data
├── frontend/       Web interface
├── requirements.txt
├── start-dev.sh
└── LICENSE
```

## Current limitations

This is a hackathon MVP, so a few things are intentionally simple:

Tasks only have a title and a status. Owners, due dates, and priorities aren't built yet.

The only policy is a per-organization budget threshold. There are no participant-count or booking-notice rules.

The agent doesn't send emails or notifications, and there is no calendar integration yet.

After an approval, the agent continues with a fresh run on the same event rather than restoring its earlier conversation state.

## Future ideas

Google Calendar and Outlook sync, Slack or Teams notifications, role-based access, recurring events, and deployment on Amazon Bedrock AgentCore.

## Hackathon

Built for the **Agents for Humans** hackathon, **Professional Agents** track.

## License

MIT. See [LICENSE](LICENSE) for details.
