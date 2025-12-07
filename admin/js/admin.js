// Vercel Web Analytics - Initialize on page load
if (typeof window !== 'undefined') {
  import('@vercel/analytics').then(({ inject }) => {
    inject();
  }).catch((err) => {
    console.warn('Failed to load Vercel Web Analytics:', err);
  });
}

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

        // Also load About data since it's now on the same page
        loadAboutData();
    } catch (error) {
        console.error('Error loading personal details:', error);
    }
}

// Image Preview Handler
const profileInput = document.getElementById('profile_picture');
const removePictureBtn = document.getElementById('remove-picture-btn');

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

                // Show remove button since we have a file selected
                const imageActions = document.getElementById('image-actions');
                if (imageActions) imageActions.style.display = 'flex';

                // Reset remove flag
                const form = document.getElementById('edit-personal-form');
                if (form) delete form.dataset.removePicture;
            }
            reader.readAsDataURL(file);
        }
    });
}

if (removePictureBtn) {
    removePictureBtn.addEventListener('click', function () {
        // Reset file input
        if (profileInput) profileInput.value = '';

        // Reset Preview to placeholder
        const previewWrapper = document.getElementById('profile-preview-wrapper');
        if (previewWrapper) {
            previewWrapper.innerHTML = `
                <div class="profile-preview-placeholder"><i class="fas fa-user"></i></div>
            `;
        }

        // Hide file name
        const fileNameDisplay = document.getElementById('file-name-display');
        if (fileNameDisplay) fileNameDisplay.textContent = '';

        // Hide remove button
        const imageActions = document.getElementById('image-actions');
        if (imageActions) imageActions.style.display = 'none';

        // Set flag on form to tell backend to remove picture
        const form = document.getElementById('edit-personal-form');
        if (form) form.dataset.removePicture = 'true';
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

        // Check if removal flag is set
        if (editPersonalForm.dataset.removePicture === 'true') {
            formData.append('remove_picture', 'true');
        }

        // Extract About data to send separately or handle in backend
        // For now, we'll send two requests: one for personal details, one for about
        // Ideally, the backend would handle a single request, but we're adapting the frontend first

        const aboutData = {
            summary: formData.get('summary'),
            experience_years: formData.get('experience_years'),
            projects_completed: formData.get('projects_completed'),
            companies_count: formData.get('companies_count')
        };

        try {
            // 1. Save Personal Details
            const personalResponse = await fetch(`${API_BASE_URL}/api/admin/personal-details`, {
                method: 'POST',
                credentials: 'include',
                body: formData // Send as FormData for file upload
            });

            const personalResult = await personalResponse.json();

            if (!personalResult.success) {
                throw new Error('Error saving personal details: ' + (personalResult.message || 'Unknown error'));
            }

            // 2. Save About Details
            const aboutResponse = await fetch(`${API_BASE_URL}/api/admin/about`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(aboutData)
            });

            const aboutResult = await aboutResponse.json();

            if (!aboutResult.success) {
                throw new Error('Error saving about details: ' + (aboutResult.message || 'Unknown error'));
            }

            alert('All details saved successfully!');
            loadPersonalDetailsData(); // Reload to show updated data/image

        } catch (error) {
            console.error('Error saving details:', error);
            alert(error.message || 'Error saving data. Please check console for details.');
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

// About form handler removed as it is merged into personal details

// --- Experience Section ---
// --- Experience Section ---
async function loadExperienceData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/experience`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('experience-list');
        // Store data globally for easier access during edit
        window.experienceData = data;

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div>
                    <strong>${item.title}</strong> at ${item.company} <br>
                    <small>${item.location || ''} | ${item.period}</small>
                </div>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="editExperience(${item.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExperience(${item.id})">Delete</button>
                </div>
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

        // Combine start and end date into period
        data.period = `${data.start_date} - ${data.end_date}`;
        delete data.start_date;
        delete data.end_date;

        const editingId = addExperienceForm.dataset.editingId;
        const url = editingId
            ? `${API_BASE_URL}/api/admin/experience/edit/${editingId}`
            : `${API_BASE_URL}/api/admin/experience/add`;

        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addExperienceForm.reset();
                delete addExperienceForm.dataset.editingId;
                addExperienceForm.querySelector('button[type="submit"]').textContent = 'Add Experience';
                loadExperienceData();
            } else alert('Error saving experience');
        } catch (error) {
            console.error('Error saving experience:', error);
        }
    });
}

function editExperience(id) {
    const item = window.experienceData.find(i => i.id === id);
    if (!item) return;

    const form = document.getElementById('add-experience-form');
    form.querySelector('[name="title"]').value = item.title;
    form.querySelector('[name="company"]').value = item.company;
    form.querySelector('[name="location"]').value = item.location;

    // Split period back to dates usually "Month Year - Month Year"
    const dates = item.period.split(' - ');
    if (dates.length > 0) form.querySelector('[name="start_date"]').value = dates[0].trim();
    if (dates.length > 1) form.querySelector('[name="end_date"]').value = dates[1].trim();

    // Map responsibilities array back to textarea
    if (Array.isArray(item.responsibilities)) {
        form.querySelector('[name="responsibilities"]').value = item.responsibilities.join('\n');
    }

    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Update Experience';
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteExperience(id) {
    console.log('deleteExperience called with id:', id);
    // if (!confirm('Are you sure you want to delete this experience?')) return;
    console.log('Starting fetch...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/experience/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);
        if (result.success) {
            loadExperienceData();
        } else {
            alert('Failed to delete: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting experience:', error);
        alert('Error deleting experience: ' + error.message);
    }
}

// --- Skills Section ---
async function loadSkillsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/skills`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('skills-list');
        window.skillsData = data;

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div>
                    <strong>${item.name}</strong> (${item.category}) - ${item.level}%
                </div>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="editSkill(${item.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSkill(${item.id})">Delete</button>
                </div>
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

        const editingId = addSkillForm.dataset.editingId;
        const url = editingId
            ? `${API_BASE_URL}/api/admin/skills/edit/${editingId}`
            : `${API_BASE_URL}/api/admin/skills/add`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addSkillForm.reset();
                delete addSkillForm.dataset.editingId;
                addSkillForm.querySelector('button[type="submit"]').textContent = 'Add Skill';
                loadSkillsData();
            } else alert('Error saving skill');
        } catch (error) {
            console.error('Error saving skill:', error);
        }
    });
}

function editSkill(id) {
    const item = window.skillsData.find(i => i.id === id);
    if (!item) return;

    const form = document.getElementById('add-skill-form');
    form.querySelector('[name="category"]').value = item.category;
    form.querySelector('[name="name"]').value = item.name;
    form.querySelector('[name="level"]').value = item.level;

    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Update Skill';
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteSkill(id) {
    console.log('deleteSkill called with id:', id);
    // if (!confirm('Are you sure you want to delete this skill?')) return;
    console.log('Starting fetch...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/skills/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);
        if (result.success) {
            loadSkillsData();
        } else {
            alert('Failed to delete: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Error deleting skill: ' + error.message);
    }
}

// --- Projects Section ---
async function loadProjectsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/projects`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('projects-list');
        window.projectsData = data;

        container.innerHTML = data.map(item => `
            <div class="item-card">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    ${item.image_url ? `<img src="/uploads/profile/${item.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : ''}
                    <div>
                        <strong>${item.title}</strong>
                        ${item.cad_file ? `<br><small><a href="/uploads/profile/${item.cad_file}" target="_blank">Download CAD</a></small>` : ''}
                    </div>
                </div>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="editProject(${item.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject(${item.id})">Delete</button>
                </div>
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

        const editingId = addProjectForm.dataset.editingId;
        const url = editingId
            ? `${API_BASE_URL}/api/admin/projects/edit/${editingId}`
            : `${API_BASE_URL}/api/admin/projects/add`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                body: formData // Send as FormData for file upload
            });
            const result = await response.json();
            if (result.success) {
                addProjectForm.reset();
                delete addProjectForm.dataset.editingId;
                addProjectForm.querySelector('button[type="submit"]').textContent = 'Add Project';
                loadProjectsData();
            } else alert('Error saving project: ' + (result.message || 'Unknown error'));
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project');
        }
    });
}

function editProject(id) {
    const item = window.projectsData.find(i => i.id === id);
    if (!item) return;

    const form = document.getElementById('add-project-form');
    form.querySelector('[name="title"]').value = item.title;
    form.querySelector('[name="description"]').value = item.description;
    form.querySelector('[name="tags"]').value = Array.isArray(item.tags) ? item.tags.join(', ') : item.tags;

    // Note: Can't populate file inputs logic-wise not supported by browsers, user must re-select if changing

    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Update Project';
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteProject(id) {
    console.log('deleteProject called with id:', id);
    // if (!confirm('Are you sure you want to delete this project?')) return;
    console.log('Starting fetch...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/projects/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);
        if (result.success) {
            loadProjectsData();
        } else {
            alert('Failed to delete: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project: ' + error.message);
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

// --- File Upload UI Helper ---
function setupFileUploads() {
    const inputs = document.querySelectorAll('.file-upload-input');
    inputs.forEach(input => {
        input.addEventListener('change', function (e) {
            const fileName = e.target.files[0]?.name;
            const label = e.target.nextElementSibling;
            const span = label.querySelector('span');

            if (fileName) {
                span.textContent = fileName;
                label.classList.add('has-file');
            } else {
                span.textContent = input.id.includes('image') ? 'Choose Image' : 'Choose CAD File';
                label.classList.remove('has-file');
            }
        });
    });
}

// Initialize file uploads on load
document.addEventListener('DOMContentLoaded', setupFileUploads);

// --- Dashboard Statistics ---
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, { credentials: 'include' });
        const stats = await response.json();

        // Update stat cards
        if (document.getElementById('projects-count')) {
            document.getElementById('projects-count').textContent = stats.projects || 0;
        }
        if (document.getElementById('experience-count')) {
            document.getElementById('experience-count').textContent = stats.experience || 0;
        }
        if (document.getElementById('skills-count')) {
            document.getElementById('skills-count').textContent = stats.skills || 0;
        }
        if (document.getElementById('certifications-count')) {
            document.getElementById('certifications-count').textContent = stats.certifications || 0;
        }
        if (document.getElementById('publications-count')) {
            document.getElementById('publications-count').textContent = stats.publications || 0;
        }
        if (document.getElementById('messages-count')) {
            document.getElementById('messages-count').textContent = stats.messages || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// --- Certifications Section ---
async function loadCertificationsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/certifications`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('certifications-list');
        window.certificationsData = data;

        if (container) {
            container.innerHTML = data.map(item => {
                const typeLabel = `<span style="display: inline-block; padding: 0.25rem 0.5rem; background: ${item.type === 'Badge' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(102, 126, 234, 0.2)'}; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">${item.type || 'Certification'}</span>`;

                let embedDisplay = '';
                if (item.embed_code) {
                    embedDisplay = `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;"><small>Has Embed Code</small></div>`;
                }

                return `
                    <div class="item-card">
                        <div>
                            ${typeLabel}<br>
                            <strong>${item.name}</strong> - ${item.issuer}<br>
                            <small>${item.date} ${item.link ? `| <a href="${item.link}" target="_blank">View</a>` : ''}</small>
                            ${embedDisplay}
                        </div>
                        <div>
                            <button class="btn btn-secondary btn-sm" onclick="editCertification(${item.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCertification(${item.id})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading certifications:', error);
    }
}

const addCertificationForm = document.getElementById('add-certification-form');
if (addCertificationForm) {
    addCertificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addCertificationForm);
        const data = Object.fromEntries(formData.entries());

        const editingId = addCertificationForm.dataset.editingId;
        const url = editingId
            ? `${API_BASE_URL}/api/admin/certifications/edit/${editingId}`
            : `${API_BASE_URL}/api/admin/certifications/add`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addCertificationForm.reset();
                delete addCertificationForm.dataset.editingId;
                addCertificationForm.querySelector('button[type="submit"]').textContent = 'Add Certification';
                loadCertificationsData();
            } else alert('Error saving certification');
        } catch (error) {
            console.error('Error adding certification:', error);
        }
    });
}

function editCertification(id) {
    const item = window.certificationsData.find(i => i.id === id);
    if (!item) return;

    const form = document.getElementById('add-certification-form');
    form.querySelector('[name="name"]').value = item.name;
    form.querySelector('[name="issuer"]').value = item.issuer;
    form.querySelector('[name="date"]').value = item.date;
    form.querySelector('[name="link"]').value = item.link || '';
    form.querySelector('[name="type"]').value = item.type;
    form.querySelector('[name="embed_code"]').value = item.embed_code || '';

    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Update Certification';
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteCertification(id) {
    console.log('deleteCertification called with id:', id);
    // if (!confirm('Are you sure you want to delete this certification?')) return;
    console.log('Starting fetch...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/certifications/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);
        if (result.success) {
            loadCertificationsData();
        } else {
            alert('Failed to delete: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting certification:', error);
        alert('Error deleting certification: ' + error.message);
    }
}

// --- Publications Section ---
async function loadPublicationsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/publications`, { credentials: 'include' });
        const data = await response.json();
        const container = document.getElementById('publications-list');
        window.publicationsData = data;

        if (container) {
            container.innerHTML = data.map(item => `
                <div class="item-card">
                    <div>
                        <strong>${item.title}</strong> - ${item.publisher}<br>
                        <small>${item.date} ${item.link ? `| <a href="${item.link}" target="_blank">View</a>` : ''}</small>
                    </div>
                    <div>
                        <button class="btn btn-secondary btn-sm" onclick="editPublication(${item.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePublication(${item.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

const addPublicationForm = document.getElementById('add-publication-form');
if (addPublicationForm) {
    addPublicationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addPublicationForm);
        const data = Object.fromEntries(formData.entries());

        const editingId = addPublicationForm.dataset.editingId;
        const url = editingId
            ? `${API_BASE_URL}/api/admin/publications/edit/${editingId}`
            : `${API_BASE_URL}/api/admin/publications/add`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                addPublicationForm.reset();
                delete addPublicationForm.dataset.editingId;
                addPublicationForm.querySelector('button[type="submit"]').textContent = 'Add Publication';
                loadPublicationsData();
            } else alert('Error saving publication');
        } catch (error) {
            console.error('Error adding publication:', error);
        }
    });
}

function editPublication(id) {
    const item = window.publicationsData.find(i => i.id === id);
    if (!item) return;

    const form = document.getElementById('add-publication-form');
    form.querySelector('[name="title"]').value = item.title;
    form.querySelector('[name="publisher"]').value = item.publisher;
    form.querySelector('[name="date"]').value = item.date;
    form.querySelector('[name="link"]').value = item.link || '';

    form.dataset.editingId = id;
    form.querySelector('button[type="submit"]').textContent = 'Update Publication';
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deletePublication(id) {
    console.log('deletePublication called with id:', id);
    // if (!confirm('Are you sure you want to delete this publication?')) return;
    console.log('Starting fetch...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/publications/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);
        if (result.success) {
            loadPublicationsData();
        } else {
            alert('Failed to delete: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting publication:', error);
        alert('Error deleting publication: ' + error.message);
    }
}

// Make functions globally accessible
window.loadPersonalDetailsData = loadPersonalDetailsData;
window.loadExperienceData = loadExperienceData;
window.editExperience = editExperience;
window.deleteExperience = deleteExperience;
window.loadSkillsData = loadSkillsData;
window.editSkill = editSkill;
window.deleteSkill = deleteSkill;
window.loadProjectsData = loadProjectsData;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.loadCertificationsData = loadCertificationsData;
window.editCertification = editCertification;
window.deleteCertification = deleteCertification;
window.loadPublicationsData = loadPublicationsData;
window.editPublication = editPublication;
window.deletePublication = deletePublication;
window.loadMessagesData = loadMessagesData;
window.loadDashboardStats = loadDashboardStats;
window.checkAuth = checkAuth;
