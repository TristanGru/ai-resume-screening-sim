# AI Resume Screening Simulator

An interactive educational tool that shows how Applicant Tracking Systems (ATS) score and filter resumes — built for UVA's *AI and Humanity* course.

## What It Does

You paste a resume, pick a target role, and watch five simulated AI screeners evaluate it in real time. Each screener models a different algorithmic bias or heuristic found in real hiring software. You can then edit the resume and re-run to see scores shift — including how keyword stuffing backfires.

### The Five Screeners

| ID | Name | What It Measures |
|----|------|-----------------|
| S1 | ATS Parser | Structural formatting — section headers, bullet length, contact info |
| S2 | Keyword Match | Role-specific keyword density against a job description |
| S3 | Seniority Fit | Level signals (titles, years of experience, scope language) |
| S4 | Impact Evidence | Quantified achievements — numbers, metrics, percentages |
| S5 | Spam Risk | Keyword stuffing and manipulation detection |

A **Robust Score** aggregates all five with a spam penalty: `mean(S1–S5) − max(0, (100 − S5) × 0.2)`.

## Key Features

- **Live resume editor** — edit and re-run screeners without losing prior results
- **Score trajectory chart** — visualizes how scores change across edits
- **Conflict detection** — flags when screeners disagree (e.g. S2 up, S5 down on stuffed keywords)
- **Three sample resumes** — well-structured, keyword-stuffed, and sparse, to demonstrate algorithm behavior
- **No backend, no data collection** — everything runs client-side in the browser

## Tech Stack

- React 18 + Vite 5
- React Router v6 (HashRouter for static hosting)
- Recharts 2 (trajectory chart)
- CSS Modules + custom design tokens
- Vitest + Testing Library (49 tests)

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # run all 49 tests
npm run build      # production build
```

## Educational Purpose

This simulator is not a real ATS. It is a teaching tool designed to make algorithmic resume screening legible — showing what these systems optimize for, where they fail, and how candidates (and employers) can be misled by scores that look objective but encode specific assumptions about what a "good" resume looks like.

Built for the *AI and Humanity* final project, University of Virginia, Spring 2026.
