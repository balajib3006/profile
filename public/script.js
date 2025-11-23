// API Configuration - Auto-detects local vs production
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '' // development uses relative paths
  : (window.API_URL || ''); // production can set window.API_URL

// --- Data Manager ---
class DataManager {
  static async fetchData(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  static async getAdminPanel() { return this.fetchData('admin-panel'); }
  static async getPersonalDetails() { return this.fetchData('personal-details'); }
  static async getAbout() { return this.fetchData('about'); }
  static async getExperience() { return this.fetchData('experience'); }
  static async getSkills() { return this.fetchData('skills'); }
  static async getProjects() { return this.fetchData('projects'); }
  static async getCertifications() { return this.fetchData('certifications'); }
  static async getPublications() { return this.fetchData('publications'); }
}

// --- Render Functions ---
const Renderer = {
  renderPersonalDetails: (data) => {
    if (!data) return;
    if (data.name) {
      const navLogo = document.getElementById('nav-logo-name');
      if (navLogo) navLogo.textContent = data.name;
      const heroName = document.getElementById('hero-name');
      if (heroName) heroName.textContent = data.name;
      const footerName = document.getElementById('footer-name');
      if (footerName) footerName.textContent = data.name;
      document.title = `${data.name} - Associate Engineer`;
    }
    if (data.bio) {
      const heroBio = document.getElementById('hero-bio');
      if (heroBio) heroBio.textContent = data.bio;
    }
    if (data.profile_picture) {
      const imgPath = `/uploads/profile/${data.profile_picture}`;
      const heroPic = document.getElementById('hero-profile-picture');
      if (heroPic) heroPic.src = imgPath;
    }
  },

  renderAbout: (data) => {
    if (!data) return;
    if (data.summary) {
      const aboutSummary = document.getElementById('about-summary');
      if (aboutSummary) aboutSummary.innerHTML = `<p>${data.summary}</p>`;
    }
    if (data.experience_years) {
      const statExp = document.getElementById('stat-experience');
      if (statExp) statExp.textContent = data.experience_years;
      const heroExp = document.getElementById('hero-experience-years');
      if (heroExp) heroExp.textContent = data.experience_years;
    }
    if (data.projects_completed) {
      const statProj = document.getElementById('stat-projects');
      if (statProj) statProj.textContent = data.projects_completed;
    }
    if (data.companies_count) {
      const statComp = document.getElementById('stat-companies');
      if (statComp) statComp.textContent = data.companies_count;
    }
  },

  renderExperience: (data) => {
    const container = document.getElementById('experience-list');
    if (!data || !container) return;
    container.innerHTML = data.map((item, index) => `
      <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3 class="job-title">${item.title}</h3>
            <span class="job-period">${item.period}</span>
          </div>
          <div class="company">
            ${item.company}
            ${item.location ? `<span class="location-tag"><i class="fas fa-map-marker-alt"></i> ${item.location}</span>` : ''}
          </div>
          <ul class="job-responsibilities">
            ${item.responsibilities.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  },

  renderSkills: (data) => {
    const container = document.getElementById('skills-grid');
    if (!data || !container) return;
    const grouped = data.reduce((acc, skill) => {
      (acc[skill.category] = acc[skill.category] || []).push(skill);
      return acc;
    }, {});
    container.innerHTML = Object.entries(grouped).map(([cat, skills]) => `
      <div class="skill-category">
        <h3 class="skill-category-title">${cat}</h3>
        <div class="skill-list">
          ${skills.map(s => `
            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">${s.name}</span>
                <span class="skill-percentage">${s.level}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: ${s.level}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  renderProjects: (data) => {
    const container = document.getElementById('portfolio-grid');
    if (!data || !container) return;
    window.portfolioData = data.reduce((acc, proj) => { acc[proj.id] = proj; return acc; }, {});
    container.innerHTML = data.map(project => `
      <div class="portfolio-item" onclick="portfolioManager.openModal(${project.id})">
        <div class="portfolio-image">
          <img src="${project.image_url ? `/uploads/profile/${project.image_url}` : 'https://via.placeholder.com/600x400'}" alt="${project.title}">
          <div class="portfolio-overlay"><i class="fas fa-plus"></i></div>
        </div>
        <div class="portfolio-info">
          <h3>${project.title}</h3>
          <div class="portfolio-tags">
            ${project.tags.slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  },

  renderCertifications: (data) => {
    const container = document.getElementById('certifications-grid');
    if (!data || !container) return;
    container.innerHTML = data.map(cert => `
      <div class="certification-card">
        <div class="cert-header">
          <div>
            <div class="cert-title">${cert.name}</div>
            <div class="cert-issuer">${cert.issuer}</div>
          </div>
          ${cert.type === 'Badge' ? '<i class="fas fa-certificate" style="color: var(--accent-color);"></i>' : ''}
        </div>
        <div class="cert-date">${cert.date}</div>
        ${cert.embed_code ? `<div class="cert-badge">${cert.embed_code}</div>` : ''}
        ${cert.link ? `<a href="${cert.link}" target="_blank" class="text-sm text-primary hover:underline">View Certificate <i class="fas fa-external-link-alt"></i></a>` : ''}
      </div>
    `).join('');
  },

  renderPublications: (data) => {
    const container = document.getElementById('publications-list');
    if (!data || !container) return;
    container.innerHTML = data.map(pub => `
      <div class="publication-item">
        <div class="pub-title">${pub.title}</div>
        <div class="pub-publisher">${pub.publisher}</div>
        <div class="pub-date"><i class="far fa-calendar-alt"></i> ${pub.date}</div>
        ${pub.link ? `<a href="${pub.link}" target="_blank" class="pub-link">Read Paper <i class="fas fa-arrow-right"></i></a>` : ''}
      </div>
    `).join('');
  },

  // Render admin panel data: dynamic social links only
  renderAdminPanel: (data) => {
    if (!data) return;
    const socialMap = {
      'social-link-linkedin': 'linkedin',
      'social-link-github': 'github',
      'social-link-gitlab': 'gitlab',
      'social-link-orcid': 'orcid',
      'social-link-scholar': 'scholar'
    };
    Object.entries(socialMap).forEach(([elemId, key]) => {
      const el = document.getElementById(elemId);
      if (el) {
        const url = data.socialLinks && data.socialLinks[key];
        if (url) {
          el.setAttribute('href', url);
        } else {
          el.style.display = 'none';
        }
      }
    });
  },

  // Render hero badge from certifications data
  renderHeroBadge: (certifications) => {
    if (!certifications || !Array.isArray(certifications)) return;
    const badgeCert = certifications.find(cert => cert.type === 'Badge');
    const badgeEl = document.getElementById('hero-badge');
    if (badgeEl && badgeCert && badgeCert.embed_code) {
      badgeEl.innerHTML = badgeCert.embed_code;
    }
  }
};

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [personal, about, experience, skills, projects, certifications, publications, adminPanel] = await Promise.all([
      DataManager.getPersonalDetails().catch(e => { console.error('Personal fetch error', e); return null; }),
      DataManager.getAbout().catch(e => { console.error('About fetch error', e); return null; }),
      DataManager.getExperience().catch(e => { console.error('Experience fetch error', e); return []; }),
      DataManager.getSkills().catch(e => { console.error('Skills fetch error', e); return []; }),
      DataManager.getProjects().catch(e => { console.error('Projects fetch error', e); return []; }),
      DataManager.getCertifications().catch(e => { console.error('Certifications fetch error', e); return []; }),
      DataManager.getPublications().catch(e => { console.error('Publications fetch error', e); return []; }),
      DataManager.getAdminPanel().catch(e => { console.error('Admin panel fetch error', e); return {}; })
    ]);

    if (personal) Renderer.renderPersonalDetails(personal);
    if (about) Renderer.renderAbout(about);
    if (experience) Renderer.renderExperience(experience);
    if (skills) Renderer.renderSkills(skills);
    if (projects) Renderer.renderProjects(projects);
    if (certifications) {
      Renderer.renderCertifications(certifications);
      Renderer.renderHeroBadge(certifications); // Extract and render badge in hero section
    }
    if (publications) Renderer.renderPublications(publications);
    Renderer.renderAdminPanel(adminPanel);
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    // Initialize UI managers (always run)
    window.portfolioManager = new PortfolioManager();
    new ParallaxManager();
    new ScrollEffectsManager();
    new ThemeManager();
    new NavigationManager();
    new AnimationManager();
    new ContactManager();
  }
});
