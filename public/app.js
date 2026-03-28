const API_URL = 'http://localhost:5000/api';

// State
let token = localStorage.getItem('token');
let username = localStorage.getItem('username');
let currentPage = 1;

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const btnShowLogin = document.getElementById('btn-show-login');
const btnShowRegister = document.getElementById('btn-show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userDisplay = document.getElementById('user-display');
const tasksContainer = document.getElementById('tasks-container');
const paginationControls = document.getElementById('pagination-controls');
const taskStats = document.getElementById('task-stats');

// Initialize
function init() {
    if (token) {
        showDashboard();
    } else {
        showAuth();
    }
}

// UI Toggles
function showAuth() {
    authView.classList.add('active');
    dashboardView.classList.remove('active');
}

function showDashboard() {
    authView.classList.remove('active');
    dashboardView.classList.add('active');
    userDisplay.innerText = username || 'User';
    fetchTasks();
}

btnShowLogin.addEventListener('click', () => {
    btnShowLogin.classList.add('active');
    btnShowRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

btnShowRegister.addEventListener('click', () => {
    btnShowRegister.classList.add('active');
    btnShowLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Auth Handlers
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const errObj = document.getElementById('login-error');

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        
        if (res.ok) {
            token = data.token;
            username = u;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            errObj.innerText = '';
            loginForm.reset();
            showDashboard();
        } else {
            errObj.innerText = data.error || 'Login failed';
        }
    } catch (err) {
        errObj.innerText = 'Server error. Is the backend running?';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('register-username').value;
    const p = document.getElementById('register-password').value;
    const errObj = document.getElementById('register-error');

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        
        if (res.ok) {
            token = data.token;
            username = u;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            errObj.innerText = '';
            registerForm.reset();
            showDashboard();
        } else {
            errObj.innerText = data.error || 'Registration failed';
        }
    } catch (err) {
        errObj.innerText = 'Server error.';
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    token = null;
    username = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    showAuth();
});

// Tasks HTTP Handlers
async function fetchTasks(page = 1) {
    currentPage = page;
    try {
        const res = await fetch(`${API_URL}/tasks?page=${page}&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) { token = null; return showAuth(); }
        
        const data = await res.json();
        renderTasks(data.data);
        renderPagination(data.pagination);
        taskStats.innerText = `${data.pagination.total} total task(s)`;
    } catch (err) {
        console.error('Failed to fetch tasks', err);
    }
}

document.getElementById('create-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const status = document.getElementById('task-status').value;
    const btn = e.target.querySelector('button');

    btn.innerText = 'Adding...';
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, status })
        });
        if (res.ok) {
            e.target.reset();
            fetchTasks(1); // Go to first page to see new task
        }
    } catch (err) {
        console.error('Error creating task', err);
    }
    btn.innerText = '+ Add Task';
});

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTasks(currentPage);
    } catch (err) {
        console.error('Failed to delete', err);
    }
}

// Modal Handlers
const updateModal = document.getElementById('update-modal');

function openUpdateModal(task) {
    document.getElementById('update-task-id').value = task.id;
    document.getElementById('update-task-title').value = task.title;
    document.getElementById('update-task-desc').value = task.description || '';
    document.getElementById('update-task-status').value = task.status;
    updateModal.classList.add('active');
}

document.getElementById('btn-cancel-update').addEventListener('click', () => {
    updateModal.classList.remove('active');
});

document.getElementById('update-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('update-task-id').value;
    const title = document.getElementById('update-task-title').value;
    const description = document.getElementById('update-task-desc').value;
    const status = document.getElementById('update-task-status').value;

    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, status })
        });
        updateModal.classList.remove('active');
        fetchTasks(currentPage);
    } catch (err) {
        console.error('Error updating task', err);
    }
});

// Render logic
function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 2rem;">No tasks found. Create one to get started!</p>`;
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-desc">${task.description || '<i>No description provided.</i>'}</div>
                <div class="task-meta">
                    <span class="status-badge status-${task.status}">${task.status.replace('-', ' ')}</span>
                    <span class="task-date">${new Date(task.created_at).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="task-actions">
                <!-- SVG Edit Icon -->
                <button class="icon-btn edit-btn" onclick='openUpdateModal(${JSON.stringify(task).replace(/'/g, "&#39;")})'>
                    ✏️
                </button>
                <!-- SVG Delete Icon -->
                <button class="icon-btn delete-btn" onclick="deleteTask('${task.id}')">
                    🗑️
                </button>
            </div>
        `;
        tasksContainer.appendChild(card);
    });
}

function renderPagination(pagination) {
    paginationControls.innerHTML = '';
    if (pagination.totalPages <= 1) return;

    for (let i = 1; i <= pagination.totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === pagination.page ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => fetchTasks(i);
        paginationControls.appendChild(btn);
    }
}

// Start app
init();
