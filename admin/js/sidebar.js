/**
 * Admin Sidebar Logic
 * Handles dynamic rendering, active state, and mobile toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    setupMobileToggle();
    highlightActiveLink();
});

function renderSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;

    const sidebarContent = `
        <div class="sidebar-header">
            <i class="fas fa-bolt" style="color: var(--primary-color); font-size: 1.5rem;"></i>
            <h2>Admin</h2>
            <button id="close-sidebar-btn" class="btn-icon mobile-only">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <ul class="nav-menu">
            <li class="nav-item">
                <a href="/admin/dashboard.html">
                    <i class="fas fa-home"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/edit-personal.html">
                    <i class="fas fa-id-card"></i> Personal & About
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/edit-experience.html">
                    <i class="fas fa-briefcase"></i> Experience
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/edit-skills.html">
                    <i class="fas fa-code"></i> Skills
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/edit-projects.html">
                    <i class="fas fa-project-diagram"></i> Projects
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/edit-certifications.html">
                    <i class="fas fa-certificate"></i> Certifications
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/edit-publications.html">
                    <i class="fas fa-book"></i> Publications
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/messages.html">
                    <i class="fas fa-envelope"></i> Messages
                </a>
            </li>
            <li class="nav-item">
                <a href="/admin/settings.html">
                    <i class="fas fa-cog"></i> Settings
                </a>
            </li>
        </ul>

        <div class="sidebar-footer">
            <button id="logout-btn" class="btn btn-danger btn-sm" style="width: 100%; justify-content: center;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;

    sidebar.innerHTML = sidebarContent;

    // Re-attach logout listener since we just created the button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    // Use API_BASE_URL from admin.js if available, otherwise relative
                    const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '';
                    await fetch(`${baseUrl}/api/auth/logout`, { credentials: 'include' });
                    window.location.href = '/admin/login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/admin/login.html';
                }
            }
        });
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath === href || (currentPath === '/admin/' && href === '/admin/dashboard.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupMobileToggle() {
    // Inject hamburger menu into top bar if it doesn't exist
    const topBar = document.querySelector('.top-bar');
    if (topBar && !document.getElementById('menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'menu-toggle';
        toggleBtn.className = 'btn-icon mobile-only';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.marginRight = '1rem';
        toggleBtn.style.background = 'transparent';
        toggleBtn.style.border = 'none';
        toggleBtn.style.color = 'var(--text-primary)';
        toggleBtn.style.fontSize = '1.2rem';
        toggleBtn.style.cursor = 'pointer';

        topBar.insertBefore(toggleBtn, topBar.firstChild);
    }

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.getElementById('close-sidebar-btn');

    // Create backdrop
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }

    function openSidebar() {
        sidebar.classList.add('open');
        backdrop.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeSidebar);
    }

    // Close sidebar on link click (mobile)
    const navLinks = document.querySelectorAll('.nav-item a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });
}
