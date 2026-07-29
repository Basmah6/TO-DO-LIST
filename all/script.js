// --- إعدادات Supabase (ضعي بيانات مشروعك هنا) ---
const SUPABASE_URL = 'https://jhvmlsmntnhrjliadfib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impodm1sc21udG5ocmpsaWFkZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNjc1MzcsImV4cCI6MjEwMDg0MzUzN30.YC7R7HW6TMK_9njv1zMivv-mprS7bWHqAJy65OX69mc';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USERNAME_STORAGE_KEY = 'simple_todo_app_username';

// SVG Icon Helpers
const ICONS = {
  flower: `<img src="all/lily.png" alt="lily" width="20" height="20" />`,
  user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  plusSmall: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkSmall: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  x: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  xSmall: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  cornerDownRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>`,
  checkCircle: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  flowerLarge: `<img src="all/lily.png" alt="lily" width="40" height="40" />`,
};

// Application State
let userName = 'Nawaf';
let tasks = [];
let filter = 'all'; // 'all' | 'active' | 'completed'
let editingId = null;
let addingSubtaskForId = null;
let isEditingName = false;

// Helper: Check if Basmah
function isBasmahUser(name) {
  const n = (name || '').trim().toLowerCase();
  return n.includes('basmah') || name.includes('بسمة') || name.includes('بسمه');
}

// Storage Functions (Username only)
function loadUserName() {
  try {
    return localStorage.getItem(USERNAME_STORAGE_KEY) || 'Nawaf';
  } catch (e) {
    return 'Nawaf';
  }
}

function saveUserName(name) {
  try {
    localStorage.setItem(USERNAME_STORAGE_KEY, name);
  } catch (e) {
    console.error('Failed to save username', e);
  }
}

// --- Supabase Data Fetching & Sync ---
async function fetchTasksFromSupabase() {
  try {
    // جلب المهام الرئيسية
    const { data: dbTasks, error: taskError } = await supabaseClient
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (taskError) throw taskError;

    // جلب المهام الفرعية
    const { data: dbSubtasks, error: subError } = await supabaseClient
      .from('subtasks')
      .select('*');

    if (subError) throw subError;

    // دمج المهام الرئيسية مع الفرعية الخاصة بها
    tasks = (dbTasks || []).map(t => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      createdAt: new Date(t.created_at).getTime(),
      subtasks: (dbSubtasks || [])
        .filter(st => st.task_id === t.id)
        .map(st => ({ id: st.id, text: st.text, completed: st.completed }))
    }));

    render();
  } catch (err) {
    console.error('Error fetching tasks from Supabase:', err);
  }
}

// Date Formatter
function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Main Render Function
function render() {
  const isBasmah = isBasmahUser(userName);

  if (isBasmah) {
    document.body.classList.add('theme-basmah');
  } else {
    document.body.classList.remove('theme-basmah');
  }

  let lilyDecor = document.getElementById('lily-decorations');
  if (isBasmah) {
    if (!lilyDecor) {
      lilyDecor = document.createElement('div');
      lilyDecor.id = 'lily-decorations';
      lilyDecor.innerHTML = `
        <div class="lily-glow-1"></div>
        <div class="lily-glow-2"></div>
        <div class="lily-floating-flower">${ICONS.flowerLarge}</div>
      `;
      document.body.prepend(lilyDecor);
    }
  } else {
    if (lilyDecor) lilyDecor.remove();
  }

  const btnNawaf = document.getElementById('switch-user-nawaf');
  const btnBasmah = document.getElementById('switch-user-basmah');
  btnNawaf.className = `user-btn ${!isBasmah ? 'active-nawaf' : ''}`;
  btnBasmah.className = `user-btn ${isBasmah ? 'active-basmah' : ''}`;

  let bannerPill = document.getElementById('theme-banner-pill');
  if (isBasmah) {
    if (!bannerPill) {
      bannerPill = document.createElement('div');
      bannerPill.id = 'theme-banner-pill';
      bannerPill.className = 'theme-banner-pill';
      bannerPill.innerHTML = `<span class="animate-spin-slow" style="display:inline-flex;">${ICONS.flower}</span> <span>زهرة الزنبق • Lily Blossom</span>`;
      document.getElementById('user-switcher').appendChild(bannerPill);
    }
  } else {
    if (bannerPill) bannerPill.remove();
  }

  const greetingBox = document.getElementById('greeting-box');
  if (isEditingName) {
    greetingBox.innerHTML = `
      <div class="name-edit-box">
        <input type="text" id="name-input" class="name-input" value="${escapeHtml(userName)}" />
        <button id="save-name-btn" class="name-save-btn" title="Save name">${ICONS.check}</button>
      </div>
    `;
    const nameInput = document.getElementById('name-input');
    nameInput.focus();
    nameInput.select();

    const handleSave = () => {
      const trimmed = nameInput.value.trim();
      if (trimmed) {
        userName = trimmed;
        saveUserName(userName);
      }
      isEditingName = false;
      render();
    };

    document.getElementById('save-name-btn').onclick = handleSave;
    nameInput.onkeydown = (e) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') {
        isEditingName = false;
        render();
      }
    };
  } else {
    greetingBox.innerHTML = `
      <div class="greeting-title" id="trigger-edit-name" title="Click to edit name">
        Hello, <span class="username-highlight">${escapeHtml(userName)}</span>
        <span class="edit-icon">${ICONS.edit}</span>
      </div>
    `;
    document.getElementById('trigger-edit-name').onclick = () => {
      isEditingName = true;
      render();
    };
  }

  const titleEl = document.getElementById('todo-title');
  titleEl.innerHTML = isBasmah
    ? `<span style="color:#e11d48; display:inline-flex;">${ICONS.flower}</span> Today`
    : `Today`;

  document.getElementById('current-date').textContent = getFormattedDate();

  const completedCount = tasks.filter((t) => t.completed).length;
  document.getElementById('progress-counter').textContent = `${completedCount} / ${tasks.length}`;

  const taskInput = document.getElementById('new-task-input');
  taskInput.placeholder = isBasmah
    ? 'What beautiful task needs to be done today? 🌸'
    : 'What needs to be done?';
  
  const inputIcon = document.getElementById('input-icon');
  inputIcon.innerHTML = isBasmah ? ICONS.flower : ICONS.plus;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const listContainer = document.getElementById('task-list-container');
  if (filteredTasks.length === 0) {
    let emptyMsg = 'All clear! Add a new task above.';
    if (tasks.length > 0) {
      emptyMsg = filter === 'active' ? 'No active tasks remaining.' : 'No completed tasks yet.';
    }
    listContainer.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-icon">${isBasmah ? ICONS.flowerLarge : ICONS.checkCircle}</div>
        <p>${emptyMsg}</p>
      </div>
    `;
  } else {
    const ul = document.createElement('ul');
    ul.className = 'task-list';

    filteredTasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-card fade-in ${task.completed ? 'completed' : ''}`;
      li.id = `task-item-${task.id}`;

      if (editingId === task.id) {
        li.innerHTML = `
          <div class="edit-task-row">
            <input type="text" id="edit-input-${task.id}" class="inline-edit-input" value="${escapeHtml(task.text)}" />
            <button class="action-btn" id="save-edit-${task.id}" title="Save">${ICONS.check}</button>
            <button class="action-btn" id="cancel-edit-${task.id}" title="Cancel">${ICONS.x}</button>
          </div>
        `;
        setTimeout(() => {
          const editInput = document.getElementById(`edit-input-${task.id}`);
          if (editInput) {
            editInput.focus();
            editInput.onkeydown = (e) => {
              if (e.key === 'Enter') saveTaskText(task.id, editInput.value);
              if (e.key === 'Escape') {
                editingId = null;
                render();
              }
            };
          }
        }, 0);

        li.querySelector(`#save-edit-${task.id}`).onclick = () => {
          const val = document.getElementById(`edit-input-${task.id}`).value;
          saveTaskText(task.id, val);
        };
        li.querySelector(`#cancel-edit-${task.id}`).onclick = () => {
          editingId = null;
          render();
        };
      } else {
        const subtasks = task.subtasks || [];
        const isAddingSubtask = addingSubtaskForId === task.id;

        li.innerHTML = `
          <div class="task-main-row">
            <div class="custom-checkbox ${task.completed ? 'checked' : ''}" id="toggle-${task.id}">
              ${task.completed ? (isBasmah ? ICONS.flower : ICONS.check) : ''}
            </div>
            <div class="task-text-container">
              <span class="task-text ${task.completed ? 'completed-text' : ''}" id="text-${task.id}">${escapeHtml(task.text)}</span>
            </div>
            <div class="task-actions">
              <button class="action-btn subtask-btn" id="add-sub-btn-${task.id}" title="Add Subtask">
                ${ICONS.plusSmall} Subtask
              </button>
              <button class="action-btn" id="edit-btn-${task.id}" title="Edit task">${ICONS.edit}</button>
              <button class="action-btn" id="delete-btn-${task.id}" title="Delete task">${ICONS.trash}</button>
            </div>
          </div>
          ${
            subtasks.length > 0 || isAddingSubtask
              ? `<div class="subtasks-wrapper" id="subtasks-container-${task.id}"></div>`
              : ''
          }
        `;

        li.querySelector(`#toggle-${task.id}`).onclick = () => toggleTask(task.id);

        li.querySelector(`#text-${task.id}`).ondblclick = () => {
          editingId = task.id;
          render();
        };

        li.querySelector(`#add-sub-btn-${task.id}`).onclick = () => {
          addingSubtaskForId = task.id;
          render();
        };
        li.querySelector(`#edit-btn-${task.id}`).onclick = () => {
          editingId = task.id;
          render();
        };
        li.querySelector(`#delete-btn-${task.id}`).onclick = () => deleteTask(task.id);

        if (subtasks.length > 0 || isAddingSubtask) {
          const subWrapper = li.querySelector(`#subtasks-container-${task.id}`);

          subtasks.forEach((st) => {
            const stItem = document.createElement('div');
            stItem.className = 'subtask-item';
            stItem.innerHTML = `
              <div class="subtask-left">
                <span class="subtask-icon">${ICONS.cornerDownRight}</span>
                <div class="subtask-checkbox ${st.completed ? 'checked' : ''}" id="toggle-st-${task.id}-${st.id}">
                  ${st.completed ? ICONS.checkSmall : ''}
                </div>
                <span class="subtask-text ${st.completed ? 'completed' : ''}">${escapeHtml(st.text)}</span>
              </div>
              <button class="action-btn" id="del-st-${task.id}-${st.id}" title="Delete subtask">${ICONS.xSmall}</button>
            `;

            stItem.querySelector(`#toggle-st-${task.id}-${st.id}`).onclick = () =>
              toggleSubtask(task.id, st.id);
            stItem.querySelector(`#del-st-${task.id}-${st.id}`).onclick = () =>
              deleteSubtask(task.id, st.id);

            subWrapper.appendChild(stItem);
          });

          if (isAddingSubtask) {
            const subForm = document.createElement('form');
            subForm.className = 'add-subtask-form';
            subForm.innerHTML = `
              <span class="subtask-icon">${ICONS.cornerDownRight}</span>
              <input type="text" id="subtask-input-${task.id}" class="subtask-input" placeholder="Type subtask and press Enter..." />
              <button type="submit" class="action-btn">${ICONS.checkSmall}</button>
              <button type="button" id="cancel-subtask-${task.id}" class="action-btn">${ICONS.xSmall}</button>
            `;

            subForm.onsubmit = (e) => {
              e.preventDefault();
              const inp = document.getElementById(`subtask-input-${task.id}`);
              if (inp) addSubtask(task.id, inp.value);
            };

            subForm.querySelector(`#cancel-subtask-${task.id}`).onclick = () => {
              addingSubtaskForId = null;
              render();
            };

            subWrapper.appendChild(subForm);

            setTimeout(() => {
              const subInp = document.getElementById(`subtask-input-${task.id}`);
              if (subInp) {
                subInp.focus();
                subInp.onkeydown = (e) => {
                  if (e.key === 'Escape') {
                    addingSubtaskForId = null;
                    render();
                  }
                };
              }
            }, 0);
          }
        }
      }

      ul.appendChild(li);
    });

    listContainer.innerHTML = '';
    listContainer.appendChild(ul);
  }

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const clearBtn = document.getElementById('clear-completed-button');
  if (completedCount > 0) {
    clearBtn.style.display = 'block';
  } else {
    clearBtn.style.display = 'none';
  }
}

// --- Supabase Actions (Database Operations) ---
async function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const { error } = await supabaseClient
    .from('tasks')
    .insert([{ text: trimmed, completed: false }]);

  if (error) console.error('Error adding task:', error);
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newCompleted = !task.completed;

  // تحديث المهمة الرئيسية
  await supabaseClient
    .from('tasks')
    .update({ completed: newCompleted })
    .eq('id', id);

  // تحديث كافة المهام الفرعية التابعة لها لتتطابق مع حالتها
  await supabaseClient
    .from('subtasks')
    .update({ completed: newCompleted })
    .eq('task_id', id);
}

async function saveTaskText(id, text) {
  const trimmed = text.trim();
  if (!trimmed) {
    deleteTask(id);
    return;
  }

  await supabaseClient
    .from('tasks')
    .update({ text: trimmed })
    .eq('id', id);

  editingId = null;
}

async function deleteTask(id) {
  if (editingId === id) editingId = null;

  await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', id);
}

async function addSubtask(taskId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await supabaseClient
    .from('subtasks')
    .insert([{ task_id: taskId, text: trimmed, completed: false }]);

  addingSubtaskForId = null;
}

async function toggleSubtask(taskId, subtaskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const subtask = (task.subtasks || []).find(st => st.id === subtaskId);
  if (!subtask) return;

  const newSubCompleted = !subtask.completed;

  // تحديث المهمة الفرعية
  await supabaseClient
    .from('subtasks')
    .update({ completed: newSubCompleted })
    .eq('id', subtaskId);

  // التحقق مما إذا كانت جميع المهام الفرعية أصبحت منجزة لتحديث الرئيسية تلقائياً
  const updatedSubtasks = task.subtasks.map(st => 
    st.id === subtaskId ? { ...st, completed: newSubCompleted } : st
  );
  const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);

  if (allDone) {
    await supabaseClient
      .from('tasks')
      .update({ completed: true })
      .eq('id', taskId);
  }
}

async function deleteSubtask(taskId, subtaskId) {
  await supabaseClient
    .from('subtasks')
    .delete()
    .eq('id', subtaskId);
}

async function clearCompleted() {
  const completedIds = tasks.filter(t => t.completed).map(t => t.id);
  if (completedIds.length === 0) return;

  await supabaseClient
    .from('tasks')
    .delete()
    .in('id', completedIds);
}

function switchUser(newUserName) {
  userName = newUserName;
  saveUserName(userName);
  editingId = null;
  addingSubtaskForId = null;
  render();
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initial Event Listeners & Realtime Subscription
document.addEventListener('DOMContentLoaded', () => {
  userName = loadUserName();

  // User Switcher
  document.getElementById('switch-user-nawaf').onclick = () => switchUser('Nawaf');
  document.getElementById('switch-user-basmah').onclick = () => switchUser('Basmah');

  // Add Task Form
  const addForm = document.getElementById('add-task-form');
  const taskInput = document.getElementById('new-task-input');

  addForm.onsubmit = (e) => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
  };

  // Filter Buttons
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.onclick = () => {
      filter = btn.dataset.filter;
      render();
    };
  });

  // Clear Completed Button
  document.getElementById('clear-completed-button').onclick = clearCompleted;

  // جلب البيانات الأولية من Supabase
  fetchTasksFromSupabase();

  // تفعيل الاستماع الفوري (Realtime) لتظهر التعديلات بينكما مباشرة دون تحديث الصفحة
  supabaseClient
    .channel('public-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      fetchTasksFromSupabase();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, () => {
      fetchTasksFromSupabase();
    })
    .subscribe();
});