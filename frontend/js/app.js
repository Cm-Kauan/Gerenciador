let allTasks = [];
let currentView = 'tarefas';
let searchQuery = '';
let priorityFilter = null;
let tagFilter = null;
let deleteTarget = null;
let deleteTargetType = 'task';
let calDate = new Date();
let calSelected = new Date().toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

(async () => {
  await loadTasks();
  lucide.createIcons();
  renderCalHeader();
  await loadFinanceData();
  renderFinCharts();
  renderTransactions();
  await loadProfissionalData();
})();

async function loadTasks() {
  allTasks = await api.fetchTasks();
  render();
}

function setView(v) {
  currentView = v;
  ['tarefas','agenda','profissional','metas','dashboard','financas'].forEach(id => {
    const el = document.getElementById('view-' + id);
    if (el) el.classList.toggle('hidden', id !== v);
    const nav = document.getElementById('nav-' + id);
    if (nav) { nav.classList.toggle('active', id === v); nav.classList.toggle('text-slate-600', id !== v); }
  });
  render();
  if (v === 'financas') { renderFinCharts(); renderTransactions(); }
}

function handleSearch() { searchQuery = document.getElementById('search-input').value.toLowerCase(); render(); }
function togglePriorityFilter(p) { priorityFilter = priorityFilter === p ? null : p; render(); }
function toggleTagFilter(t) { tagFilter = tagFilter === t ? null : t; render(); }
function getTasks() { return allTasks.filter(t => (!t.type || t.type === 'task')); }
function getGoals() { return allTasks.filter(t => t.type === 'goal'); }
function getFiltered() {
  return getTasks().filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery)) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (tagFilter && !(t.tags || '').includes(tagFilter)) return false;
    return true;
  });
}

function render() {
  if (currentView === 'tarefas') renderTasks();
  else if (currentView === 'agenda') renderCalendar();
  else if (currentView === 'profissional') renderProfissional();
  else if (currentView === 'metas') renderGoals();
  else if (currentView === 'dashboard') renderDashboard();
  renderTagFilters();
}

function renderTasks() {
  const tasks = getFiltered();
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');
  document.getElementById('task-count').textContent = tasks.length + ' tarefa' + (tasks.length !== 1 ? 's' : '');
  if (!tasks.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = tasks.map(t => taskCard(t)).join('');
  lucide.createIcons();
}

function taskCard(t) {
  const subtasks = parseSubtasks(t.subtasks);
  const doneSub = subtasks.filter(s => s.done).length;
  const tags = (t.tags || '').split(',').filter(Boolean).map(tg => `<span class="tag-pill bg-indigo-50 text-indigo-600">${tg.trim()}</span>`).join('');
  const overdue = t.due_date && t.due_date < today && !t.completed;
  return `<div class="task-card glass rounded-xl p-4 priority-${t.priority} slide-in cursor-pointer" onclick="editTask(${t.id})">
    <div class="flex items-start gap-3">
      <button onclick="event.stopPropagation();toggleComplete(${t.id})" class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 ${t.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-indigo-400'} flex items-center justify-center transition-all">${t.completed ? '<i data-lucide="check" class="w-3 h-3 text-white"></i>' : ''}</button>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}">${t.title}</p>
        ${t.description ? `<p class="text-xs text-slate-500 mt-0.5 truncate">${t.description}</p>` : ''}
        <div class="flex items-center gap-2 mt-2 flex-wrap">${tags}${t.due_date ? `<span class="text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}"><i data-lucide="calendar" class="w-3 h-3 inline"></i> ${formatDate(t.due_date)}</span>` : ''}${subtasks.length ? `<span class="text-xs text-slate-400">${doneSub}/${subtasks.length} subtarefas</span>` : ''}</div>
      </div>
      <button onclick="event.stopPropagation();promptDelete(${t.id})" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>
  </div>`;
}

const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderCalHeader() { document.getElementById('cal-header').innerHTML = weekDays.map(d => `<div class="text-xs font-semibold text-slate-400 text-center py-1">${d}</div>`).join(''); }
function calPrev() { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); }
function calNext() { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); }

function renderCalendar() {
  const year = calDate.getFullYear(), month = calDate.getMonth();
  document.getElementById('cal-month-label').textContent = monthNames[month] + ' ' + year;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const wsTasks = getTasks().filter(t => t.due_date);
  const tasksByDate = {};
  wsTasks.forEach(t => { if (!tasksByDate[t.due_date]) tasksByDate[t.due_date] = []; tasksByDate[t.due_date].push(t); });
  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === today, isSelected = dateStr === calSelected;
    const dayTasks = tasksByDate[dateStr] || [];
    const dots = dayTasks.slice(0, 3).map(t => { const c = t.priority === 'alta' ? '#ef4444' : t.priority === 'media' ? '#f59e0b' : '#22c55e'; return `<span class="cal-dot" style="background:${c}"></span>`; }).join('');
    html += `<button onclick="selectCalDay('${dateStr}')" class="cal-day rounded-lg p-1 flex flex-col items-center gap-0.5 min-h-[48px] ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"><span class="text-xs ${isSelected ? 'text-indigo-700' : 'text-slate-700'}">${d}</span><div class="flex gap-0.5">${dots}</div></button>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
  renderCalDayTasks(); renderCalHeader(); lucide.createIcons();
}

function selectCalDay(d) { calSelected = d; renderCalendar(); }
function renderCalDayTasks() {
  const wsTasks = getTasks().filter(t => t.due_date === calSelected);
  const container = document.getElementById('cal-day-tasks');
  if (!wsTasks.length) { container.innerHTML = `<p class="text-sm text-slate-400 text-center py-4">Nenhuma tarefa para ${formatDate(calSelected)}.</p>`; return; }
  container.innerHTML = `<p class="text-xs font-semibold text-slate-500 mb-2">${formatDate(calSelected)}</p>` + wsTasks.map(t => taskCard(t)).join('');
  lucide.createIcons();
}

// ===== PROFISSIONAL: EQUIPE E PROJETOS =====
let team = [];
let projects = [];

async function loadProfissionalData() {
  team = await api.fetchTeam();
  projects = await api.fetchProjects();
}

const projectStatusColors = { 'Planejamento': '#3b82f6', 'Em Andamento': '#6366f1', 'Concluído': '#22c55e' };
const teamColors = ['#ec4899', '#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4'];

function renderProfissional() {
  document.getElementById('pro-projects').textContent = projects.length;
  document.getElementById('pro-active').textContent = projects.filter(p => p.status === 'Em Andamento').length;
  document.getElementById('pro-completed').textContent = projects.filter(p => p.status === 'Concluído').length;
  document.getElementById('pro-team').textContent = team.length;

  const projectList = document.getElementById('pro-project-list');
  const projectEmpty = document.getElementById('pro-project-empty');
  if (!projects.length) {
    projectList.innerHTML = '';
    projectEmpty.classList.remove('hidden');
  } else {
    projectEmpty.classList.add('hidden');
    const color = (status) => projectStatusColors[status] || '#64748b';
    projectList.innerHTML = projects.map(p => `<div class="pro-card rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-semibold text-slate-800">${p.name}</p>
        <button onclick="promptDelete(${p.id}, 'project')" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
      <select onchange="updateProjectStatus(${p.id}, this.value)" class="text-xs px-2 py-1 rounded-full border-0 mb-2" style="background:${color(p.status)}20;color:${color(p.status)}">
        <option value="Planejamento" ${p.status === 'Planejamento' ? 'selected' : ''}>Planejamento</option>
        <option value="Em Andamento" ${p.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
        <option value="Concluído" ${p.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
      </select>
      <div class="w-full bg-slate-200 rounded-full h-2 mt-1"><div class="h-2 rounded-full goal-progress" style="width:${p.progress}%;background:${color(p.status)}"></div></div>
      <div class="flex items-center justify-between mt-2">
        <p class="text-xs text-slate-400">${p.progress}% concluído</p>
        <div class="flex gap-1">
          <button onclick="updateProjectProgress(${p.id}, -10)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold">−</button>
          <button onclick="updateProjectProgress(${p.id}, 10)" class="w-6 h-6 rounded bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-700 text-sm font-bold">+</button>
        </div>
      </div>
    </div>`).join('');
  }

  const teamList = document.getElementById('pro-team-list');
  const teamEmpty = document.getElementById('pro-team-empty');
  if (!team.length) {
    teamList.innerHTML = '';
    teamEmpty.classList.remove('hidden');
  } else {
    teamEmpty.classList.add('hidden');
    teamList.innerHTML = team.map((m, i) => `<div class="flex items-center gap-2 pro-card rounded-lg px-3 py-2">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background:${teamColors[i % teamColors.length]}">${m.name.charAt(0).toUpperCase()}</div>
      <div><p class="text-sm font-medium text-slate-800">${m.name}</p><p class="text-xs text-slate-400">${m.role || ''}</p></div>
      <button onclick="promptDelete(${m.id}, 'team')" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 ml-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
    </div>`).join('');
  }
  lucide.createIcons();
}

function openProjectModal() { const m = document.getElementById('project-modal'); m.classList.remove('hidden'); m.classList.add('flex'); lucide.createIcons(); }
function closeProjectModal() { const m = document.getElementById('project-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }

async function handleProjectSubmit(e) {
  e.preventDefault();
  await api.createProject({
    name: document.getElementById('proj-name').value.trim(),
    status: document.getElementById('proj-status').value,
    progress: parseInt(document.getElementById('proj-progress').value) || 0
  });
  document.getElementById('project-form').reset();
  closeProjectModal();
  await loadProfissionalData();
  renderProfissional();
}

async function updateProjectProgress(id, delta) {
  const project = projects.find(p => p.id === id);
  if (!project) return;
  const next = Math.max(0, Math.min(100, (project.progress || 0) + delta));
  await api.updateProject({ ...project, progress: next });
  await loadProfissionalData();
  renderProfissional();
}

async function updateProjectStatus(id, status) {
  const project = projects.find(p => p.id === id);
  if (!project) return;
  await api.updateProject({ ...project, status });
  await loadProfissionalData();
  renderProfissional();
}

function openTeamModal() { const m = document.getElementById('team-modal'); m.classList.remove('hidden'); m.classList.add('flex'); lucide.createIcons(); }
function closeTeamModal() { const m = document.getElementById('team-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }

async function handleTeamSubmit(e) {
  e.preventDefault();
  await api.createTeamMember({
    name: document.getElementById('team-name').value.trim(),
    role: document.getElementById('team-role').value.trim()
  });
  document.getElementById('team-form').reset();
  closeTeamModal();
  await loadProfissionalData();
  renderProfissional();
}

function renderGoals() {
  const goals = getGoals();
  const list = document.getElementById('goals-list'), empty = document.getElementById('goals-empty');
  if (!goals.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = goals.map(g => {
    const pct = g.goal_target ? Math.min(100, Math.round((g.goal_current || 0) / g.goal_target * 100)) : 0;
    const tags = (g.tags || '').split(',').filter(Boolean).map(tg => `<span class="tag-pill bg-purple-50 text-purple-600">${tg.trim()}</span>`).join('');
    return `<div class="glass rounded-xl p-5 fade-in"><div class="flex items-start justify-between mb-3"><div><p class="font-semibold text-sm text-slate-800">${g.title}</p><div class="flex gap-1 mt-1">${tags}</div></div><button onclick="promptDelete(${g.id})" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div><div class="flex items-center gap-2 mb-2"><div class="flex-1 bg-slate-200 rounded-full h-2.5"><div class="h-2.5 rounded-full goal-progress" style="width:${pct}%;background:linear-gradient(90deg,#6366f1,#a78bfa)"></div></div><span class="text-xs font-semibold text-indigo-600">${pct}%</span></div><div class="flex items-center justify-between"><span class="text-xs text-slate-400">${g.goal_current || 0} / ${g.goal_target}</span><div class="flex gap-1"><button onclick="updateGoalProgress(${g.id}, -1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-bold transition-all">−</button><button onclick="updateGoalProgress(${g.id}, 1)" class="w-7 h-7 rounded-lg bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-700 text-lg font-bold transition-all">+</button></div></div></div>`;
  }).join('');
  lucide.createIcons();
}

async function updateGoalProgress(id, delta) {
  const goal = allTasks.find(t => t.id === id);
  if (!goal) return;
  const target = goal.goal_target || 0;
  const next = Math.max(0, Math.min(target, (goal.goal_current || 0) + delta));
  await api.updateTask({ ...goal, goal_current: next });
  await loadTasks();
}
function openGoalModal() { const m = document.getElementById('goal-modal'); m.classList.remove('hidden'); m.classList.add('flex'); lucide.createIcons(); }
function closeGoalModal() { const m = document.getElementById('goal-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }
async function handleGoalSubmit(e) {
  e.preventDefault();
  if (allTasks.length >= 999) return;
  await api.createTask({
    title: document.getElementById('g-title').value.trim(),
    description: '',
    priority: 'media',
    tags: document.getElementById('g-tags').value.trim(),
    due_date: null,
    completed: false,
    subtasks: '[]',
    created_at: new Date().toISOString(),
    type: 'goal',
    goal_target: parseInt(document.getElementById('g-target').value) || 1,
    goal_current: 0
  });
  document.getElementById('goal-form').reset();
  closeGoalModal();
  await loadTasks();
}

function renderDashboard() {
  const wsTasks = getTasks();
  const total = wsTasks.length, done = wsTasks.filter(t => t.completed).length, pending = total - done;
  const overdue = wsTasks.filter(t => !t.completed && t.due_date && t.due_date < today).length;
  document.getElementById('metric-total').textContent = total;
  document.getElementById('metric-done').textContent = done;
  document.getElementById('metric-pending').textContent = pending;
  document.getElementById('metric-overdue').textContent = overdue;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = pct + '% concluído';
}

function renderTagFilters() {
  const wsTasks = getTasks();
  const tags = new Set();
  wsTasks.forEach(t => (t.tags || '').split(',').filter(Boolean).forEach(tg => tags.add(tg.trim())));
  document.getElementById('tag-filters').innerHTML = [...tags].map(tg => `<button onclick="toggleTagFilter('${tg}')" class="tag-pill ${tagFilter === tg ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'} hover:opacity-80 transition-all">${tg}</button>`).join('');
}

function openModal(task) {
  const modal = document.getElementById('modal'); modal.classList.remove('hidden'); modal.classList.add('flex');
  if (task) {
    document.getElementById('modal-title').textContent = 'Editar Tarefa';
    document.getElementById('form-submit-btn').textContent = 'Salvar';
    document.getElementById('edit-id').value = task.id;
    document.getElementById('f-title').value = task.title;
    document.getElementById('f-desc').value = task.description || '';
    document.getElementById('f-priority').value = task.priority;
    document.getElementById('f-due').value = task.due_date || '';
    document.getElementById('f-tags').value = task.tags || '';
    document.getElementById('f-subtasks').value = parseSubtasks(task.subtasks).map(s => s.text).join('\n');
  } else {
    document.getElementById('modal-title').textContent = 'Nova Tarefa';
    document.getElementById('form-submit-btn').textContent = 'Criar Tarefa';
    document.getElementById('task-form').reset(); document.getElementById('edit-id').value = '';
  }
  lucide.createIcons();
}
function closeModal() { const modal = document.getElementById('modal'); modal.classList.add('hidden'); modal.classList.remove('flex'); }

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('form-submit-btn'); btn.disabled = true; btn.textContent = 'Salvando...';
  const title = document.getElementById('f-title').value.trim(), description = document.getElementById('f-desc').value.trim(), priority = document.getElementById('f-priority').value, due_date = document.getElementById('f-due').value || null, tags = document.getElementById('f-tags').value.trim();
  const subtasksRaw = document.getElementById('f-subtasks').value.trim();
  const subtasks = subtasksRaw ? JSON.stringify(subtasksRaw.split('\n').filter(Boolean).map(text => ({text: text.trim(), done: false}))) : '[]';
  const editId = document.getElementById('edit-id').value;
  try {
    if (editId) {
      const existing = allTasks.find(t => t.id === Number(editId));
      if (existing) await api.updateTask({ ...existing, title, description, priority, due_date, tags, subtasks });
    } else {
      if (allTasks.length >= 999) { btn.disabled = false; btn.textContent = 'Criar Tarefa'; return; }
      await api.createTask({ title, description, priority, tags, due_date, completed: false, subtasks, created_at: new Date().toISOString(), type: 'task', goal_target: 0, goal_current: 0 });
    }
    await loadTasks();
  } finally {
    btn.disabled = false; btn.textContent = editId ? 'Salvar' : 'Criar Tarefa'; closeModal();
  }
}

function editTask(id) { const task = allTasks.find(t => t.id === id); if (task) openModal(task); }
async function toggleComplete(id) { const task = allTasks.find(t => t.id === id); if (task) { await api.updateTask({ ...task, completed: !task.completed }); await loadTasks(); } }
function promptDelete(id, type = 'task') { deleteTarget = id; deleteTargetType = type; const d = document.getElementById('delete-confirm'); d.classList.remove('hidden'); d.classList.add('flex'); lucide.createIcons(); }
function cancelDelete() { deleteTarget = null; const d = document.getElementById('delete-confirm'); d.classList.add('hidden'); d.classList.remove('flex'); }
async function confirmDelete() {
  if (!deleteTarget) return;
  const btn = document.getElementById('confirm-delete-btn'); btn.disabled = true;
  if (deleteTargetType === 'transaction') {
    await api.deleteTransaction(deleteTarget);
    await loadFinanceData();
    renderTransactions();
    renderFinCharts();
  } else if (deleteTargetType === 'investment') {
    await api.deleteInvestment(deleteTarget);
    await loadFinanceData();
    renderInvestmentTable();
    renderInvestmentCharts();
  } else if (deleteTargetType === 'project') {
    await api.deleteProject(deleteTarget);
    await loadProfissionalData();
    renderProfissional();
  } else if (deleteTargetType === 'team') {
    await api.deleteTeamMember(deleteTarget);
    await loadProfissionalData();
    renderProfissional();
  } else {
    await api.deleteTask(deleteTarget);
    await loadTasks();
  }
  btn.disabled = false; cancelDelete();
}
function parseSubtasks(str) { try { return JSON.parse(str || '[]'); } catch { return []; } }

// Aceita tanto "150,50" quanto "150.50" quanto "1.500,50" (formato BR com milhar).
function parseMoney(str) {
  let s = (str || '').trim();
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  return parseFloat(s);
}
function formatDate(d) { if (!d) return ''; const [y, m, day] = d.split('-'); return `${day}/${m}`; }

// ===== FINANÇAS MODULE =====
let finTransactions = [];
let finInstallments = [];
let investments = [];
let currentFinTab = 'resumo';

async function loadFinanceData() {
  finTransactions = await api.fetchTransactions();
  investments = await api.fetchInvestments();
}

function setFinTab(tab) {
  currentFinTab = tab;
  document.getElementById('fin-resumo').classList.toggle('hidden', tab !== 'resumo');
  document.getElementById('fin-lancamentos').classList.toggle('hidden', tab !== 'lancamentos');
  document.getElementById('fin-investimentos').classList.toggle('hidden', tab !== 'investimentos');
  document.getElementById('fin-parcelamento').classList.toggle('hidden', tab !== 'parcelamento');
  document.querySelectorAll('.fin-tab').forEach((btn, i) => {
    const tabs = ['resumo','lancamentos','investimentos','parcelamento'];
    btn.classList.toggle('active', tabs[i] === tab);
    if (tabs[i] !== tab) { btn.classList.add('bg-white','border','border-slate-200','text-slate-600'); btn.classList.remove('active'); }
    else { btn.classList.remove('bg-white','border','border-slate-200','text-slate-600'); }
  });
  if (tab === 'resumo') renderFinCharts();
  if (tab === 'lancamentos') renderTransactions();
  if (tab === 'investimentos') { renderInvestmentCharts(); renderInvestmentTable(); }
}

function monthlyTotals(transactions) {
  const months = [...new Set(transactions.map(t => t.month).filter(Boolean))].sort();
  return months.map(m => {
    const monthTx = transactions.filter(t => t.month === m);
    const income = monthTx.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
    const credit = monthTx.filter(t => t.type === 'cartao').reduce((s, t) => s + t.amount, 0);
    return { month: m, income, expenses, credit, balance: income - expenses - credit };
  });
}

function renderFinCharts() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = finTransactions.filter(t => t.month === currentMonth);
  const income = thisMonth.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
  const credit = thisMonth.filter(t => t.type === 'cartao').reduce((s, t) => s + t.amount, 0);
  document.getElementById('fin-income').textContent = 'R$ ' + income.toLocaleString('pt-BR');
  document.getElementById('fin-expenses').textContent = 'R$ ' + expenses.toLocaleString('pt-BR');
  document.getElementById('fin-credit').textContent = 'R$ ' + credit.toLocaleString('pt-BR');
  document.getElementById('fin-balance').textContent = 'R$ ' + (income - expenses - credit).toLocaleString('pt-BR');

  // Donut chart - despesas por categoria no mes atual
  const categories = {};
  thisMonth.filter(t => t.type !== 'entrada').forEach(t => { categories[t.category] = (categories[t.category] || 0) + t.amount; });
  const catColors = ['#10b981','#f59e0b','#6366f1','#ef4444','#3b82f6','#ec4899','#8b5cf6'];
  const catEntries = Object.entries(categories);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0);
  const canvas = document.getElementById('chart-donut');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 220, 220);
    if (catTotal > 0) {
      let start = -Math.PI / 2;
      catEntries.forEach(([, v], i) => {
        const slice = (v / catTotal) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(110, 110); ctx.arc(110, 110, 90, start, start + slice); ctx.closePath();
        ctx.fillStyle = catColors[i % catColors.length]; ctx.fill();
        start += slice;
      });
      ctx.beginPath(); ctx.arc(110, 110, 55, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 16px DM Sans'; ctx.textAlign = 'center'; ctx.fillText('R$ ' + catTotal.toLocaleString('pt-BR'), 110, 115);
    }
  }
  document.getElementById('donut-legend').innerHTML = catEntries.map(([k], i) => `<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full" style="background:${catColors[i % catColors.length]}"></span>${k}</span>`).join('');

  // Bar chart e line chart - historico real dos meses com lancamentos
  const totals = monthlyTotals(finTransactions).slice(-3);
  const barCanvas = document.getElementById('chart-bar');
  if (barCanvas) {
    const bctx = barCanvas.getContext('2d');
    bctx.clearRect(0, 0, 280, 200);
    if (totals.length) {
      const maxVal = Math.max(1, ...totals.map(m => Math.max(m.income, m.expenses + m.credit)));
      const barW = 28, gap = 50, startX = 40;
      totals.forEach((m, i) => {
        const x = startX + i * (barW * 2 + gap);
        const hI = (m.income / maxVal) * 140;
        const hO = ((m.expenses + m.credit) / maxVal) * 140;
        bctx.fillStyle = '#10b981'; bctx.beginPath(); bctx.roundRect(x, 160 - hI, barW, hI, 4); bctx.fill();
        bctx.fillStyle = '#ef4444'; bctx.beginPath(); bctx.roundRect(x + barW + 4, 160 - hO, barW, hO, 4); bctx.fill();
        bctx.fillStyle = '#64748b'; bctx.font = '11px DM Sans'; bctx.textAlign = 'center'; bctx.fillText(m.month.slice(5), x + barW + 2, 178);
      });
    }
    bctx.fillStyle = '#10b981'; bctx.fillRect(20, 190, 10, 6); bctx.fillStyle = '#64748b'; bctx.font = '10px DM Sans'; bctx.textAlign = 'left'; bctx.fillText('Entradas', 34, 196);
    bctx.fillStyle = '#ef4444'; bctx.fillRect(100, 190, 10, 6); bctx.fillText('Saídas', 114, 196);
  }

  const lineCanvas = document.getElementById('chart-line');
  if (lineCanvas) {
    const lctx = lineCanvas.getContext('2d');
    lctx.clearRect(0, 0, 280, 200);
    const recent = monthlyTotals(finTransactions).slice(-5);
    if (recent.length > 1) {
      const balances = recent.map(m => m.balance);
      const maxB = Math.max(...balances) * 1.1 || 1, minB = Math.min(...balances) * 0.9;
      lctx.beginPath(); lctx.strokeStyle = '#6366f1'; lctx.lineWidth = 2.5;
      recent.forEach((m, i) => {
        const x = 30 + i * (250 / (recent.length - 1)), y = 160 - ((m.balance - minB) / (maxB - minB || 1)) * 130;
        if (i === 0) lctx.moveTo(x, y); else lctx.lineTo(x, y);
      });
      lctx.stroke();
      recent.forEach((m, i) => {
        const x = 30 + i * (250 / (recent.length - 1)), y = 160 - ((m.balance - minB) / (maxB - minB || 1)) * 130;
        lctx.beginPath(); lctx.arc(x, y, 4, 0, Math.PI * 2); lctx.fillStyle = '#6366f1'; lctx.fill();
        lctx.fillStyle = '#64748b'; lctx.font = '10px DM Sans'; lctx.textAlign = 'center'; lctx.fillText(m.month.slice(5), x, 178);
      });
    }
  }
}

function renderTransactions() {
  const filterMonth = document.getElementById('fin-filter-month')?.value || '';
  const filterType = document.getElementById('fin-filter-type')?.value || '';
  const filterPayment = document.getElementById('fin-filter-payment')?.value || '';
  let filtered = finTransactions;
  if (filterMonth) filtered = filtered.filter(t => t.month && t.month.endsWith('-' + filterMonth));
  if (filterType) filtered = filtered.filter(t => t.type === filterType);
  if (filterPayment) filtered = filtered.filter(t => t.payment === filterPayment);

  const container = document.getElementById('fin-transactions');
  if (!filtered.length) { container.innerHTML = '<p class="text-sm text-slate-400 text-center py-6">Nenhum lançamento encontrado.</p>'; return; }
  const typeColors = { entrada: 'text-emerald-600', saida: 'text-red-500', cartao: 'text-orange-500' };
  const typeLabels = { entrada: 'Entrada', saida: 'Saída', cartao: 'Cartão' };
  const paymentLabels = { pix: 'Pix', dinheiro: 'Dinheiro', cartao_credito: 'Cartão Crédito', cartao_debito: 'Débito', boleto: 'Boleto', transferencia: 'Transferência' };
  container.innerHTML = filtered.map(t => `<div class="glass rounded-lg p-3 flex items-center justify-between slide-in">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center ${t.type === 'entrada' ? 'bg-emerald-100' : t.type === 'cartao' ? 'bg-orange-100' : 'bg-red-100'}">
        <i data-lucide="${t.type === 'entrada' ? 'trending-up' : t.type === 'cartao' ? 'credit-card' : 'trending-down'}" class="w-4 h-4 ${typeColors[t.type]}"></i>
      </div>
      <div>
        <p class="text-sm font-medium text-slate-800">${t.desc}</p>
        <p class="text-xs text-slate-400">${typeLabels[t.type]} • ${paymentLabels[t.payment] || t.payment} • ${t.category}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <p class="text-sm font-semibold ${typeColors[t.type]}">${t.type === 'entrada' ? '+' : '-'}R$ ${t.amount.toLocaleString('pt-BR')}</p>
      <button onclick="promptDelete(${t.id}, 'transaction')" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>
  </div>`).join('');
  lucide.createIcons();
}

function openFinModal() { const m = document.getElementById('fin-modal'); m.classList.remove('hidden'); m.classList.add('flex'); lucide.createIcons(); }
function closeFinModal() { const m = document.getElementById('fin-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }

async function handleFinSubmit(e) {
  e.preventDefault();
  const amount = parseMoney(document.getElementById('fin-f-amount').value);
  if (isNaN(amount)) { alert('Valor inválido. Use um número, ex: 150,50'); return; }
  const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
  try {
    await api.createTransaction({
      desc: document.getElementById('fin-f-desc').value.trim(),
      amount,
      type: document.getElementById('fin-f-type').value,
      payment: document.getElementById('fin-f-payment').value,
      month: document.getElementById('fin-f-month').value || new Date().toISOString().slice(0, 7),
      category: document.getElementById('fin-f-category').value.trim() || 'Outros'
    });
    document.getElementById('fin-form').reset();
    closeFinModal();
    await loadFinanceData();
    renderTransactions();
    renderFinCharts();
  } catch (err) {
    alert('Não foi possível salvar o lançamento: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

function generateInstallments(e) {
  e.preventDefault();
  const desc = document.getElementById('inst-desc').value.trim();
  const total = parseMoney(document.getElementById('inst-total').value);
  const parcelas = parseInt(document.getElementById('inst-parcelas').value);
  if (isNaN(total) || isNaN(parcelas)) { alert('Valores inválidos. Confira o valor total e o número de parcelas.'); return; }
  const perMonth = Math.round((total / parcelas) * 100) / 100;
  const now = new Date();
  finInstallments = [];
  for (let i = 0; i < parcelas; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    finInstallments.push({ num: i + 1, total: parcelas, amount: perMonth, month: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, desc });
  }
  document.getElementById('installment-form').reset();
  renderInstallments();
}

function renderInstallments() {
  const container = document.getElementById('installment-timeline');
  if (!finInstallments.length) { container.innerHTML = ''; return; }
  const currentMonth = new Date().toISOString().slice(0, 7);
  container.innerHTML = `<p class="text-sm font-semibold text-slate-700 mb-2">${finInstallments[0].desc} — ${finInstallments.length}x de R$ ${finInstallments[0].amount.toLocaleString('pt-BR')}</p>` +
    `<div class="grid gap-2">${finInstallments.map(inst => {
      const isCurrent = inst.month === currentMonth;
      const isPast = inst.month < currentMonth;
      return `<div class="flex items-center gap-3 p-3 rounded-lg ${isCurrent ? 'bg-emerald-50 border border-emerald-200' : isPast ? 'bg-slate-50 opacity-60' : 'glass'}">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}">${inst.num}</div>
        <div class="flex-1"><p class="text-sm font-medium text-slate-700">${inst.month}</p><p class="text-xs text-slate-400">Parcela ${inst.num}/${inst.total}</p></div>
        <p class="text-sm font-semibold ${isCurrent ? 'text-emerald-600' : 'text-slate-600'}">R$ ${inst.amount.toLocaleString('pt-BR')}</p>
      </div>`;
    }).join('')}</div>`;
}

function finExport() {
  const toast = document.getElementById('fin-toast');
  toast.innerHTML = '<div class="fin-toast bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"><i data-lucide="check-circle" class="w-5 h-5"></i><span class="text-sm font-medium">Exportação preparada! Integração com PDF em breve.</span></div>';
  toast.classList.remove('hidden');
  lucide.createIcons();
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== INVESTMENTS MODULE =====
function renderInvestmentCharts() {
  const totalApplied = investments.reduce((s, i) => s + i.applied, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.current, 0);

  const canvas = document.getElementById('chart-investment');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 240, 180);
    if (totalApplied > 0 || totalCurrent > 0) {
      const w = 50, h = 120, gap = 20, startX = 40;
      const maxV = Math.max(totalApplied, totalCurrent, 1);
      ctx.fillStyle = '#6366f1'; ctx.beginPath(); ctx.roundRect(startX, h - (totalApplied / maxV * h), w, (totalApplied / maxV * h), 4); ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.roundRect(startX + w + gap, h - (totalCurrent / maxV * h), w, (totalCurrent / maxV * h), 4); ctx.fill();
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 12px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText('Aplicado', startX + w/2, h + 15);
      ctx.fillText('Atual', startX + w + gap + w/2, h + 15);
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px DM Sans'; ctx.textAlign = 'center';
      ctx.fillText('R$ ' + totalApplied.toLocaleString('pt-BR'), startX + w/2, h - (totalApplied / maxV * h) - 5);
      ctx.fillText('R$ ' + totalCurrent.toLocaleString('pt-BR'), startX + w + gap + w/2, h - (totalCurrent / maxV * h) - 5);
    }
  }

  // Evolucao: total acumulado (aplicado x atual) ordenado pelo mes de aplicacao
  const lineCanvas = document.getElementById('chart-investment-line');
  if (lineCanvas) {
    const lctx = lineCanvas.getContext('2d');
    lctx.clearRect(0, 0, 240, 180);
    const sorted = [...investments].filter(i => i.month).sort((a, b) => a.month.localeCompare(b.month));
    if (sorted.length > 1) {
      let running = 0;
      const points = sorted.map(i => { running += i.current; return running; });
      const maxE = Math.max(...points) * 1.1, minE = Math.min(...points) * 0.8;
      lctx.beginPath(); lctx.strokeStyle = '#8b5cf6'; lctx.lineWidth = 2.5;
      points.forEach((v, i) => {
        const x = 30 + i * (200 / (points.length - 1)), y = 140 - ((v - minE) / (maxE - minE || 1)) * 110;
        if (i === 0) lctx.moveTo(x, y); else lctx.lineTo(x, y);
      });
      lctx.stroke();
      points.forEach((v, i) => {
        const x = 30 + i * (200 / (points.length - 1)), y = 140 - ((v - minE) / (maxE - minE || 1)) * 110;
        lctx.beginPath(); lctx.arc(x, y, 3, 0, Math.PI * 2); lctx.fillStyle = '#8b5cf6'; lctx.fill();
        lctx.fillStyle = '#64748b'; lctx.font = '10px DM Sans'; lctx.textAlign = 'center'; lctx.fillText(sorted[i].month.slice(5), x, 160);
      });
    }
  }
}

function renderInvestmentTable() {
  const tbody = document.getElementById('investment-table-body');
  const typeLabels = { acoes: 'Ações', 'renda-fixa': 'Renda Fixa', cripto: 'Criptomoedas', fii: 'FII', outros: 'Outros' };
  const typeColors = { acoes: 'text-blue-600', 'renda-fixa': 'text-emerald-600', cripto: 'text-orange-600', fii: 'text-indigo-600', outros: 'text-slate-600' };
  tbody.innerHTML = investments.map(inv => {
    const gain = inv.current - inv.applied;
    const gainPct = ((gain / inv.applied) * 100).toFixed(1);
    const status = gain >= 0 ? 'Ganho' : 'Perda';
    const statusColor = gain >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
    return `<tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="px-3 py-2.5 font-medium text-slate-800">${inv.name}</td>
      <td class="px-3 py-2.5"><span class="${typeColors[inv.type]} font-medium text-xs">${typeLabels[inv.type]}</span></td>
      <td class="text-right px-3 py-2.5 text-slate-700">R$ ${inv.applied.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
      <td class="text-right px-3 py-2.5 text-slate-700 font-medium">R$ ${inv.current.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
      <td class="text-right px-3 py-2.5 font-semibold ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}">${gain >= 0 ? '+' : ''}${gainPct}%</td>
      <td class="text-center px-3 py-2.5 text-slate-600 text-xs">${inv.month}</td>
      <td class="text-center px-3 py-2.5"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${status}</span></td>
      <td class="text-center px-3 py-2.5"><button onclick="promptDelete(${inv.id}, 'investment')" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
    </tr>`;
  }).join('');
  updateInvestmentSummary();
  lucide.createIcons();
}

function updateInvestmentSummary() {
  const totalApplied = investments.reduce((s, i) => s + i.applied, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.current, 0);
  const gain = totalCurrent - totalApplied;
  const returnPct = totalApplied ? ((gain / totalApplied) * 100).toFixed(1) : 0;
  document.getElementById('inv-total-applied').textContent = 'R$ ' + totalApplied.toLocaleString('pt-BR');
  document.getElementById('inv-total-current').textContent = 'R$ ' + totalCurrent.toLocaleString('pt-BR');
  document.getElementById('inv-total-gain').textContent = (gain >= 0 ? '+' : '') + 'R$ ' + Math.abs(gain).toLocaleString('pt-BR');
  document.getElementById('inv-total-return').textContent = (gain >= 0 ? '+' : '') + returnPct + '%';
  document.getElementById('inv-total-gain').classList.toggle('text-emerald-600', gain >= 0);
  document.getElementById('inv-total-gain').classList.toggle('text-red-600', gain < 0);
  document.getElementById('inv-total-return').classList.toggle('text-emerald-600', gain >= 0);
  document.getElementById('inv-total-return').classList.toggle('text-red-600', gain < 0);
}

function openInvestmentModal() { const m = document.getElementById('investment-modal'); m.classList.remove('hidden'); m.classList.add('flex'); lucide.createIcons(); }
function closeInvestmentModal() { const m = document.getElementById('investment-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }

async function handleInvestmentSubmit(e) {
  e.preventDefault();
  const applied = parseMoney(document.getElementById('inv-f-applied').value);
  const current = parseMoney(document.getElementById('inv-f-current').value);
  if (isNaN(applied) || isNaN(current)) { alert('Valor inválido. Use um número, ex: 1000,00'); return; }
  const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
  try {
    await api.createInvestment({
      name: document.getElementById('inv-f-name').value.trim(),
      type: document.getElementById('inv-f-type').value,
      applied,
      current,
      month: document.getElementById('inv-f-month').value || new Date().toISOString().slice(0, 7)
    });
    document.getElementById('investment-form').reset();
    closeInvestmentModal();
    await loadFinanceData();
    renderInvestmentTable();
    renderInvestmentCharts();
  } catch (err) {
    alert('Não foi possível salvar o investimento: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}
