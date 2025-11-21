// API Configuration - Auto-detects local vs production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' // Use relative paths for same-origin requests in development
  : (window.API_URL || ''); // Use window.API_URL if set (production), otherwise relative

// Enhanced JavaScript with Advanced Parallax Scrolling Effects


// Parallax Scrolling Manager
class ParallaxManager {
  constructor() {
    this.parallaxElements = [];
    this.isScrolling = false;
    this.init();
  }

  init() {
    this.createParallaxBackground();
    this.createFloatingParticles();
    this.setupParallaxElements();
    this.bindEvents();
  }

  createParallaxBackground() {
    // Create parallax background container
    const parallaxBg = document.createElement('div');
    parallaxBg.className = 'parallax-bg';

    // Create multiple parallax layers
    for (let i = 1; i <= 3; i++) {
      const layer = document.createElement('div');
      layer.className = `parallax-layer parallax-layer-${i}`;
      parallaxBg.appendChild(layer);
    }

    document.body.insertBefore(parallaxBg, document.body.firstChild);
  }

  createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';

    // Create 20 floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }

    document.body.appendChild(particlesContainer);
  }

  setupParallaxElements() {
    // Define parallax elements with their scroll speeds
    this.parallaxElements = [
      { element: '.parallax-layer-1', speed: 0.2 },
      { element: '.parallax-layer-2', speed: 0.5 },
      { element: '.parallax-layer-3', speed: 0.3 },
      { element: '.hero-image', speed: 0.1 },
      { element: '.section-title', speed: 0.05 },
      { element: '.timeline-marker', speed: 0.1 },
      { element: '.skill-category', speed: 0.08 },
      { element: '.portfolio-item', speed: 0.06 }
    ];
  }

  bindEvents() {
    // Use requestAnimationFrame for smooth scrolling
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        requestAnimationFrame(() => {
          this.updateParallax();
          this.isScrolling = false;
        });
        this.isScrolling = true;
      }
    });

    // Handle resize events
    window.addEventListener('resize', Utils.debounce(() => {
      this.updateParallax();
    }, 100));
  }

  updateParallax() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    this.parallaxElements.forEach(({ element, speed }) => {
      const elements = document.querySelectorAll(element);
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;

        // Check if element is in viewport
        if (elementTop < scrollTop + windowHeight && elementTop + elementHeight > scrollTop) {
          const yPos = -(scrollTop - elementTop) * speed;
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    });

    // Update background layers
    const layers = document.querySelectorAll('.parallax-layer');
    layers.forEach((layer, index) => {
      const speed = 0.1 + (index * 0.1);
      const yPos = scrollTop * speed;
      layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
}

// Advanced Scroll Effects Manager
class ScrollEffectsManager {
  constructor() {
    this.scrollTriggers = [];
    this.init();
  }

  init() {
    this.setupScrollTriggers();
    this.bindEvents();
  }

  setupScrollTriggers() {
    // Define scroll-triggered animations
    this.scrollTriggers = [
      {
        element: '.timeline-item',
        animation: 'slideInFromRight',
        offset: 0.8,
        stagger: 200
      },
      {
        element: '.skill-category',
        animation: 'scaleIn',
        offset: 0.7,
        stagger: 150
      },
      {
        element: '.portfolio-item',
        animation: 'flipIn',
        offset: 0.6,
        stagger: 100
      },
      {
        element: '.contact-item',
        animation: 'bounceIn',
        offset: 0.8,
        stagger: 100
      }
    ];
  }

  bindEvents() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all scroll trigger elements
    this.scrollTriggers.forEach(trigger => {
      const elements = document.querySelectorAll(trigger.element);
      elements.forEach(el => {
        el.classList.add('scroll-trigger');
        observer.observe(el);
      });
    });
  }

  triggerAnimation(element) {
    const triggerData = this.scrollTriggers.find(trigger =>
      element.matches(trigger.element)
    );

    if (triggerData) {
      element.classList.add('animate-in', triggerData.animation);
    }
  }
}

// Enhanced Theme Manager
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.icon = this.themeToggle?.querySelector('i');
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    this.setTheme(savedTheme);
    this.bindEvents();
    this.setupThemeTransitions();
  }

  setTheme(theme) {
    const body = document.body;

    if (theme === 'light') {
      body.classList.add('light-mode');
      this.icon?.classList.replace('fa-moon', 'fa-sun');
    } else {
      body.classList.remove('light-mode');
      this.icon?.classList.replace('fa-sun', 'fa-moon');
    }

    localStorage.setItem('theme', theme);
    this.updateParallaxForTheme(theme);
  }

  updateParallaxForTheme(theme) {
    const layers = document.querySelectorAll('.parallax-layer');
    layers.forEach(layer => {
      if (theme === 'light') {
        layer.style.opacity = '0.03';
      } else {
        layer.style.opacity = layer.classList.contains('parallax-layer-1') ? '0.1' : '0.05';
      }
    });
  }

  setupThemeTransitions() {
    // Add smooth transitions for theme changes
    const style = document.createElement('style');
    style.textContent = `
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);
  }

  toggleTheme() {
    const isLightMode = document.body.classList.contains('light-mode');
    this.setTheme(isLightMode ? 'dark' : 'light');

    // Add ripple effect to toggle button
    this.createRippleEffect();
  }

  createRippleEffect() {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    const rect = this.themeToggle.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = rect.left + rect.width / 2 - size / 2 + 'px';
    ripple.style.top = rect.top + rect.height / 2 - size / 2 + 'px';

    document.body.appendChild(ripple);

    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 600);
  }

  bindEvents() {
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
  }
}

// Enhanced Navigation Manager
class NavigationManager {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.scrollIndicator = document.querySelector('.scroll-indicator');
    this.lastScrollY = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
    this.setupSmoothScrolling();
  }

  setupSmoothScrolling() {
    // Enhanced smooth scrolling with easing
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          this.smoothScrollTo(targetElement);
        }
      });
    });

    // Scroll indicator click
    this.scrollIndicator?.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        this.smoothScrollTo(aboutSection);
      }
    });
  }

  smoothScrollTo(element) {
    const targetPosition = element.offsetTop - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.easeInOutQuart(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }

  easeInOutQuart(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
  }

  bindEvents() {
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
    }, 16)); // 60fps
  }

  handleScroll() {
    const scrollY = window.scrollY;

    // Navbar effects
    if (this.navbar) {
      if (scrollY > 100) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll
      if (scrollY > this.lastScrollY && scrollY > 200) {
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        this.navbar.style.transform = 'translateY(0)';
      }
    }

    // Scroll indicator
    if (this.scrollIndicator) {
      if (scrollY > 300) {
        this.scrollIndicator.style.opacity = '0';
        this.scrollIndicator.style.pointerEvents = 'none';
      } else {
        this.scrollIndicator.style.opacity = '1';
        this.scrollIndicator.style.pointerEvents = 'auto';
      }
    }

    this.updateActiveNavigation();
    this.lastScrollY = scrollY;
  }

  updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        navLink?.classList.add('active');
      }
    });
  }
}

// Enhanced Animation Manager
class AnimationManager {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupSkillBarAnimations();
    this.setupCounterAnimations();
    this.setupTypewriterEffect();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
            this.triggerElementAnimation(entry.target);
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    // Observe elements for animations
    const animatedElements = document.querySelectorAll(`
      .section, .timeline-item, .skill-category, 
      .portfolio-item, .contact-item, .stat-item
    `);

    animatedElements.forEach(element => {
      element.classList.add('fade-in');
      observer.observe(element);
    });
  }

  triggerElementAnimation(element) {
    // Add specific animations based on element type
    if (element.classList.contains('timeline-item')) {
      element.style.animation = 'slideInFromRight 0.6s ease forwards';
    } else if (element.classList.contains('skill-category')) {
      element.style.animation = 'scaleIn 0.5s ease forwards';
    } else if (element.classList.contains('portfolio-item')) {
      element.style.animation = 'flipIn 0.7s ease forwards';
    }
  }

  setupSkillBarAnimations() {
    const skillBars = document.querySelectorAll('.skill-progress');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target;
          const width = progressBar.style.width;
          progressBar.style.width = '0%';

          setTimeout(() => {
            progressBar.style.width = width;
            progressBar.style.animation = 'progressFill 1.5s ease forwards';
          }, 300);

          observer.unobserve(progressBar);
        }
      });
    }, this.observerOptions);

    skillBars.forEach(bar => observer.observe(bar));
  }

  setupCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseFloat(element.textContent);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (element.textContent.includes('+')) {
        element.textContent = Math.floor(current) + '+';
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  setupTypewriterEffect() {
    const typewriterElements = document.querySelectorAll('.typewriter');

    typewriterElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      element.style.borderRight = '2px solid var(--primary-color)';

      let i = 0;
      const timer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          setTimeout(() => {
            element.style.borderRight = 'none';
          }, 1000);
        }
      }, 100);
    });
  }
}

// Enhanced Portfolio Manager
class PortfolioManager {
  constructor() {
    this.modal = document.getElementById('portfolio-modal');
    this.modalBody = document.getElementById('modal-body');
    this.closeBtn = document.querySelector('.modal-close');
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupPortfolioData();
    this.setupPortfolioHoverEffects();
  }

  setupPortfolioHoverEffects() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
      item.addEventListener('mouseenter', (e) => {
        this.createHoverEffect(e.target);
      });

      item.addEventListener('mousemove', (e) => {
        this.updateHoverEffect(e);
      });

      item.addEventListener('mouseleave', (e) => {
        this.removeHoverEffect(e.target);
      });
    });
  }

  createHoverEffect(item) {
    const rect = item.getBoundingClientRect();
    const overlay = item.querySelector('.portfolio-overlay');

    if (overlay) {
      overlay.style.background = `
        radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
        rgba(59, 130, 246, 0.9) 0%, 
        rgba(245, 158, 11, 0.9) 100%)
      `;
    }
  }

  updateHoverEffect(e) {
    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    item.style.setProperty('--mouse-x', x + '%');
    item.style.setProperty('--mouse-y', y + '%');
  }

  removeHoverEffect(item) {
    const overlay = item.querySelector('.portfolio-overlay');
    if (overlay) {
      overlay.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(245, 158, 11, 0.9))';
    }
  }

  bindEvents() {
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.style.display === 'block') {
        this.closeModal();
      }
    });
  }

  setupPortfolioData() {
    this.portfolioData = {
      'pcb-design': {
        title: 'Multilayer PCB Design',
        description: 'Advanced multilayer PCB design for aerospace applications with strict DFM compliance and high-density routing.',
        technologies: ['Altium Designer', 'DFM', 'DFA', 'DFT', 'Signal Integrity'],
        features: [
          'High-density multilayer routing',
          'Impedance controlled traces',
          'Via-in-pad technology',
          'Thermal management',
          'EMI/EMC compliance'
        ],
        images: [
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=PCB+Layout+Top',
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=PCB+Layout+Bottom',
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=3D+Render'
        ]
      },
      'antenna-design': {
        title: 'RF Antenna System',
        description: 'High-performance antenna design with comprehensive HFSS simulation and Environmental Stress Screening validation.',
        technologies: ['Ansys HFSS', 'RF Design', 'ESS Testing', 'Antenna Theory'],
        features: [
          'Multi-band operation',
          'High gain characteristics',
          'Low VSWR across frequency range',
          'Environmental stress tested',
          'Compact form factor'
        ],
        images: [
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Antenna+Design',
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=HFSS+Simulation',
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Test+Results'
        ]
      },
      'circuit-analysis': {
        title: 'Circuit Analysis & Simulation',
        description: 'Comprehensive circuit analysis using LTSpice for embedded systems with focus on power management and signal conditioning.',
        technologies: ['LTSpice', 'Circuit Analysis', 'Power Management', 'Signal Conditioning'],
        features: [
          'AC/DC analysis',
          'Transient response simulation',
          'Frequency domain analysis',
          'Monte Carlo analysis',
          'Worst-case design verification'
        ],
        images: [
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Circuit+Schematic',
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Simulation+Results',
          'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Analysis+Plots'
        ]
      }
    };
  }

  openModal(projectId) {
    const project = this.portfolioData[projectId];
    if (!project) return;

    this.modalBody.innerHTML = this.generateModalContent(project);
    this.modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Add entrance animation
    this.modal.style.animation = 'modalFadeIn 0.3s ease';
    this.modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.3s ease';
  }

  closeModal() {
    this.modal.style.animation = 'modalFadeOut 0.3s ease';
    setTimeout(() => {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  }

  generateModalContent(project) {
    return `
      <div class="modal-project">
        <h2 class="modal-title">${project.title}</h2>
        <p class="modal-description">${project.description}</p>
        
        <div class="modal-images">
          ${project.images.map(img => `
            <img src="${img}" alt="${project.title}" class="modal-image">
          `).join('')}
        </div>
        
        <div class="modal-section">
          <h3>Technologies Used</h3>
          <div class="modal-tags">
            ${project.technologies.map(tech => `
              <span class="modal-tag">${tech}</span>
            `).join('')}
          </div>
        </div>
        
        <div class="modal-section">
          <h3>Key Features</h3>
          <ul class="modal-features">
            ${project.features.map(feature => `
              <li>${feature}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// Enhanced Contact Manager
class ContactManager {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFormValidation();
  }

  setupFormValidation() {
    const inputs = this.form?.querySelectorAll('input, textarea');

    inputs?.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'text':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'This field must be at least 2 characters long';
        }
        break;
      default:
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'This field must be at least 10 characters long';
        }
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(field, isValid, errorMessage) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    if (!isValid) {
      field.style.borderColor = '#ef4444';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = errorMessage;
      errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: fadeInUp 0.3s ease;
      `;
      field.parentNode.appendChild(errorDiv);
    } else {
      field.style.borderColor = '#10b981';
    }
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  bindEvents() {
    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      const inputs = this.form.querySelectorAll('input, textarea');
      let isValid = true;
      inputs.forEach(input => {
        if (!this.validateField(input)) isValid = false;
      });

      if (!isValid) return;

      const submitBtn = this.form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      try {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_BASE_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          alert('Message sent successfully!');
          this.form.reset();
        } else {
          alert('Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}

// Utility Functions
class Utils {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

// Global Functions
function openPortfolioModal(projectId) {
  window.portfolioManager?.openModal(projectId);
}

// Data Fetching and Rendering
async function loadPortfolioData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data`);
    const data = await response.json();

    if (data) {
      renderAbout(data.about);
      renderExperience(data.experience);
      renderSkills(data.skills);
      renderProjects(data.projects);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function renderAbout(about) {
  if (!about) return;

  const summaryEl = document.getElementById('about-summary');
  if (summaryEl) summaryEl.innerHTML = about.summary || '';

  const expYearsEl = document.getElementById('stat-experience');
  if (expYearsEl) expYearsEl.textContent = about.experience_years || '1.9+';

  const heroExpEl = document.getElementById('hero-experience-years');
  if (heroExpEl) heroExpEl.textContent = about.experience_years || '1.9+';

  const projectsEl = document.getElementById('stat-projects');
  if (projectsEl) projectsEl.textContent = about.projects_completed || '50+';

  const companiesEl = document.getElementById('stat-companies');
  if (companiesEl) companiesEl.textContent = about.companies_count || '2';
}

function renderExperience(experience) {
  const container = document.getElementById('experience-list');
  if (!container || !experience) return;

  container.innerHTML = experience.map(exp => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-header">
          <h3 class="job-title">${exp.title}</h3>
          <span class="job-period">${exp.period}</span>
        </div>
        <div class="company">${exp.company}</div>
        <ul class="job-responsibilities">
          ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function renderSkills(skills) {
  const container = document.getElementById('skills-grid');
  if (!container || !skills) return;

  const categories = [...new Set(skills.map(s => s.category))];

  container.innerHTML = categories.map(cat => `
    <div class="skill-category">
      <h3 class="category-title">
        <i class="fas fa-code"></i>
        ${cat}
      </h3>
      <div class="skills-list">
        ${skills.filter(s => s.category === cat).map(skill => `
          <div class="skill-item">
            <span class="skill-name">${skill.name}</span>
            <div class="skill-bar">
              <div class="skill-progress" style="width: ${skill.level}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderProjects(projects) {
  const container = document.getElementById('portfolio-grid');
  if (!container || !projects) return;

  container.innerHTML = projects.map(project => `
    <div class="portfolio-item">
      <div class="portfolio-image">
        <img src="${project.image_url || 'https://via.placeholder.com/400x300'}" alt="${project.title}">
        <div class="portfolio-overlay">
          <div class="portfolio-actions">
            <button class="portfolio-btn" onclick="openPortfolioModal('${project.id}')">
              <i class="fas fa-eye"></i>
            </button>
            <a href="#" class="portfolio-btn" target="_blank">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="portfolio-content">
        <h3 class="portfolio-title">${project.title}</h3>
        <p class="portfolio-description">${project.description}</p>
        <div class="portfolio-tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Load dynamic data
  loadPortfolioData();

  // Initialize all managers
  window.parallaxManager = new ParallaxManager();
  window.scrollEffectsManager = new ScrollEffectsManager();
  window.themeManager = new ThemeManager();
  window.navigationManager = new NavigationManager();
  window.animationManager = new AnimationManager();
  window.portfolioManager = new PortfolioManager();
  window.contactManager = new ContactManager();

  // Add loading complete class
  document.body.classList.add('loaded');

  // Performance optimization: Lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Add custom CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromRight {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes flipIn {
      from { opacity: 0; transform: rotateY(-90deg); }
      to { opacity: 1; transform: rotateY(0); }
    }
    
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes progressFill {
      from { width: 0%; }
      to { width: var(--progress-width, 100%); }
    }
    
    @keyframes ripple {
      to { transform: scale(4); opacity: 0; }
    }
    
    @keyframes modalFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: auto;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .field-error {
      animation: fadeInUp 0.3s ease;
    }
  `;
  document.head.appendChild(style);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.title = 'Come back! - Balaji B';
  } else {
    document.title = 'Balaji B - Associate Engineer | Hardware & Antenna Design Specialist';
  }
});

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition-fast', '0.01ms');
  document.documentElement.style.setProperty('--transition-normal', '0.01ms');
  document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}

