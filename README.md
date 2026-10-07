# ASTRO MED
1.serious time a auto oi chard ta full screen hoya jabe.***

🚀 Crew Health Monitoring Console

Project Planning Document

Project Type: Space Health Monitoring Web Application
Target: NASA Space Apps / Space Technology Hackathon
Frontend: React + TypeScript + Tailwind CSS
Backend: FastAPI + WebSocket
Charts: Plotly.js / Recharts
Data: Simulated crew-health data
Research: NASA OSDR metadata
License: Apache-2.0

1. Project Vision

Build a modern space-mission health monitoring console that helps astronauts and mission operators understand changes in crew health indicators during long-duration missions.

The system continuously monitors:

❤️ Heart Rate

📈 HRV

🫁 SpO2

😴 Sleep Hours

🌡️ Core Temperature

🏃 Exercise Minutes

The system compares current measurements against each crew member's personal historical baseline and generates transparent alerts when significant deviations occur.

The system does not diagnose diseases.

2. Problem Statement

Long-duration space missions can expose astronauts to:

Microgravity

Radiation

Isolation

Confinement

Sleep disruption

Altered exercise patterns

Environmental stress

During a long mission, subtle changes in multiple health indicators may be difficult to notice manually.

The application should help the crew identify:

"What changed compared with my normal pattern?"

rather than:

"What disease do I have?"

3. Main Goal

Create a single dashboard where a crew member can see:

Current health indicators

Personal baseline

Deviations from baseline

Multi-signal changes

Alert history

Plain-language explanations

Related NASA OSDR research

Mission timeline

4. Core Product Concept

                 CREW HEALTH DATA
                        │
                        ▼
               Personal Baseline
                        │
                        ▼
                Statistical Rules
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       Single Signal         Multi Signal
         Deviation             48 Hours
             │                     │
             └──────────┬──────────┘
                        ▼
                     ALERT
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       Health Console       Explanation Agent
                                   │
                                   ▼
                              OSDR Studies


5. Important Safety Principle

The application is a monitoring and explanation tool, not a medical diagnostic system.

The application must never claim:

"You have heart disease."

"You have arrhythmia."

"You need medication."

"Stop exercising."

"Take this treatment."


Instead:

"Heart rate is significantly above the personal baseline."

"SpO2 is outside the monitored baseline range."

"Two monitored signals deviated within 48 hours."


6. Simulated Data

The project will initially use simulated data.

Every major screen must clearly display:

🟡 SIMULATED DATA


Example:

┌──────────────────────────────────────────────┐
│ CREW HEALTH MONITOR          🟡 SIMULATED    │
└──────────────────────────────────────────────┘


This prevents users from confusing the demo data with real medical measurements.

7. Target Users

Primary User

Astronaut / Crew Member

Needs:

Simple health overview

Personal baseline

Important alerts

Easy-to-understand explanation

Secondary User

Mission Health Operator

Needs:

Detailed signal history

Alert history

Multi-signal events

Crew overview

Research references

8. Website Pages

The application should have the following main pages.

8.1 Dashboard

Main real-time monitoring interface.

8.2 Crew Profile

Shows:

Crew ID

Mission information

Current status

Personal baseline overview

8.3 Signals

Detailed visualization of all six signals.

8.4 Alerts

Complete alert history.

8.5 Alert Details

Detailed explanation of one alert.

8.6 Research / OSDR

Shows related NASA OSDR studies.

8.7 Mission Timeline

Displays health events over mission time.

8.8 Settings

Contains:

Replay speed

Chart settings

Threshold configuration

Display preferences

9. Dashboard Layout

The dashboard should be the primary screen.

┌───────────────────────────────────────────────────────┐
│ 🚀 CREW HEALTH MONITOR       🟡 SIMULATED DATA       │
│ Mission: AURORA-01                    Crew: C-01     │
├───────────────────────────────────────────────────────┤
│                                                       │
│ ❤️ HR       📈 HRV       🫁 SpO2                     │
│ 72 bpm      54 ms       98%                          │
│ NORMAL      NORMAL      NORMAL                       │
│                                                       │
│ 😴 Sleep    🌡 Temp     🏃 Exercise                  │
│ 7.4 h       36.8°C      42 min                       │
│ NORMAL      NORMAL      NORMAL                       │
│                                                       │
├───────────────────────────────────────────────────────┤
│ LIVE HEALTH SIGNALS                                   │
│                                                       │
│        Interactive chart                              │
│                                                       │
├───────────────────────────────────────────────────────┤
│ ALERTS                                                │
│                                                       │
│ No active alerts                                     │
│                                                       │
├───────────────────────────────────────────────────────┤
│ CREW SUMMARY                                          │
│                                                       │
│ Current measurements are within personal baseline.    │
└───────────────────────────────────────────────────────┘


10. Navigation

Use a modern sidebar.

🚀 Mission Health

Dashboard
Crew Profile
Live Signals
Alerts
Timeline
Research
Settings


Bottom:

● System Online

SIMULATED MODE


11. Visual Design

Use a modern space mission control aesthetic.

Design Direction

Dark background

Glassmorphism panels

Subtle gradients

Thin borders

Soft glow effects

High readability

Minimal animation

NASA-inspired mission-console feeling

Avoid making the interface look like a generic hospital dashboard.

12. Color System

Suggested semantic colors:

Background:
#050816

Panel:
#0B1220

Primary:
#38BDF8

Normal:
#22C55E

Warning:
#F59E0B

Alert:
#EF4444

Text:
#E5E7EB

Muted:
#94A3B8


Do not use red for everything.

Red should primarily indicate significant alerts.

13. Health Cards

Each health metric should have:

Signal name
Current value
Unit
Baseline
Status
Mini sparkline


Example:

┌──────────────────────┐
│ ❤️ HEART RATE        │
│                      │
│ 72 bpm               │
│                      │
│ Baseline: 70–82      │
│                      │
│ ● NORMAL             │
│       ╱╲╱╲╲╱         │
└──────────────────────┘


14. Six Required Signals

Heart Rate

Unit: bpm


HRV

Unit: ms


SpO2

Unit: %


Sleep

Unit: hours


Core Temperature

Unit: °C


Exercise

Unit: minutes


15. Live Chart

The main chart should support:

Zoom

Pan

Hover values

Time range

Baseline

Baseline band

Alert markers

Example:

120 ┤                    ●
110 ┤                  ●
100 ┤                ●
 90 ┤────── baseline upper ─────
 80 ┤────── baseline mean ──────
 70 ┤────── baseline lower ─────
 60 ┤
    └───────────────────────────
             TIME →


The baseline band must be visually behind the current signal.

16. Baseline Visualization

Show:

Current Value
Baseline Mean
Upper Bound
Lower Bound


Example:

Heart Rate

Current: 112 bpm

Personal baseline:
Mean = 74.5 bpm

Normal band:
58.1 – 90.9 bpm


17. Replay System

The application should simulate live mission data.

Speed controls:

0.5x
1x
2x
5x
10x


UI:

Replay Speed

[ 1x ▼ ]

▶ Running
⏸ Pause
↻ Restart


18. WebSocket Architecture

Frontend:

React
   │
   │ WebSocket
   ▼
FastAPI
   │
   ▼
vitals.json


WebSocket:

/ws/vitals


Example message:

{
  "type": "vital_update",
  "simulated": true,
  "data": {
    "timestamp": "2026-01-01T00:00:01Z",
    "crew_id": "CREW-01",
    "heart_rate": 74,
    "hrv": 55,
    "spo2": 98,
    "sleep_hours": 7.4,
    "core_temperature": 36.8,
    "exercise_minutes": 36
  }
}


19. Detection Engine

All anomaly detection must happen in Python.

Location:

src/compute/


Never use the LLM to calculate alerts.

20. Rolling Personal Baseline

For every signal calculate:

rolling mean
rolling standard deviation


Concept:

Baseline = individual's own historical measurements


This avoids relying only on population-level thresholds.

21. Z-Score Rule

Formula:

z = (value - mean) / standard_deviation


Default:

threshold = 3.0


Alert:

abs(z) >= 3


Example:

Current HR = 112
Mean = 74.5
Std = 8.2

z = (112 - 74.5) / 8.2
z = 4.57

ALERT


22. Multi-Signal Rule

Detect when:

2 or more signals


show deviations within:

48 hours


Example:

Day 1:
Heart Rate → deviation

Day 2:
SpO2 → deviation

Difference < 48 hours

↓

MULTI-SIGNAL ALERT


23. Alert Severity

Avoid medical severity labels.

Use computational status:

INFO
DEVIATION
MULTI-SIGNAL


Example:

⚠ SIGNAL DEVIATION

⚠ MULTI-SIGNAL 48H


This keeps the system from implying medical diagnosis.

24. Alert Object

Example:

{
  "alert_id": "ALT-001",
  "timestamp": "2026-01-03T12:00:00Z",
  "crew_id": "CREW-01",
  "rule": "Z_SCORE_DEVIATION",
  "signal": "heart_rate",
  "value": 112,
  "baseline_mean": 74.5,
  "baseline_std": 8.2,
  "z_score": 4.57,
  "threshold": 3.0,
  "simulated": true
}


25. Alert Center

Create a dedicated alert page.

Filters:

All
Single Signal
Multi Signal
Recent


Each alert:

MULTI-SIGNAL 48H

12:43 UTC

Heart Rate
112 bpm
Baseline: 74.5
Z-score: 4.57

SpO2
91%
Baseline: 97.2
Z-score: -3.21

[View Details]


26. Alert Details Page

When the user clicks an alert:

← Back to Alerts

MULTI-SIGNAL 48H

Detected:
12:43 UTC

Signals:

Heart Rate
112 bpm
Baseline 74.5 bpm
Z-score 4.57

SpO2
91%
Baseline 97.2%
Z-score -3.21

Detection window:
48 hours

Data:
SIMULATED


27. Explanation Panel

Add:

🤖 Explain this alert


The explanation should be simple.

Example:

What changed?

Heart rate is 112 bpm compared with a personal
baseline mean of 74.5 bpm.

SpO2 is 91% compared with a baseline of 97.2%.

Both measurements deviated from their monitored
personal baselines within the 48-hour window.

This information describes statistical deviation
and does not establish a medical diagnosis.


28. OSDR Research Panel

Display:

Related NASA Research

OSDR-1234

Example Spaceflight Health Study

[View Study ↗]


Each research item should contain:

Study ID
Title
Description
URL
Relevant signals


Only use verified study metadata.

29. Explanation Agent Input

The agent receives:

Alert Object
+
Cached OSDR Metadata


Nothing else.

The frontend should never send the complete health history to the explanation agent unless specifically required by the architecture.

30. AI Safety Layer

Implement two layers.

Layer 1

Strict system prompt.

Layer 2

Post-generation safety checker.

LLM Response
      │
      ▼
Safety Checker
      │
   ┌──┴──┐
 PASS   BLOCK
  │       │
  ▼       ▼
Display  Safe fallback


31. Crew Summary

The dashboard should automatically provide a short summary.

Normal:

All monitored signals are currently within
the personal baseline range.


Single deviation:

Heart rate is currently outside the personal
baseline range.


Multiple:

Two monitored signals have deviated from their
personal baselines within the last 48 hours.


32. Mission Timeline

Create a horizontal timeline:

MISSION DAY 1 ───── DAY 2 ───── DAY 3 ───── DAY 4

        ●             ●
      Normal      Deviation

                    ●
               Multi-signal


Clicking an event opens its details.

33. Crew Profile

Example:

CREW-01

Mission:
AURORA-01

Mission Day:
142

Monitoring:
ACTIVE

Data:
SIMULATED


Display baseline summary:

Heart Rate       68–82 bpm
HRV              42–65 ms
SpO2             96–99 %
Sleep            6.8–8.0 h
Temperature      36.5–37.0 °C
Exercise         30–60 min


34. Research Page

Structure:

NASA OSDR RESEARCH

Search studies

[___________________]

Study cards:

OSDR-XXXX
Study Title

Signals:
HR | Sleep | SpO2

[View Study]


35. Settings

Include:

Replay Speed
Baseline Window
Z-score Threshold
Multi-signal Window
Chart Time Range


For hackathon demo, advanced settings can be read-only or hidden under:

Advanced Settings


36. Backend Technology

Use:

Python
FastAPI
WebSocket
Pydantic
NumPy
Pytest


Backend responsibilities:

Data replay
WebSocket
Detection
Baseline calculation
Alert generation
OSDR metadata
Explanation endpoint


37. Frontend Technology

Use:

React
TypeScript
Vite
Tailwind CSS
Recharts or Plotly
Lucide Icons


Recommended UI architecture:

App
│
├── Sidebar
├── TopBar
│
├── Dashboard
│   ├── VitalCards
│   ├── SignalChart
│   ├── AlertPreview
│   └── CrewSummary
│
├── Alerts
│   ├── AlertFilters
│   └── AlertCard
│
├── AlertDetails
│   ├── AlertValues
│   ├── Explanation
│   └── Research
│
├── Timeline
├── Research
└── Settings


38. Folder Structure

crew-health-monitor/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── charts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── websocket.py
│   ├── models.py
│   └── api/
│
├── src/
│   └── compute/
│       ├── baseline.py
│       ├── zscore.py
│       ├── multi_signal.py
│       └── rules.py
│
├── demo_fixtures/
│   ├── vitals.json
│   ├── vitals_clean.json
│   └── vitals_anomaly.json
│
├── agent/
│   ├── explanation.py
│   ├── prompt.txt
│   └── safety_check.py
│
├── data/
│   └── osdr_metadata.json
│
├── tests/
│   ├── test_baseline.py
│   ├── test_zscore.py
│   └── test_multi_signal.py
│
├── README.md
├── PROJECT_PLAN.md
├── LICENSE
├── requirements.txt
└── .env.example


39. Data Flow

vitals.json
     │
     ▼
Replay Engine
     │
     ▼
FastAPI WebSocket
     │
     ├───────────────► Frontend
     │
     ▼
Detection Engine
     │
     ├── Baseline
     ├── Z-score
     └── 48h rule
     │
     ▼
Alert Object
     │
     ├──────────────► Alert UI
     │
     └──────────────► Explanation Agent
                              │
                              ▼
                         OSDR Metadata


40. Testing Strategy

Every rule must have two fixture categories.

Clean Fixture

Expected:

No false alert


Anomaly Fixture

Expected:

Correct alert


Test:

Baseline
Z-score
Single signal
Multi-signal
48-hour window


Run:

pytest -q


41. Development Plan

Phase 1 — Project Setup

Create:

Git repository
React app
FastAPI app
Folder structure
Environment variables


Deliverable:

Frontend + Backend running


42. Phase 2 — Dashboard UI

Build:

Sidebar
Header
Vital cards
Charts
Alert panel
Summary


Use mock data first.

Deliverable:

Complete visual dashboard


43. Phase 3 — Live Replay

Implement:

vitals.json
FastAPI
WebSocket
Replay speed
Pause
Restart


Deliverable:

Live simulated data flowing into dashboard


44. Phase 4 — Detection Engine

Implement:

Rolling baseline
Z-score
Multi-signal 48h
Alert object


Deliverable:

Real alerts generated from replayed data


45. Phase 5 — Testing

Create planted anomalies.

Test:

Clean → no alert
Anomaly → alert
Two signals <48h → multi-signal
Two signals >48h → no multi-signal


Deliverable:

All automated tests passing


46. Phase 6 — Explanation Agent

Implement:

Alert → Agent
OSDR metadata → Agent
Agent → Safety checker
Safety checker → UI


Deliverable:

Safe plain-language explanation


47. Phase 7 — OSDR Integration

Add verified study metadata.

Each study:

Study ID
Title
URL
Relevant signal
Short description


Deliverable:

Research references visible in alert details


48. Phase 8 — Polish

Improve:

Animations
Loading states
Error states
Responsive design
Mobile layout
Empty states
Chart interactions
Accessibility


49. Phase 9 — Hackathon Demo

Create one controlled demo scenario.

Start:

Normal


Then:

Single deviation


Then:

Second signal deviation


Then:

Multi-signal 48h alert


Then:

Open explanation


Then:

Show OSDR reference


50. MVP

If development time is limited, build only:

✓ Dashboard
✓ Six vital cards
✓ Live chart
✓ Personal baseline
✓ Z-score alert
✓ Multi-signal alert
✓ Alert list
✓ WebSocket replay
✓ Simulated-data label
✓ Explanation panel
✓ OSDR citation


51. Advanced Features

If time remains:

+ Mission timeline
+ Multiple crew members
+ Crew comparison
+ Historical replay
+ Chart zoom
+ Alert filtering
+ Export alert report
+ Dark/light mode
+ Offline demo mode
+ Research search
+ Notification system


52. Error States

The UI should handle:

WebSocket disconnected

⚠ CONNECTION LOST

Attempting to reconnect...


No data

No telemetry available.


Agent unavailable

Explanation service unavailable.

Alert data is still available.


OSDR unavailable

Research metadata unavailable.


The core monitoring dashboard should continue working without the explanation agent.

53. Performance

Target:

Smooth live chart
Low WebSocket latency
No unnecessary re-rendering
Bounded chart history


For example:

Keep last 500–1000 points in frontend memory.


54. Responsive Design

Desktop:

Sidebar + dashboard


Tablet:

Collapsible sidebar
2-column cards


Mobile:

Bottom navigation / collapsible menu
1-column cards
Scrollable charts


55. Accessibility

Implement:

Keyboard navigation
Readable contrast
ARIA labels
Clear alert icons
Text + icon status
Do not rely only on color


For example:

⚠ DEVIATION


instead of only:

red card


56. Security

Never commit:

.env
API keys
LLM tokens
Credentials
Real health data


Use:

.env.example


Example:

LLM_API_KEY=
LLM_MODEL=
BACKEND_URL=http://localhost:8000


57. Git Workflow

Recommended branches:

main
develop

feature/dashboard
feature/websocket
feature/detection
feature/agent
feature/osdr
feature/testing


Commit style:

feat: add live vital dashboard
feat: implement z-score detection
feat: add multi-signal rule
test: add anomaly fixtures
feat: add OSDR explanation
fix: handle websocket reconnect


58. Team Division

Developer 1 — Frontend

Responsible for:

Dashboard
Charts
Alerts
Responsive UI


Developer 2 — Backend

Responsible for:

FastAPI
WebSocket
Replay engine
API


Developer 3 — Data/Algorithms

Responsible for:

Baseline
Z-score
Multi-signal
Fixtures
Tests


Developer 4 — AI/Research

Responsible for:

OSDR metadata
Explanation agent
Safety checker
Research UI


If there are only 2 people:

Person 1 → Frontend + UI
Person 2 → Backend + Detection + Agent


59. Demo Story

The presentation should tell one simple story.

Scene 1

Astronaut dashboard is normal.

All signals within personal baseline.


Scene 2

Heart rate changes.

Z-score deviation detected.


Scene 3

SpO2 also changes.

Two signals deviated within 48 hours.


Scene 4

Dashboard generates:

MULTI-SIGNAL 48H


Scene 5

Crew member opens:

Explain Alert


Scene 6

System explains:

What changed
Exact numbers
Baseline difference
OSDR reference


Scene 7

Safety layer demonstrates:

No diagnosis
No treatment recommendation


60. Key Differentiator

The project should not be presented as:

"AI diagnoses astronauts."

Instead present it as:

"A transparent personal-baseline monitoring system that helps astronauts notice meaningful changes in their own health signals."

The AI is an explanation layer, not the detection engine.

61. Final Product Flow

          SIMULATED TELEMETRY
                  │
                  ▼
           LIVE DASHBOARD
                  │
                  ▼
        PERSONAL BASELINE
                  │
                  ▼
          STATISTICAL RULES
                  │
          ┌───────┴───────┐
          ▼               ▼
       DEVIATION      MULTI-SIGNAL
          │               │
          └───────┬───────┘
                  ▼
                ALERT
                  │
          ┌───────┴────────┐
          ▼                ▼
      Exact Values      Explanation
                           │
                           ▼
                       OSDR Study
                           │
                           ▼
                     Safe Summary


62. Final Definition of Done

The project is ready for submission when:

[ ] Dashboard is functional

[ ] Six signals are visible

[ ] Data is clearly labeled simulated

[ ] WebSocket replay works

[ ] Speed control works

[ ] Personal baseline works

[ ] Baseline band appears behind chart

[ ] Z-score rule works

[ ] Multi-signal 48h rule works

[ ] Exact alert values are shown

[ ] Clean fixture tests pass

[ ] Anomaly fixture tests pass

[ ] Explanation agent works

[ ] Agent receives only alert + OSDR metadata

[ ] Diagnostic language is blocked

[ ] Treatment recommendations are blocked

[ ] OSDR study ID is displayed

[ ] OSDR URL is displayed

[ ] Responsive UI works

[ ] Error states work

[ ] README is complete

[ ] Apache-2.0 license included

[ ] Public repository ready

63. Final Product Statement

Crew Health Monitoring Console is a real-time, explainable health-monitoring platform for long-duration space missions. It compares simulated crew telemetry against personal baselines, detects statistically significant deviations and multi-signal changes, and provides transparent explanations linked to NASA OSDR research—without making medical diagnoses or treatment recommendations.

64. Lovable Implementation Instruction

When using this plan with Lovable, build the frontend in this order:

1. App shell
2. Sidebar
3. Dashboard
4. Vital cards
5. Live charts
6. Baseline bands
7. Alert components
8. Timeline
9. Alert details
10. Explanation panel
11. Research page
12. Settings
13. Responsive design
14. Mock WebSocket data
15. Backend integration


Start with realistic mock data so the complete UI can be demonstrated before the FastAPI backend is connected.

The UI must always show:

🟡 SIMULATED DATA


and must never present simulated measurements as real astronaut medical data.

Build the app

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://astro-well-guide.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4acc5f0d-123e-54da-b9da-5947479cd72a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
