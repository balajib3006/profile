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

// --- Personal Details Section ---
async function loadPersonalDetailsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/personal-details`, { credentials: 'include' });
        const data = await response.json();

        if (data && Object.keys(data).length > 0) {
            // Populate text fields
            const fields = ['name', 'email', 'phone', 'location', 'bio', 'work_contact',
                'portfolio_url', 'linkedin_url', 'github_url', 'gitlab_url',
                'orcid_url', 'google_scholar_url'];

            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) element.value = data[field] || '';
            });

            // Handle profile picture preview
            if (data.profile_picture) {
                const previewWrapper = document.getElementById('profile-preview-wrapper');
                const imageActions = document.getElementById('image-actions');
                const fileNameDisplay = document.getElementById('file-name-display');

                if (previewWrapper) {
                    previewWrapper.innerHTML = `<img src="/uploads/profile/${data.profile_picture}" class="profile-preview" alt="Profile Picture">`;
                }
                if (imageActions) imageActions.style.display = 'flex';
                if (fileNameDisplay) fileNameDisplay.textContent = `Current: ${data.profile_picture}`;
            }
        }
    } catch (error) {
        console.error('Error loading personal details:', error);
    }
}

// Image Preview Handler
const profileInput = document.getElementById('profile_picture');
if (profileInput) {
    profileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Maximum size is 5MB.');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const previewWrapper = document.getElementById('profile-preview-wrapper');
                if (previewWrapper) {
                    previewWrapper.innerHTML = `<img src="${e.target.result}" class="profile-preview" alt="Preview">`;
                }

                const fileNameDisplay = document.getElementById('file-name-display');
                if (fileNameDisplay) fileNameDisplay.textContent = `Selected: ${file.name}`;
            }
            reader.readAsDataURL(file);
        }
    });
}

// Form Submission Handler
const editPersonalForm = document.getElementById('edit-personal-form');
if (editPersonalForm) {
    editPersonalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = editPersonalForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const formData = new FormData(editPersonalForm);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/personal-details`, {
                method: 'POST',
                credentials: 'include',
                body: formData // Send as FormData for file upload
            });

            const result = await response.json();

            if (result.success) {
                alert('Personal details saved successfully!');
                loadPersonalDetailsData(); // Reload to show updated data/image
            } else {
                alert('Error saving data: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving personal details:', error);
            alert('Error saving data. Please check console for details.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
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
