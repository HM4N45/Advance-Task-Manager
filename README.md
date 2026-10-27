# TaskFlow — Smart Student Productivity Manager

A complete frontend-only web application for managing student tasks, deadlines, and productivity. Built as a university **Software Engineering** project using HTML5, CSS3, and Vanilla JavaScript.

---

## Problem Statement

University students juggle assignments, exams, labs, and group projects across multiple subjects. Many rely on scattered notes or generic to-do apps that lack academic context (subjects, priorities, overdue visibility). There is a need for a focused, offline-capable productivity tool that helps students organize tasks, visualize workload, and track completion without requiring accounts or a backend.

---

## Project Objectives

1. Provide a polished, modern dashboard for daily student productivity.
2. Support full task lifecycle: create, edit, complete, delete, duplicate.
3. Offer multiple views: list, Kanban (drag-and-drop), calendar, and analytics.
4. Persist all data in the browser using `localStorage`.
5. Deliver a professional UI with light/dark themes suitable for demonstration and evaluation.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | User can create tasks with title, description, subject, due date/time, priority, status, and tags. |
| FR2 | User can edit, delete (with confirmation), and duplicate tasks. |
| FR3 | User can mark tasks complete/incomplete from list or details. |
| FR4 | User can search, filter (status/priority/subject), and sort tasks. |
| FR5 | Overdue tasks are visually highlighted. |
| FR6 | Kanban board allows drag-and-drop between To Do / In Progress / Completed. |
| FR7 | Calendar shows tasks on due dates; user can navigate months and select a day. |
| FR8 | Dashboard and Analytics show live stats and Chart.js charts derived from stored tasks. |
| FR9 | User can export tasks as CSV and import from JSON. |
| FR10 | Dark/light mode preference is saved. |
| FR11 | Demo sample tasks load on first visit; user can clear all data. |
| FR12 | Notification badge shows overdue and near-due tasks. |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | Runs entirely in the browser; no server, API keys, or login. |
| NFR2 | Responsive layout for desktop, tablet, and mobile. |
| NFR3 | Accessible labels, keyboard-friendly controls, and clear empty states. |
| NFR4 | Code organized in separate HTML / CSS / JS files; readable for beginners. |
| NFR5 | Graceful handling of invalid import files and empty titles. |

---

## Main Features

- **Dashboard** — Summary cards, recent tasks, upcoming deadlines, weekly & priority charts  
- **All Tasks** — Full list with search, filters, and sort  
- **My Day** — Focus view for today’s and overdue work  
- **Kanban Board** — Drag-and-drop status columns  
- **Calendar** — Monthly view with task dots and day detail  
- **Analytics** — Completion rate, pending vs completed, priority, weekly, and category charts + text summary  
- **Settings** — Theme toggle, CSV export, JSON import, demo data, clear all  
- **Dark / Light mode** with persistent preference  
- **Toast notifications** and custom confirm dialogs  

---

## Technologies Used

- **HTML5** — Structure and semantics  
- **CSS3** — Custom properties, Flexbox/Grid, responsive design, transitions  
- **Vanilla JavaScript** — All logic, SPA-style navigation, localStorage  
- **Chart.js** (CDN) — Analytics charts  
- **Lucide Icons** (CDN) — UI icons  
- **Google Fonts (Inter)** — Typography  
- **Browser localStorage** — Persistence  

No React, no backend, no build tools required.

---

## File Structure

```
TaskFlow/
├── index.html    # App shell, modals, layout
├── style.css     # All styles (light/dark themes)
├── script.js     # Application logic
├── theme-init.js # Applies saved theme before first paint
├── _headers      # Security headers (Netlify / Cloudflare Pages)
├── vercel.json   # Security headers (Vercel)
├── .nojekyll     # Lets GitHub Pages serve files as-is
└── README.md     # This file
```

---

## How to Run

### Option A — VS Code Live Server (recommended)

1. Open the `TaskFlow` folder in **Visual Studio Code**.
2. Install the **Live Server** extension if you do not have it.
3. Right-click `index.html` → **Open with Live Server**.
4. The app opens in your browser (usually `http://127.0.0.1:5500`).

### Option B — Double-click

1. Open `index.html` directly in Chrome, Edge, or Firefox.
2. Note: Some browsers restrict `localStorage` on `file://` in rare cases; Live Server is preferred.

### Option C — Simple local server

```bash
cd TaskFlow
python -m http.server 8080
# Then open http://localhost:8080
```

---

## How localStorage Works

- Tasks are saved under the key `taskflow_tasks` as a JSON array.
- Theme and settings are saved under `taskflow_settings`.
- On first visit, sample demo tasks are loaded once (flag: `taskflow_demo_loaded`).
- Closing the tab and reopening restores all tasks and preferences.
- Clearing site data / localStorage in browser settings will reset the app.

**Limitation:** Data stays only in that browser on that device. There is no cloud sync or multi-device sharing. This is intentional for a frontend-only academic project.

---

## Limitations of a Frontend-Only Application

- No multi-user collaboration or shared boards  
- No server-side validation or backup  
- Data can be lost if the user clears browser storage  
- Charts and stats are computed client-side from the current task list  
- Import accepts only well-formed JSON arrays of task-like objects  

These constraints keep the project focused on UI/UX, client-side architecture, and Software Engineering documentation rather than full-stack complexity.

---

## Basic Test Cases

| # | Test | Expected result |
|---|------|-----------------|
| 1 | Create task with title only | Task appears in All Tasks and Dashboard |
| 2 | Create task with empty title | Error toast; task not saved |
| 3 | Edit task title and priority | Changes persist after refresh |
| 4 | Mark task complete | Status updates; completion rate increases |
| 5 | Delete task (confirm) | Task removed from all views |
| 6 | Drag task on Kanban | Status updates; counts refresh |
| 7 | Filter by “Urgent” | Only urgent tasks shown |
| 8 | Switch to dark mode | Theme applies and survives reload |
| 9 | Export CSV | File downloads with task rows |
| 10 | Import invalid JSON | Error toast; existing tasks unchanged |
| 11 | Clear all tasks | List empty; stats zero |
| 12 | Calendar next/prev month | Correct days and task dots |

---

## How to Present This Project to a Software Engineering Teacher

1. **Start with the problem** — Explain student workload and the need for a focused productivity tool.  
2. **Show the live app** — Open Dashboard, create a task, complete it, switch to Kanban and drag a card, open Calendar and Analytics.  
3. **Highlight requirements mapping** — Point to the FR/NFR tables and demonstrate each major feature.  
4. **Architecture** — Emphasize separation of HTML / CSS / JS, SPA-style navigation without a framework, and localStorage as the “database.”  
5. **Quality** — Mention responsive design, accessibility (labels, Escape to close modals), validation, and confirm dialogs.  
6. **Trade-offs** — Honestly state frontend-only limitations and why they fit a course project scope.  
7. **Demo data** — Use the built-in sample tasks so the charts and overdue badge are non-empty during the presentation.  
8. **Close** — Summarize what you learned (DOM, state management, Chart.js, UX patterns) and possible future work (optional backend, PWA offline, reminders).

---

## Author Notes

Built for academic demonstration. All statistics and charts are calculated from real tasks stored in `localStorage` — no fake or random numbers.

**TaskFlow** © Student Project — Software Engineering


---

## Deployment

TaskFlow is a static site: there is no build step. Publish the folder root.

| Host | Steps |
|------|-------|
| **Netlify** | Drag the `TaskFlow` folder onto app.netlify.com/drop, or connect the repo (build command: none, publish directory: `.`). `_headers` is applied automatically. |
| **Vercel** | `npx vercel --prod` from the folder (framework: Other, no build). `vercel.json` is applied automatically. |
| **GitHub Pages** | Push to a repo, then Settings → Pages → deploy from branch, root folder. `.nojekyll` is included. |
| **Cloudflare Pages** | Connect the repo, no build command, output directory `/`. `_headers` is applied automatically. |

Chart.js and Lucide load from jsDelivr at pinned versions. The CSP in `_headers` / `vercel.json` only allows that CDN, so if you swap CDNs or add inline scripts, update the CSP too. If the CDN is unreachable the app still works; icons and charts are simply missing.

## Fix log

- Modals, notification panel and badge were always visible (`display:flex` overrode `[hidden]`).
- All Tasks filters reset after each change; they are now kept in state.
- Calendar and weekly chart used UTC dates, so tasks landed on the wrong day in some timezones; they now use local dates.
- Weekly "Completed" counted by creation date; tasks now record `completedAt`.
- Calendar skipped months when navigating from the 29th-31st.
- Charts leaked on every re-render; old charts are destroyed first.
- `escapeHtml` did not escape quotes; imported dates were not validated; CSV export now guards against spreadsheet formula injection and includes a UTF-8 BOM.
- Task actions were hover-only (unusable on touch); the task checkbox is now keyboard accessible.
- CDN libraries are pinned (Lucide was `@latest`) and the app degrades gracefully if they fail to load.
- Storage errors (private mode, quota) no longer crash saves.

Known limitation: Kanban drag-and-drop uses the HTML5 drag API, which most mobile browsers do not support. On phones, change status via Edit or the checkbox.
