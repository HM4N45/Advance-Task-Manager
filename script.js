/* ============================================================
   TaskFlow — Smart Student Productivity Manager
   Vanilla JS + localStorage + Chart.js
   ============================================================ */

// -------------------- State --------------------
const STORAGE_KEY = 'taskflow_tasks';
const SETTINGS_KEY = 'taskflow_settings';
const DEMO_KEY = 'taskflow_demo_loaded';

let tasks = [];
let settings = { theme: 'light', demoCleared: false };
let currentPage = 'dashboard';
let editingId = null;
let confirmCallback = null;
let calendarDate = new Date();
let selectedCalDate = null;
let charts = {};
let filters = { status: '', priority: '', subject: '', sort: 'due' };

// -------------------- Demo Data --------------------
const DEMO_TASKS = [
  {
    id: 'demo-1',
    title: 'Complete Software Engineering Assignment',
    description: 'Finish the SRS document and UML diagrams for the course project.',
    subject: 'Software Engineering',
    dueDate: addDays(2).toISOString(),
    priority: 'High',
    status: 'In Progress',
    tags: ['assignment', 'uml'],
    createdAt: addDays(-3).toISOString()
  },
  {
    id: 'demo-2',
    title: 'Study for Database Midterm',
    description: 'Review normalization, SQL joins, and transaction isolation levels.',
    subject: 'Database Systems',
    dueDate: addDays(5).toISOString(),
    priority: 'Urgent',
    status: 'To Do',
    tags: ['exam', 'study'],
    createdAt: addDays(-1).toISOString()
  },
  {
    id: 'demo-3',
    title: 'Submit Lab Report – Networks',
    description: 'Write up the packet analysis lab results.',
    subject: 'Computer Networks',
    dueDate: addDays(-1).toISOString(),
    priority: 'High',
    status: 'To Do',
    tags: ['lab'],
    createdAt: addDays(-5).toISOString()
  },
  {
    id: 'demo-4',
    title: 'Group Project Meeting',
    description: 'Discuss sprint goals and assign tasks for the web app.',
    subject: 'Software Engineering',
    dueDate: addDays(1).toISOString(),
    priority: 'Medium',
    status: 'To Do',
    tags: ['meeting', 'project'],
    createdAt: addDays(-2).toISOString()
  },
  {
    id: 'demo-5',
    title: 'Read Chapter 7 – Algorithms',
    description: 'Dynamic programming and greedy algorithms.',
    subject: 'Algorithms',
    dueDate: addDays(4).toISOString(),
    priority: 'Low',
    status: 'Completed',
    tags: ['reading'],
    createdAt: addDays(-7).toISOString()
  },
  {
    id: 'demo-6',
    title: 'Prepare Presentation Slides',
    description: 'Create slides for the SE project demo.',
    subject: 'Software Engineering',
    dueDate: addDays(7).toISOString(),
    priority: 'Medium',
    status: 'To Do',
    tags: ['presentation'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-7',
    title: 'Math Homework – Calculus',
    description: 'Problems 1–15 from section 4.3.',
    subject: 'Mathematics',
    dueDate: addDays(0).toISOString(),
    priority: 'High',
    status: 'In Progress',
    tags: ['homework'],
    createdAt: addDays(-1).toISOString()
  },
  {
    id: 'demo-8',
    title: 'Review Peer Code',
    description: 'Code review for teammate’s pull request.',
    subject: 'Software Engineering',
    dueDate: addDays(3).toISOString(),
    priority: 'Medium',
    status: 'Completed',
    tags: ['review'],
    createdAt: addDays(-4).toISOString()
  }
];

DEMO_TASKS.forEach(t => {
  if (t.status === 'Completed') t.completedAt = addDays(t.id === 'demo-5' ? -2 : -1).toISOString();
});

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(14, 0, 0, 0);
  return d;
}

// -------------------- Init --------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadTasks();
  applyTheme();
  bindGlobalEvents();
  navigate('dashboard');
  updateNotifBadge();
  refreshIcons();
});

function loadSettings() {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) settings = { ...settings, ...JSON.parse(s) };
  } catch (e) {
    console.warn('Settings load failed', e);
  }
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  catch (e) { console.warn('Settings save failed', e); }
}

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      tasks = JSON.parse(stored);
      if (!Array.isArray(tasks)) tasks = [];
    } else if (!localStorage.getItem(DEMO_KEY)) {
      tasks = JSON.parse(JSON.stringify(DEMO_TASKS));
      localStorage.setItem(DEMO_KEY, '1');
      saveTasks();
    }
  } catch (e) {
    tasks = [];
    console.warn('Tasks load failed', e);
  }
}

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  catch (e) { toast('Could not save: browser storage is unavailable or full', 'error'); }
  updateNotifBadge();
}

// -------------------- Theme --------------------
function applyTheme() {
  document.documentElement.setAttribute('data-theme', settings.theme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.setAttribute('data-lucide', settings.theme === 'dark' ? 'sun' : 'moon');
    refreshIcons();
  }
}

function toggleTheme() {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  saveSettings();
  applyTheme();
  // Re-render charts with correct colors
  if (currentPage === 'dashboard' || currentPage === 'analytics') {
    renderPage(currentPage);
  }
}

// -------------------- Navigation --------------------
function bindGlobalEvents() {
  // Nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const page = el.dataset.page;
      navigate(page);
      closeSidebar();
    });
  });

  document.getElementById('menuToggle').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('notifBtn').addEventListener('click', toggleNotifPanel);
  document.getElementById('closeNotif').addEventListener('click', () => {
    document.getElementById('notifPanel').hidden = true;
  });

  // Search
  document.getElementById('globalSearch').addEventListener('input', e => {
    if (currentPage === 'tasks' || currentPage === 'myday') {
      renderPage(currentPage);
    } else {
      navigate('tasks');
    }
  });

  // Modal
  document.getElementById('closeModal').addEventListener('click', closeTaskModal);
  document.getElementById('cancelTask').addEventListener('click', closeTaskModal);
  document.getElementById('taskForm').addEventListener('submit', handleSaveTask);
  document.getElementById('closeDetails').addEventListener('click', () => {
    document.getElementById('detailsModal').hidden = true;
  });
  document.getElementById('detailsEdit').addEventListener('click', () => {
    const id = document.getElementById('detailsModal').dataset.taskId;
    document.getElementById('detailsModal').hidden = true;
    openTaskModal(id);
  });
  document.getElementById('detailsDelete').addEventListener('click', () => {
    const id = document.getElementById('detailsModal').dataset.taskId;
    document.getElementById('detailsModal').hidden = true;
    confirmDelete(id);
  });

  // Confirm
  document.getElementById('confirmCancel').addEventListener('click', () => {
    document.getElementById('confirmModal').hidden = true;
    confirmCallback = null;
  });
  document.getElementById('confirmOk').addEventListener('click', () => {
    document.getElementById('confirmModal').hidden = true;
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
  });

  // Close modals on overlay click
  ['taskModal', 'detailsModal', 'confirmModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) {
        document.getElementById(id).hidden = true;
      }
    });
  });

  // Click outside closes notifications
  document.addEventListener('click', e => {
    const p = document.getElementById('notifPanel');
    if (!p.hidden && !p.contains(e.target) && !e.target.closest('#notifBtn')) p.hidden = true;
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('taskModal').hidden = true;
      document.getElementById('detailsModal').hidden = true;
      document.getElementById('confirmModal').hidden = true;
      document.getElementById('notifPanel').hidden = true;
    }
  });
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  destroyCharts();
  renderPage(page);
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);
  }
  overlay.classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.classList.remove('show');
}

// -------------------- Helpers --------------------
function uid() {
  return 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function isOverdue(task) {
  if (task.status === 'Completed' || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date();
}

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function isUpcoming(task, days = 7) {
  if (task.status === 'Completed' || !task.dueDate) return false;
  const due = new Date(task.dueDate);
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return due >= now && due <= limit;
}

function priorityClass(p) {
  return (p || 'medium').toLowerCase();
}

function statusClass(s) {
  if (s === 'To Do') return 'todo';
  if (s === 'In Progress') return 'progress';
  return 'done';
}

function getStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = total - completed;
  const overdue = tasks.filter(isOverdue).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, overdue, rate };
}

function toast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: 'check-circle', error: 'alert-circle', info: 'info' };
  el.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span></span>`;
  el.querySelector('span').textContent = msg;
  container.appendChild(el);
  refreshIcons();
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function showConfirm(title, message, onOk) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').hidden = false;
  confirmCallback = onOk;
}

// -------------------- Notifications --------------------
function updateNotifBadge() {
  const overdue = tasks.filter(isOverdue);
  const upcoming = tasks.filter(t => isUpcoming(t, 2) && !isOverdue(t));
  const count = overdue.length + upcoming.length;
  const badge = document.getElementById('notifBadge');
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  panel.hidden = !panel.hidden;
  if (!panel.hidden) renderNotifs();
}

function renderNotifs() {
  const list = document.getElementById('notifList');
  const overdue = tasks.filter(isOverdue);
  const upcoming = tasks.filter(t => isUpcoming(t, 3) && !isOverdue(t));
  const items = [
    ...overdue.map(t => ({ task: t, type: 'overdue' })),
    ...upcoming.map(t => ({ task: t, type: 'upcoming' }))
  ];
  if (!items.length) {
    list.innerHTML = '<div class="empty-state" style="padding:1.5rem"><p>No notifications</p></div>';
    return;
  }
  list.innerHTML = items.map(({ task, type }) => `
    <div class="notif-item" data-id="${task.id}">
      <strong>${escapeHtml(task.title)}</strong>
      <span>${type === 'overdue' ? '⚠️ Overdue' : '📅 Due soon'} · ${formatDateTime(task.dueDate)}</span>
    </div>
  `).join('');
  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('notifPanel').hidden = true;
      openDetails(el.dataset.id);
    });
  });
}

// -------------------- Task CRUD --------------------
function openTaskModal(id = null) {
  editingId = id;
  const form = document.getElementById('taskForm');
  form.reset();
  document.getElementById('taskId').value = '';
  document.getElementById('modalTitle').textContent = id ? 'Edit Task' : 'New Task';

  // Populate subject datalist
  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];
  document.getElementById('subjectList').innerHTML = subjects.map(s =>
    `<option value="${escapeHtml(s)}">`
  ).join('');

  if (id) {
    const t = tasks.find(x => x.id === id);
    if (t) {
      document.getElementById('taskId').value = t.id;
      document.getElementById('taskTitle').value = t.title;
      document.getElementById('taskDesc').value = t.description || '';
      document.getElementById('taskSubject').value = t.subject || '';
      document.getElementById('taskPriority').value = t.priority || 'Medium';
      document.getElementById('taskStatus').value = t.status || 'To Do';
      document.getElementById('taskTags').value = (t.tags || []).join(', ');
      if (t.dueDate) {
        // datetime-local needs local format
        const d = new Date(t.dueDate);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16);
        document.getElementById('taskDue').value = local;
      }
    }
  }
  document.getElementById('taskModal').hidden = false;
  document.getElementById('taskTitle').focus();
}

function closeTaskModal() {
  document.getElementById('taskModal').hidden = true;
  editingId = null;
}

function handleSaveTask(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) {
    toast('Task title is required', 'error');
    return;
  }
  const dueRaw = document.getElementById('taskDue').value;
  const tagsRaw = document.getElementById('taskTags').value;
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const data = {
    title,
    description: document.getElementById('taskDesc').value.trim(),
    subject: document.getElementById('taskSubject').value.trim(),
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    dueDate: dueRaw ? new Date(dueRaw).toISOString() : null,
    tags
  };

  if (editingId) {
    const idx = tasks.findIndex(t => t.id === editingId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...data };
      applyStatus(tasks[idx], data.status);
      toast('Task updated', 'success');
    }
  } else {
    tasks.unshift({
      id: uid(),
      ...data,
      createdAt: new Date().toISOString()
    });
    applyStatus(tasks[0], tasks[0].status);
    toast('Task created', 'success');
  }
  saveTasks();
  closeTaskModal();
  renderPage(currentPage);
}

function confirmDelete(id) {
  showConfirm('Delete Task', 'Are you sure you want to delete this task? This cannot be undone.', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    toast('Task deleted', 'success');
    renderPage(currentPage);
  });
}

function duplicateTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const copy = {
    ...JSON.parse(JSON.stringify(t)),
    id: uid(),
    title: t.title + ' (Copy)',
    status: 'To Do',
    createdAt: new Date().toISOString()
  };
  delete copy.completedAt;
  tasks.unshift(copy);
  saveTasks();
  toast('Task duplicated', 'success');
  renderPage(currentPage);
}

function toggleComplete(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  applyStatus(t, t.status === 'Completed' ? 'To Do' : 'Completed');
  saveTasks();
  renderPage(currentPage);
}

function openDetails(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const modal = document.getElementById('detailsModal');
  modal.dataset.taskId = id;
  document.getElementById('detailsTitle').textContent = t.title;
  const body = document.getElementById('detailsBody');
  body.innerHTML = `
    <div class="details-row"><span class="details-label">Status</span>
      <span class="badge-status ${statusClass(t.status)}">${t.status}</span></div>
    <div class="details-row"><span class="details-label">Priority</span>
      <span class="badge-priority ${priorityClass(t.priority)}">${t.priority}</span></div>
    <div class="details-row"><span class="details-label">Subject</span>
      <span>${escapeHtml(t.subject || '—')}</span></div>
    <div class="details-row"><span class="details-label">Due</span>
      <span class="${isOverdue(t) ? 'badge-priority urgent' : ''}">${formatDateTime(t.dueDate)}</span></div>
    <div class="details-row"><span class="details-label">Created</span>
      <span>${formatDateTime(t.createdAt)}</span></div>
    <div class="details-row"><span class="details-label">Tags</span>
      <span>${(t.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ') || '—'}</span></div>
    <div class="mt-2">
      <div class="details-label mb-1">Description</div>
      <p style="font-size:0.9rem;color:var(--text-muted)">${escapeHtml(t.description || 'No description.')}</p>
    </div>
  `;
  modal.hidden = false;
  refreshIcons();
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// -------------------- Filtering / Sorting --------------------
function getFilteredTasks(opts = {}) {
  let list = [...tasks];
  const search = (document.getElementById('globalSearch')?.value || opts.search || '').toLowerCase().trim();
  const { status = '', priority = '', subject = '', sort = 'due' } = opts;

  if (opts.todayOnly) {
    // My Day: due today, or overdue (incomplete), or completed today
    list = tasks.filter(t => {
      if (t.status === 'Completed') return isToday(t.dueDate);
      return isToday(t.dueDate) || isOverdue(t);
    });
  }

  if (search) {
    list = list.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.description || '').toLowerCase().includes(search) ||
      (t.subject || '').toLowerCase().includes(search) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(search))
    );
  }
  if (status) list = list.filter(t => t.status === status);
  if (priority) list = list.filter(t => t.priority === priority);
  if (subject) list = list.filter(t => t.subject === subject);

  const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
  list.sort((a, b) => {
    if (sort === 'priority') {
      return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    }
    if (sort === 'created') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    // due (default)
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  return list;
}

// -------------------- Render Pages --------------------
function renderPage(page) {
  destroyCharts();
  const content = document.getElementById('content');
  switch (page) {
    case 'dashboard': content.innerHTML = renderDashboard(); break;
    case 'tasks': content.innerHTML = renderTasksPage(); break;
    case 'myday': content.innerHTML = renderMyDay(); break;
    case 'kanban': content.innerHTML = renderKanban(); break;
    case 'calendar': content.innerHTML = renderCalendar(); break;
    case 'analytics': content.innerHTML = renderAnalytics(); break;
    case 'settings': content.innerHTML = renderSettings(); break;
    default: content.innerHTML = renderDashboard();
  }
  refreshIcons();
  bindPageEvents(page);
  if (page === 'dashboard') initDashboardCharts();
  if (page === 'analytics') initAnalyticsCharts();
  if (page === 'kanban') initKanbanDrag();
  if (page === 'calendar') bindCalendarEvents();
}

// ---- Dashboard ----
function renderDashboard() {
  const stats = getStats();
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const upcoming = tasks
    .filter(t => t.status !== 'Completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Welcome back, Student 👋</h1>
        <p class="page-subtitle">${dateStr}</p>
      </div>
      <button class="btn btn-primary" data-action="new-task">
        <i data-lucide="plus"></i> New Task
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon"><i data-lucide="list-todo"></i></div>
        <span class="stat-label">Total Tasks</span>
        <span class="stat-value">${stats.total}</span>
      </div>
      <div class="stat-card completed">
        <div class="stat-icon"><i data-lucide="check-circle"></i></div>
        <span class="stat-label">Completed</span>
        <span class="stat-value">${stats.completed}</span>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon"><i data-lucide="clock"></i></div>
        <span class="stat-label">Pending</span>
        <span class="stat-value">${stats.pending}</span>
      </div>
      <div class="stat-card overdue">
        <div class="stat-icon"><i data-lucide="alert-triangle"></i></div>
        <span class="stat-label">Overdue</span>
        <span class="stat-value">${stats.overdue}</span>
      </div>
      <div class="stat-card rate">
        <div class="stat-icon"><i data-lucide="trending-up"></i></div>
        <span class="stat-label">Completion Rate</span>
        <span class="stat-value">${stats.rate}%</span>
      </div>
    </div>

    <div class="grid-3">
      <div class="card">
        <div class="card-title"><i data-lucide="bar-chart-2"></i> Weekly Productivity</div>
        <div class="chart-wrap"><canvas id="chartWeekly"></canvas></div>
      </div>
      <div class="card">
        <div class="card-title"><i data-lucide="pie-chart"></i> Priority Distribution</div>
        <div class="chart-wrap chart-wrap-sm"><canvas id="chartPriority"></canvas></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title"><i data-lucide="history"></i> Recent Tasks</div>
        ${recent.length ? `<div class="task-list">${recent.map(taskItemHtml).join('')}</div>` :
          emptyHtml('No tasks yet', 'Create your first task to get started.')}
      </div>
      <div class="card">
        <div class="card-title"><i data-lucide="calendar-clock"></i> Upcoming Deadlines</div>
        ${upcoming.length ? `<div class="task-list">${upcoming.map(taskItemHtml).join('')}</div>` :
          emptyHtml('No upcoming deadlines', 'You are all caught up!')}
      </div>
    </div>
  `;
}

function taskItemHtml(t) {
  const overdue = isOverdue(t);
  return `
    <div class="task-item ${overdue ? 'overdue' : ''} ${t.status === 'Completed' ? 'completed' : ''}" data-id="${t.id}">
      <div class="task-check ${t.status === 'Completed' ? 'done' : ''}" data-id="${t.id}" role="checkbox" tabindex="0" aria-checked="${t.status === 'Completed'}" aria-label="Toggle complete">
        ${t.status === 'Completed' ? '<i data-lucide="check"></i>' : ''}
      </div>
      <div class="task-body">
        <div class="task-title-row">
          <span class="task-title">${escapeHtml(t.title)}</span>
          <span class="badge-priority ${priorityClass(t.priority)}">${t.priority}</span>
          <span class="badge-status ${statusClass(t.status)}">${t.status}</span>
        </div>
        <div class="task-meta">
          ${t.subject ? `<span><i data-lucide="book-open"></i> ${escapeHtml(t.subject)}</span>` : ''}
          ${t.dueDate ? `<span><i data-lucide="calendar"></i> ${formatDateTime(t.dueDate)}${overdue ? ' · Overdue' : ''}</span>` : ''}
          ${(t.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-icon" data-action="edit" data-id="${t.id}" title="Edit"><i data-lucide="pencil"></i></button>
        <button class="btn btn-icon" data-action="duplicate" data-id="${t.id}" title="Duplicate"><i data-lucide="copy"></i></button>
        <button class="btn btn-icon" data-action="delete" data-id="${t.id}" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `;
}

function emptyHtml(title, desc) {
  return `
    <div class="empty-state">
      <i data-lucide="inbox"></i>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>
  `;
}

// ---- All Tasks ----
function renderTasksPage() {
  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];
  if (!subjects.includes(filters.subject)) filters.subject = '';
  const list = getFilteredTasks(filters);
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">All Tasks</h1>
        <p class="page-subtitle">${list.length} task${list.length !== 1 ? 's' : ''} shown</p>
      </div>
      <button class="btn btn-primary" data-action="new-task"><i data-lucide="plus"></i> New Task</button>
    </div>
    <div class="filters-bar">
      <select id="filterStatus" aria-label="Filter by status">
        <option value="">All Statuses</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      <select id="filterPriority" aria-label="Filter by priority">
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Urgent">Urgent</option>
      </select>
      <select id="filterSubject" aria-label="Filter by subject">
        <option value="">All Subjects</option>
        ${subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
      </select>
      <select id="filterSort" aria-label="Sort by">
        <option value="due">Sort: Deadline</option>
        <option value="priority">Sort: Priority</option>
        <option value="created">Sort: Created</option>
      </select>
    </div>
    ${list.length
      ? `<div class="task-list">${list.map(taskItemHtml).join('')}</div>`
      : emptyHtml('No tasks found', 'Try adjusting filters or create a new task.')}
  `;
}

// ---- My Day ----
function renderMyDay() {
  const list = getFilteredTasks({ todayOnly: true });
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  });
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">My Day</h1>
        <p class="page-subtitle">${dateStr} · Focus on today’s work & overdue items</p>
      </div>
      <button class="btn btn-primary" data-action="new-task"><i data-lucide="plus"></i> New Task</button>
    </div>
    ${list.length
      ? `<div class="task-list">${list.map(taskItemHtml).join('')}</div>`
      : emptyHtml('Nothing for today', 'Enjoy a clear day or add a task due today.')}
  `;
}

// ---- Kanban ----
function renderKanban() {
  const cols = ['To Do', 'In Progress', 'Completed'];
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Kanban Board</h1>
        <p class="page-subtitle">Drag tasks between columns to update status</p>
      </div>
      <button class="btn btn-primary" data-action="new-task"><i data-lucide="plus"></i> New Task</button>
    </div>
    <div class="kanban-board">
      ${cols.map(col => {
        const colTasks = tasks.filter(t => t.status === col);
        return `
          <div class="kanban-col" data-status="${col}">
            <div class="kanban-col-header">
              <span>${col}</span>
              <span class="kanban-count">${colTasks.length}</span>
            </div>
            <div class="kanban-cards" data-status="${col}">
              ${colTasks.map(t => `
                <div class="kanban-card" draggable="true" data-id="${t.id}">
                  <div class="kanban-card-title">${escapeHtml(t.title)}</div>
                  <div class="kanban-card-meta">
                    <span class="badge-priority ${priorityClass(t.priority)}">${t.priority}</span>
                    ${t.subject ? `<span>${escapeHtml(t.subject)}</span>` : ''}
                    ${t.dueDate ? `<span>${formatDate(t.dueDate)}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function initKanbanDrag() {
  let draggedId = null;

  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedId = card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedId = null;
      document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
    });
    card.addEventListener('click', () => openDetails(card.dataset.id));
  });

  document.querySelectorAll('.kanban-col').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.closest('.kanban-col').classList.add('drag-over');
    });
    zone.addEventListener('dragleave', e => {
      if (!zone.contains(e.relatedTarget)) {
        zone.closest('.kanban-col').classList.remove('drag-over');
      }
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.closest('.kanban-col').classList.remove('drag-over');
      if (!draggedId) return;
      const newStatus = zone.dataset.status;
      const t = tasks.find(x => x.id === draggedId);
      if (t && t.status !== newStatus) {
        applyStatus(t, newStatus);
        saveTasks();
        toast(`Moved to ${newStatus}`, 'success');
        renderPage('kanban');
      }
    });
  });
}

// ---- Calendar ----
function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const monthName = calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let cells = dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startPad - 1; i >= 0; i--) {
    cells += `<div class="cal-day other-month"><div class="cal-day-num">${prevMonthDays - i}</div></div>`;
  }

  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isTod = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isSel = selectedCalDate === dateStr;
    const dayTasks = tasks.filter(t => t.dueDate && localDateKey(t.dueDate) === dateStr);
    const dots = dayTasks.slice(0, 4).map(t => {
      const cls = t.priority === 'Urgent' ? 'urgent' : t.priority === 'High' ? 'high' : '';
      return `<span class="cal-dot ${cls}"></span>`;
    }).join('');
    cells += `
      <div class="cal-day ${isTod ? 'today' : ''} ${isSel ? 'selected' : ''}" data-date="${dateStr}">
        <div class="cal-day-num">${d}</div>
        <div class="cal-dots">${dots}</div>
      </div>`;
  }

  const totalCells = startPad + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
  }

  let dayPanel = '';
  if (selectedCalDate) {
    const dayTasks = tasks.filter(t => t.dueDate && localDateKey(t.dueDate) === selectedCalDate);
    dayPanel = `
      <div class="card cal-day-tasks">
        <div class="card-title"><i data-lucide="calendar"></i> Tasks on ${formatDate(selectedCalDate + 'T12:00')}</div>
        ${dayTasks.length
          ? `<div class="task-list">${dayTasks.map(taskItemHtml).join('')}</div>`
          : emptyHtml('No tasks', 'Nothing scheduled for this day.')}
      </div>`;
  }

  const upcoming = tasks
    .filter(t => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Calendar</h1>
        <p class="page-subtitle">View tasks by due date</p>
      </div>
      <button class="btn btn-primary" data-action="new-task"><i data-lucide="plus"></i> New Task</button>
    </div>
    <div class="card">
      <div class="calendar-nav">
        <button class="btn btn-ghost btn-sm" id="calPrev"><i data-lucide="chevron-left"></i></button>
        <h2>${monthName}</h2>
        <button class="btn btn-ghost btn-sm" id="calNext"><i data-lucide="chevron-right"></i></button>
        <button class="btn btn-ghost btn-sm" id="calToday">Today</button>
      </div>
      <div class="calendar-grid">${cells}</div>
    </div>
    ${dayPanel}
    <div class="card mt-2">
      <div class="card-title"><i data-lucide="calendar-clock"></i> Upcoming Deadlines</div>
      ${upcoming.length
        ? `<div class="task-list">${upcoming.map(taskItemHtml).join('')}</div>`
        : emptyHtml('No upcoming deadlines', '')}
    </div>
  `;
}

function bindCalendarEvents() {
  document.getElementById('calPrev')?.addEventListener('click', () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
    renderPage('calendar');
  });
  document.getElementById('calNext')?.addEventListener('click', () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
    renderPage('calendar');
  });
  document.getElementById('calToday')?.addEventListener('click', () => {
    calendarDate = new Date();
    selectedCalDate = null;
    renderPage('calendar');
  });
  document.querySelectorAll('.cal-day[data-date]').forEach(el => {
    el.addEventListener('click', () => {
      selectedCalDate = el.dataset.date;
      renderPage('calendar');
    });
  });
}

// ---- Analytics ----
function renderAnalytics() {
  const stats = getStats();
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Insights from your real task data</p>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card completed">
        <div class="stat-icon"><i data-lucide="check-circle"></i></div>
        <span class="stat-label">Completed</span>
        <span class="stat-value">${stats.completed}</span>
      </div>
      <div class="stat-card rate">
        <div class="stat-icon"><i data-lucide="percent"></i></div>
        <span class="stat-label">Completion %</span>
        <span class="stat-value">${stats.rate}%</span>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon"><i data-lucide="clock"></i></div>
        <span class="stat-label">Pending</span>
        <span class="stat-value">${stats.pending}</span>
      </div>
      <div class="stat-card total">
        <div class="stat-icon"><i data-lucide="list"></i></div>
        <span class="stat-label">Total</span>
        <span class="stat-value">${stats.total}</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title"><i data-lucide="pie-chart"></i> Pending vs Completed</div>
        <div class="chart-wrap"><canvas id="chartPendingCompleted"></canvas></div>
      </div>
      <div class="card">
        <div class="card-title"><i data-lucide="pie-chart"></i> Priority Distribution</div>
        <div class="chart-wrap"><canvas id="chartPriorityA"></canvas></div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title"><i data-lucide="bar-chart-2"></i> Weekly Productivity</div>
        <div class="chart-wrap"><canvas id="chartWeeklyA"></canvas></div>
      </div>
      <div class="card">
        <div class="card-title"><i data-lucide="layers"></i> Category Distribution</div>
        <div class="chart-wrap"><canvas id="chartCategory"></canvas></div>
      </div>
    </div>
    <div class="card mt-2">
      <div class="card-title"><i data-lucide="sparkles"></i> Productivity Summary</div>
      <p id="productivitySummary" style="font-size:0.95rem;color:var(--text-muted);line-height:1.6"></p>
    </div>
  `;
}

function getChartColors() {
  const dark = settings.theme === 'dark';
  return {
    text: dark ? '#94a3b8' : '#64748b',
    grid: dark ? '#334155' : '#e2e8f0',
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#a855f7'
  };
}

function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch (_) {} });
  charts = {};
}

function getWeeklyData() {
  const labels = [];
  const completed = [];
  const created = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    created.push(tasks.filter(t => t.createdAt && localDateKey(t.createdAt) === key).length);
    completed.push(tasks.filter(t =>
      t.status === 'Completed' && t.completedAt && localDateKey(t.completedAt) === key
    ).length);
  }
  return { labels, completed, created };
}

function initDashboardCharts() {
  const colors = getChartColors();
  const weekly = getWeeklyData();

  const ctxW = document.getElementById('chartWeekly');
  if (ctxW) {
    makeChart('weekly', ctxW, {
      type: 'bar',
      data: {
        labels: weekly.labels,
        datasets: [
          { label: 'Created', data: weekly.created, backgroundColor: colors.primary, borderRadius: 6 },
          { label: 'Completed', data: weekly.completed, backgroundColor: colors.success, borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: colors.text } } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          y: { beginAtZero: true, ticks: { stepSize: 1, color: colors.text }, grid: { color: colors.grid } }
        }
      }
    });
  }

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const pCounts = priorities.map(p => tasks.filter(t => t.priority === p).length);
  const ctxP = document.getElementById('chartPriority');
  if (ctxP) {
    makeChart('priority', ctxP, {
      type: 'doughnut',
      data: {
        labels: priorities,
        datasets: [{
          data: pCounts,
          backgroundColor: [colors.info, colors.warning, '#ea580c', colors.danger],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: colors.text, boxWidth: 12 } } }
      }
    });
  }
}

function initAnalyticsCharts() {
  const colors = getChartColors();
  const stats = getStats();

  const ctxPC = document.getElementById('chartPendingCompleted');
  if (ctxPC) {
    makeChart('pc', ctxPC, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [stats.completed, stats.pending],
          backgroundColor: [colors.success, colors.warning],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: colors.text } } }
      }
    });
  }

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const pCounts = priorities.map(p => tasks.filter(t => t.priority === p).length);
  const ctxPA = document.getElementById('chartPriorityA');
  if (ctxPA) {
    makeChart('priorityA', ctxPA, {
      type: 'doughnut',
      data: {
        labels: priorities,
        datasets: [{
          data: pCounts,
          backgroundColor: [colors.info, colors.warning, '#ea580c', colors.danger],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: colors.text } } }
      }
    });
  }

  const weekly = getWeeklyData();
  const ctxWA = document.getElementById('chartWeeklyA');
  if (ctxWA) {
    makeChart('weeklyA', ctxWA, {
      type: 'line',
      data: {
        labels: weekly.labels,
        datasets: [
          {
            label: 'Created',
            data: weekly.created,
            borderColor: colors.primary,
            backgroundColor: colors.primary + '33',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Completed',
            data: weekly.completed,
            borderColor: colors.success,
            backgroundColor: colors.success + '33',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: colors.text } } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          y: { beginAtZero: true, ticks: { stepSize: 1, color: colors.text }, grid: { color: colors.grid } }
        }
      }
    });
  }

  // Category
  const catMap = {};
  tasks.forEach(t => {
    const c = t.subject || 'Uncategorized';
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const catLabels = Object.keys(catMap);
  const catData = Object.values(catMap);
  const catColors = [colors.primary, colors.success, colors.warning, colors.info, colors.purple, colors.danger, '#14b8a6', '#f43f5e'];
  const ctxCat = document.getElementById('chartCategory');
  if (ctxCat) {
    makeChart('category', ctxCat, {
      type: 'bar',
      data: {
        labels: catLabels,
        datasets: [{
          label: 'Tasks',
          data: catData,
          backgroundColor: catLabels.map((_, i) => catColors[i % catColors.length]),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1, color: colors.text }, grid: { color: colors.grid } }
        }
      }
    });
  }

  // Summary text
  const summary = document.getElementById('productivitySummary');
  if (summary) {
    const overdue = stats.overdue;
    let text = `You have <strong>${stats.total}</strong> total tasks with a completion rate of <strong>${stats.rate}%</strong>. `;
    if (stats.completed > 0) {
      text += `Great job completing ${stats.completed} task${stats.completed !== 1 ? 's' : ''}! `;
    }
    if (overdue > 0) {
      text += `There ${overdue === 1 ? 'is' : 'are'} <strong>${overdue}</strong> overdue task${overdue !== 1 ? 's' : ''} that need attention. `;
    } else if (stats.pending > 0) {
      text += `No overdue tasks — keep up the momentum on your ${stats.pending} pending item${stats.pending !== 1 ? 's' : ''}. `;
    } else {
      text += `All clear — no pending work right now. `;
    }
    const topCat = catLabels.length
      ? catLabels.reduce((a, b) => catMap[a] >= catMap[b] ? a : b)
      : null;
    if (topCat) {
      text += `Most of your tasks are in <strong>${escapeHtml(topCat)}</strong>.`;
    }
    summary.innerHTML = text;
  }
}

// ---- Settings ----
function renderSettings() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Appearance and data management</p>
      </div>
    </div>
    <div class="card settings-section">
      <h3>Appearance</h3>
      <div class="settings-row">
        <div>
          <div class="settings-label">Dark Mode</div>
          <div class="settings-desc">Switch between light and dark themes</div>
        </div>
        <div class="toggle ${settings.theme === 'dark' ? 'on' : ''}" id="settingTheme" role="switch" aria-checked="${settings.theme === 'dark'}"></div>
      </div>
    </div>
    <div class="card settings-section">
      <h3>Data</h3>
      <div class="settings-row">
        <div>
          <div class="settings-label">Export Tasks (CSV)</div>
          <div class="settings-desc">Download all tasks as a CSV file</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="exportCsv"><i data-lucide="download"></i> Export</button>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Import Tasks (JSON)</div>
          <div class="settings-desc">Import tasks from a valid JSON file</div>
        </div>
        <label class="btn btn-ghost btn-sm" style="cursor:pointer">
          <i data-lucide="upload"></i> Import
          <input type="file" id="importJson" accept=".json,application/json" hidden />
        </label>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Load Demo Data</div>
          <div class="settings-desc">Add sample student tasks (keeps existing)</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="loadDemo"><i data-lucide="database"></i> Load Demo</button>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Clear All Tasks</div>
          <div class="settings-desc">Permanently delete every task</div>
        </div>
        <button class="btn btn-danger btn-sm" id="clearAll"><i data-lucide="trash-2"></i> Clear All</button>
      </div>
    </div>
    <div class="card settings-section">
      <h3>About</h3>
      <p style="font-size:0.9rem;color:var(--text-muted);line-height:1.6">
        <strong>TaskFlow</strong> — Smart Student Productivity Manager<br>
        Frontend-only app using HTML, CSS, Vanilla JavaScript &amp; localStorage.<br>
        Built for university Software Engineering project demonstration.
      </p>
    </div>
  `;
}

function bindPageEvents(page) {
  // Re-bind common actions (called from renderPage)
  document.querySelectorAll('[data-action="new-task"]').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal());
  });
  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      toggleComplete(el.dataset.id);
    });
    el.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); toggleComplete(el.dataset.id); }
    });
  });
  document.querySelectorAll('.task-item').forEach(el => {
    el.addEventListener('click', () => openDetails(el.dataset.id));
  });
  document.querySelectorAll('[data-action="edit"]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      openTaskModal(el.dataset.id);
    });
  });
  document.querySelectorAll('[data-action="delete"]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      confirmDelete(el.dataset.id);
    });
  });
  document.querySelectorAll('[data-action="duplicate"]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      duplicateTask(el.dataset.id);
    });
  });
  [['filterStatus', 'status'], ['filterPriority', 'priority'], ['filterSubject', 'subject'], ['filterSort', 'sort']].forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = filters[key];
    el.addEventListener('change', () => { filters[key] = el.value; renderPage(currentPage); });
  });

  if (page === 'settings') {
    document.getElementById('settingTheme')?.addEventListener('click', () => {
      toggleTheme();
      renderPage('settings');
    });
    document.getElementById('exportCsv')?.addEventListener('click', exportCSV);
    document.getElementById('importJson')?.addEventListener('change', importJSON);
    document.getElementById('loadDemo')?.addEventListener('click', () => {
      const demos = JSON.parse(JSON.stringify(DEMO_TASKS)).map(t => ({
        ...t,
        id: uid()
      }));
      tasks = [...demos, ...tasks];
      saveTasks();
      toast('Demo tasks loaded', 'success');
    });
    document.getElementById('clearAll')?.addEventListener('click', () => {
      showConfirm('Clear All Tasks', 'This will permanently delete all tasks. Continue?', () => {
        tasks = [];
        saveTasks();
        toast('All tasks cleared', 'success');
        renderPage('settings');
      });
    });
  }
}

// -------------------- Import / Export --------------------
function exportCSV() {
  if (!tasks.length) {
    toast('No tasks to export', 'info');
    return;
  }
  const headers = ['id', 'title', 'description', 'subject', 'dueDate', 'priority', 'status', 'tags', 'createdAt'];
  const rows = tasks.map(t =>
    headers.map(h => {
      let val = t[h];
      if (h === 'tags') val = (val || []).join(';');
      if (val == null) val = '';
      val = String(val);
      if (/^[=+\-@\t\r]/.test(val)) val = "'" + val;
      val = val.replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('CSV exported', 'success');
}

function importJSON(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error('JSON must be an array of tasks');
      let added = 0;
      data.forEach(item => {
        if (!item || typeof item !== 'object' || !item.title) return;
        tasks.unshift({
          id: uid(),
          title: String(item.title).slice(0, 120),
          description: item.description ? String(item.description) : '',
          subject: item.subject ? String(item.subject) : '',
          dueDate: cleanDate(item.dueDate),
          priority: ['Low', 'Medium', 'High', 'Urgent'].includes(item.priority) ? item.priority : 'Medium',
          status: ['To Do', 'In Progress', 'Completed'].includes(item.status) ? item.status : 'To Do',
          tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
          createdAt: cleanDate(item.createdAt) || new Date().toISOString()
        });
        applyStatus(tasks[0], tasks[0].status);
        added++;
      });
      saveTasks();
      toast(`Imported ${added} task${added !== 1 ? 's' : ''}`, 'success');
      renderPage(currentPage);
    } catch (err) {
      toast('Invalid JSON file: ' + err.message, 'error');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

// -------------------- Helpers added in fix pass --------------------
function refreshIcons() {
  try { if (window.lucide) window.lucide.createIcons(); } catch (e) { console.warn('Icons failed', e); }
}

function makeChart(key, canvas, config) {
  if (typeof Chart === 'undefined') {
    if (canvas && canvas.parentElement && !canvas.parentElement.querySelector('.chart-fallback')) {
      canvas.parentElement.insertAdjacentHTML('beforeend',
        '<p class="chart-fallback text-muted">Chart unavailable (could not load Chart.js).</p>');
    }
    return;
  }
  charts[key] = new Chart(canvas, config);
}

function localDateKey(v) {
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cleanDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d.toISOString();
}

function applyStatus(task, status) {
  task.status = status;
  if (status === 'Completed') {
    if (!task.completedAt) task.completedAt = new Date().toISOString();
  } else {
    delete task.completedAt;
  }
}
