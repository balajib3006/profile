// API Configuration - Auto-detects local vs production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '' // Use relative paths for same-origin requests in development
    : (window.API_URL || ''); // Use window.API_URL if set (production), otherwise relative

// Admin Panel Logic


// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check`, { credentials: 'include' });
        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/admin/login.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login.html';
    }
}

// Login Form Handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        errorMsg.style.display = 'none';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (data.success) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard.html';
                    }, 500);
                } else {
                    errorMsg.textContent = data.message || 'Invalid credentials';
                    errorMsg.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                errorMsg.textContent = `Server Error: ${response.status}`;
                errorMsg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMsg.textContent = 'Connection error. Please try again.';
            errorMsg.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Logout Handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await fetch(`${API_BASE_URL}/api/auth/logout`, { credentials: 'include' });
                window.location.href = '/admin/login.html';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/admin/login.html';
            }
        }
    });
}

// --- About Section ---
async function loadAboutData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/about`, { credentials: 'include' });
        const data = await response.json();

        if (data) {
            document.getElementById('summary').value = data.summary || '';
            document.getElementById('experience_years').value = data.experience_years || '';
            document.getElementById('projects_completed').value = data.projects_completed || '';
            document.getElementById('companies_count').value = data.companies_count || '';
        }
    } catch (error) {
        console.error('Error loading about data:', error);
    }
}

const editAboutForm = document.getElementById('edit-about-form');
if (editAboutForm) {
    editAboutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editAboutForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/about`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) alert('Saved successfully!');
            else alert('Error saving data');
        } catch (error) {
            console.error('Error saving about data:', error);
        }
    });
}

// --- Experience Section ---
async function loadExperienceData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/experience`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('experience-list');

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div>
                    <strong>${item.title}</strong> at ${item.company} (${item.period})
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteExperience(${item.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

const addExperienceForm = document.getElementById('add-experience-form');
if (addExperienceForm) {
    addExperienceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addExperienceForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/experience/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addExperienceForm.reset();
                loadExperienceData();
            } else alert('Error adding experience');
        } catch (error) {
            console.error('Error adding experience:', error);
        }
    });
}

async function deleteExperience(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`/api/admin/experience/delete/${id}`, { method: 'DELETE' });
        loadExperienceData();
    } catch (error) {
        console.error('Error deleting experience:', error);
    }
}

// --- Skills Section ---
async function loadSkillsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/skills`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('skills-list');

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div>
                    <strong>${item.name}</strong> (${item.category}) - ${item.level}%
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteSkill(${item.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

const addSkillForm = document.getElementById('add-skill-form');
if (addSkillForm) {
    addSkillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addSkillForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/skills/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addSkillForm.reset();
                loadSkillsData();
            } else alert('Error adding skill');
        } catch (error) {
            console.error('Error adding skill:', error);
        }
    });
}

async function deleteSkill(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`/api/admin/skills/delete/${id}`, { method: 'DELETE' });
        loadSkillsData();
    } catch (error) {
        console.error('Error deleting skill:', error);
    }
}

// --- Projects Section ---
async function loadProjectsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/projects`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('projects-list');

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div>
                    <strong>${item.title}</strong>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteProject(${item.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

const addProjectForm = document.getElementById('add-project-form');
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addProjectForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/projects/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addProjectForm.reset();
                loadProjectsData();
            } else alert('Error adding project');
        } catch (error) {
            console.error('Error adding project:', error);
        }
    });
}

async function deleteProject(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`/api/admin/projects/delete/${id}`, { method: 'DELETE' });
        loadProjectsData();
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}

// --- Messages Section ---
async function loadMessagesData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/messages`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('messages-list');

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div>
                    <strong>${item.name}</strong> (${item.email})<br>
                    <small>${item.message}</small>
                </div>
                <small style="color: var(--text-muted)">${new Date(item.created_at).toLocaleString()}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}
