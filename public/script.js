// API Configuration - Auto-detects local vs production
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '' // development uses relative paths
  : (window.API_URL || ''); // production can set window.API_URL

// --- Data Manager ---
// --- Data Manager ---
class DataManager {
  static async fetchData(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  static async getAllData() { return this.fetchData('data'); }
  static async getPersonalDetails() { return this.fetchData('public/personal-details'); }
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
    // Filter out badges from the main grid if desired, or keep them.
    // Here we display all certifications.
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

  renderHeroBadge: (certifications) => {
    if (!certifications || !Array.isArray(certifications)) return;
    const badgeCert = certifications.find(cert => cert.type === 'Badge');
    const badgeEl = document.getElementById('hero-badge');
    if (badgeEl && badgeCert && badgeCert.embed_code) {
      badgeEl.innerHTML = badgeCert.embed_code;
    }
  },

  renderSocialLinks: (data) => {
    if (!data) return;
    const socialMap = {
      'social-link-linkedin': data.linkedin_url,
      'social-link-github': data.github_url,
      'social-link-gitlab': data.gitlab_url,
      'social-link-orcid': data.orcid_url,
      'social-link-scholar': data.google_scholar_url
    };
    Object.entries(socialMap).forEach(([elemId, url]) => {
      const el = document.getElementById(elemId);
      if (el) {
        if (url) {
          el.setAttribute('href', url);
          el.style.display = 'flex';
        } else {
          el.style.display = 'none';
        }
      }
    });
  }
};

// --- Missing Class Definitions ---
class PortfolioManager {
  constructor() { console.log('PortfolioManager initialized'); }
  openModal(id) {
    const project = window.portfolioData && window.portfolioData[id];
    if (!project) return;
    const modal = document.getElementById('portfolio-modal');
    const modalBody = document.getElementById('modal-body');
    if (modal && modalBody) {
      modalBody.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image_url ? `/uploads/profile/${project.image_url}` : 'https://via.placeholder.com/600x400'}" style="width:100%; border-radius: 8px; margin: 1rem 0;">
        <p>${project.description || 'No description available.'}</p>
        <div class="portfolio-tags" style="margin-top: 1rem;">
          ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
        ${project.link ? `<a href="${project.link}" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">View Project</a>` : ''}
      `;
      modal.style.display = 'block';

      // Close handler
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
      window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
      }
    }
  }
}

class ParallaxManager { constructor() { console.log('ParallaxManager initialized'); } }
class ScrollEffectsManager { constructor() { console.log('ScrollEffectsManager initialized'); } }
class ThemeManager { constructor() { console.log('ThemeManager initialized'); } }
class NavigationManager { constructor() { console.log('NavigationManager initialized'); } }
class AnimationManager { constructor() { console.log('AnimationManager initialized'); } }
class ContactManager { constructor() { console.log('ContactManager initialized'); } }

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [personal, allData] = await Promise.all([
      DataManager.getPersonalDetails().catch(e => { console.error('Personal fetch error', e); return null; }),
      DataManager.getAllData().catch(e => { console.error('Data fetch error', e); return null; })
    ]);

    if (personal) {
      Renderer.renderPersonalDetails(personal);
      Renderer.renderSocialLinks(personal);
    }

    if (allData) {
      if (allData.about) Renderer.renderAbout(allData.about);
      if (allData.experience) Renderer.renderExperience(allData.experience);
      if (allData.skills) Renderer.renderSkills(allData.skills);
      if (allData.projects) Renderer.renderProjects(allData.projects);
      if (allData.certifications) {
        Renderer.renderCertifications(allData.certifications);
        Renderer.renderHeroBadge(allData.certifications);
      }
      if (allData.publications) Renderer.renderPublications(allData.publications);
    }
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
