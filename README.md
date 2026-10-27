# TaskFlow

**A smart productivity manager for university students.**

TaskFlow brings assignments, exams, labs and group projects into one clean workspace. Plan your week, drag tasks across a Kanban board, see deadlines on a calendar, and track your progress with live analytics. It runs entirely in the browser with no backend, no account and no setup.

Built with HTML5, CSS3 and vanilla JavaScript as a university **Software Engineering** project.

> **Live demo:** _add your deployed URL here_
> **Author:** _Your Name_ · _Your University / Course_

---

## Why TaskFlow?

Students juggle deadlines across many subjects, but generic to-do apps know nothing about academic life. They have no subjects, no priority levels and no clear view of what is overdue. TaskFlow is built around that context. It is fast, private (your data never leaves your device) and works offline once loaded.

## Features

| Area | What you get |
|------|--------------|
| **Dashboard** | Summary cards, recent tasks, upcoming deadlines, weekly and priority charts |
| **Task management** | Create, edit, duplicate, delete (with confirmation) and complete tasks, with title, description, subject, due date and time, priority, status and tags |
| **Search, filter, sort** | Search across title, description, subject and tags; filter by status, priority and subject; sort by deadline, priority or creation date |
| **My Day** | A focus view of what is due today plus anything overdue |
| **Kanban board** | Drag and drop cards between To Do, In Progress and Completed |
| **Calendar** | Monthly view with priority-coloured task dots and a per-day task list |
| **Analytics** | Completion rate, pending vs completed, priority and category breakdowns, a weekly trend and a plain-language summary |
| **Notifications** | Badge and panel for overdue and soon-to-be-due tasks |
| **Data tools** | Export to CSV, import from JSON, load demo data, clear all |
| **Experience** | Light and dark themes (remembered), toast messages, custom confirm dialogs, fully responsive layout |

All statistics and charts are calculated from your real stored tasks. Nothing is randomly generated.

## Tech Stack

- **HTML5** for semantic structure
- **CSS3** with custom properties (theming), Flexbox and Grid, responsive breakpoints
- **Vanilla JavaScript (ES6+)** for state, rendering, SPA-style navigation and the drag-and-drop API
- **Chart.js 4** for analytics charts (CDN)
- **Lucide** for icons (CDN)
- **Inter** from Google Fonts for typography
- **`localStorage`** as the persistence layer

No frameworks, no build tools, no dependencies to install.

## Getting Started

**Run locally**

```bash
# Option 1: open index.html directly in a modern browser
# Option 2 (recommended): serve the folder
python -m http.server 8080
# then visit http://localhost:8080
```

You can also use the **Live Server** extension in VS Code.

On first launch the app loads sample tasks so every view has data. You can clear them any time under **Settings → Clear All**.

## Deployment

TaskFlow is a static site with no build step, so you publish the folder root.

| Host | Steps |
|------|-------|
| **Netlify** | Drag the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop) |
| **Vercel** | Run `npx vercel --prod` (framework: Other, no build) |
| **GitHub Pages** | Push to a repo, then Settings → Pages → deploy from the root folder |
| **Cloudflare Pages** | Connect the repo, no build command, output directory `/` |

Security headers are included in `_headers` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel). The Content-Security-Policy only allows the jsDelivr CDN and Google Fonts. If you add other scripts or CDNs, update it. If a CDN is unreachable, the app still works, but icons and charts will be missing.

## Project Structure

```
TaskFlow/
├── index.html      # App shell, modals and layout
├── style.css       # Styles, light/dark themes, responsive rules
├── script.js       # Application logic (state, views, storage, charts)
├── theme-init.js   # Applies the saved theme before first paint
├── _headers        # Security headers (Netlify / Cloudflare Pages)
├── vercel.json     # Security headers (Vercel)
├── .nojekyll       # Lets GitHub Pages serve files as-is
└── README.md
```

## How It Works

- **State:** tasks live in an in-memory array and are saved to `localStorage` (`taskflow_tasks`) after every change. Preferences are stored under `taskflow_settings`.
- **Rendering:** each page is a function that returns an HTML string, and a single `renderPage()` swaps it into the layout. Events are re-bound after each render.
- **Safety:** all user text is escaped before rendering, imported files are validated, and invalid dates are rejected.
- **Analytics:** tasks record a `completedAt` timestamp, so the weekly chart reflects when work was actually finished.

## Requirements Summary

**Functional:** task CRUD and duplication; completion toggling; search, filter and sort; overdue highlighting; Kanban drag and drop; calendar navigation; live dashboard and analytics; CSV export and JSON import; persistent theme; demo data; deadline notifications.

**Non-functional:** runs fully client-side; responsive on desktop, tablet and mobile; accessible labels, keyboard-operable controls and reduced-motion support; readable, separated HTML/CSS/JS; graceful handling of invalid input and storage errors.

## Test Checklist

| # | Test | Expected result |
|---|------|-----------------|
| 1 | Create a task with a title only | Appears in All Tasks and Dashboard |
| 2 | Submit with an empty title | Error message; nothing saved |
| 3 | Edit title and priority, then refresh | Changes persist |
| 4 | Mark a task complete | Status and completion rate update |
| 5 | Delete a task and confirm | Removed from every view |
| 6 | Drag a card on the Kanban board | Status changes; column counts update |
| 7 | Filter by Urgent, then by a subject | Both filters apply together and stay selected |
| 8 | Switch to dark mode and reload | Theme persists |
| 9 | Export CSV | File downloads with all task rows |
| 10 | Import an invalid JSON file | Error message; existing tasks unchanged |
| 11 | Clear all tasks | Lists are empty; stats show zero |
| 12 | Navigate months on the calendar | Correct days and task dots |

## Limitations

- Data is stored per browser and device, with no cloud sync or collaboration.
- Clearing browser data removes your tasks, so export a CSV for a backup.
- Kanban drag and drop uses the HTML5 drag API, which most mobile browsers don't support. On phones, change status through Edit or the checkbox.
- Import accepts JSON arrays of task-like objects only.

## Roadmap

- JSON export for a full round-trip backup
- Touch-friendly Kanban (move menu or pointer events)
- Installable PWA with offline caching
- Browser reminders for upcoming deadlines
- Recurring tasks and subtasks
- Optional cloud sync

## What I Learned

DOM manipulation without a framework, client-side state management, responsive CSS architecture, data visualisation with Chart.js, timezone-safe date handling, and writing requirements and test cases alongside the code.

## License

Created for academic purposes. Add a licence (for example MIT) if you plan to share or reuse it.
