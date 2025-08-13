// src/admin/script.js
class AdminPanel {
    constructor() {
      // Initialize with null values
      this.currentSection = 'dashboard';
      this.isInitialized = false;
      
      // Wait for DOM to be ready before initializing
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        // DOM is already ready
        setTimeout(() => this.init(), 0);
      }
    }
  
    async init() {
      try {
        // Check authentication first
        this.checkAuth();
        
        // Get DOM elements
        this.contentArea = document.getElementById('mainContent');
        
        if (!this.contentArea) {
          throw new Error('Main content area not found');
        }
  
        // Set up event listeners
        this.setupEventListeners();
        
        // Load the initial section
        await this.loadSection(this.currentSection);
        
        this.isInitialized = true;
        console.log('Admin panel initialized successfully');
      } catch (error) {
        console.error('Error initializing admin panel:', error);
        this.showError('Failed to initialize admin panel. Please refresh the page.');
      }
    }
  
    checkAuth() {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = '../login/login.html';
        return false;
      }
      return true;
    }
  
    setupEventListeners() {
      // Navigation links
      const navLinks = document.querySelectorAll('.nav-link');
      if (navLinks.length === 0) {
        console.warn('No navigation links found');
        return;
      }
  
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const section = e.currentTarget.getAttribute('data-section');
          if (section) {
            this.loadSection(section);
          }
        });
      });
  
      // Logout button
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          sessionStorage.removeItem('isLoggedIn');
          window.location.href = '../login/login.html';
        });
      } else {
        console.warn('Logout button not found');
      }
    }
  
    async loadSection(section) {
      if (!section) {
        console.error('No section specified');
        return;
      }
  
      console.log(`Loading section: ${section}`);
      this.currentSection = section;
  
      // Update active state
      document.querySelectorAll('.nav-link').forEach(link => {
        const linkSection = link.getAttribute('data-section');
        link.classList.toggle('active', linkSection === section);
      });
  
      try {
        // Show loading state
        if (this.contentArea) {
          this.contentArea.innerHTML = '<div class="loading">Loading...</div>';
        }
  
        // Get section content
        const content = await this.getSectionContent(section);
        
        if (this.contentArea) {
          this.contentArea.innerHTML = content;
          // Initialize section-specific functionality
          this.initSection(section);
        }
      } catch (error) {
        console.error(`Error loading section ${section}:`, error);
        if (this.contentArea) {
          this.contentArea.innerHTML = `
            <div class="error">
              <h3>Error Loading Content</h3>
              <p>Failed to load the requested section. Please try again later.</p>
              <button onclick="window.location.reload()" class="btn btn-primary">Reload Page</button>
            </div>
          `;
        }
      }
    }
  
    async getSectionContent(section) {
      // In a real app, you would fetch this from a server
      const sections = {
        dashboard: this.getDashboardContent(),
        profile: this.getProfileContent(),
        // Add more sections as needed
      };
  
      return sections[section] || this.getNotFoundContent();
    }
  
    getDashboardContent() {
      return `
        <div class="dashboard">
          <h2>Dashboard Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <i class="fas fa-eye"></i>
              <h3>Total Views</h3>
              <p class="stat-number">1,234</p>
            </div>
            <div class="stat-card">
              <i class="fas fa-envelope"></i>
              <h3>Messages</h3>
              <p class="stat-number">42</p>
            </div>
            <div class="stat-card">
              <i class="fas fa-project-diagram"></i>
              <h3>Projects</h3>
              <p class="stat-number">15</p>
            </div>
          </div>
        </div>
      `;
    }
  
    getProfileContent() {
      return `
        <div class="profile-section">
          <h2>Profile Information</h2>
          <form id="profileForm" class="admin-form">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" required>
            </div>
            <div class="form-group">
              <label for="title">Professional Title</label>
              <input type="text" id="title" name="title" required>
            </div>
            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea id="bio" name="bio" rows="5" required></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Save Changes</button>
              <button type="reset" class="btn btn-secondary">Reset</button>
            </div>
          </form>
        </div>
      `;
    }
  
    getNotFoundContent() {
      return `
        <div class="not-found">
          <h2>Section Not Found</h2>
          <p>The requested section could not be found.</p>
          <button onclick="window.adminPanel.loadSection('dashboard')" class="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
      `;
    }
  
    initSection(section) {
      if (section === 'profile') {
        this.initProfileForm();
      }
      // Add more section initializations as needed
    }
  
    initProfileForm() {
      const form = document.getElementById('profileForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.showNotification('Profile updated successfully!', 'success');
        });
      }
    }
  
    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            notification.remove();
          }, 300);
        }, 3000);
      }, 100);
    }
  
    showError(message) {
      console.error(message);
      this.showNotification(message, 'error');
    }
  }
  
  // Initialize admin panel
  document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
  });