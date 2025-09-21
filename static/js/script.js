// Enhanced Portfolio JavaScript with Mobile-First Responsive Design

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
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static isMobile() {
    return window.innerWidth <= 768;
  }

  static isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  static isDesktop() {
    return window.innerWidth > 1024;
  }

  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

// Enhanced Parallax Manager with Mobile Optimization
class ParallaxManager {
  constructor() {
    this.parallaxElements = [];
    this.isScrolling = false;
    this.isEnabled = !Utils.isMobile(); // Disable on mobile for performance
    this.init();
  }

  init() {
    if (this.isEnabled) {
      this.createParallaxBackground();
      this.createFloatingParticles();
      this.setupParallaxElements();
    }
    this.bindEvents();
  }

  createParallaxBackground() {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (!parallaxBg) {
      const newParallaxBg = document.createElement('div');
      newParallaxBg.className = 'parallax-bg';
      
      for (let i = 1; i <= 3; i++) {
        const layer = document.createElement('div');
        layer.className = `parallax-layer parallax-layer-${i}`;
        newParallaxBg.appendChild(layer);
      }
      
      document.body.insertBefore(newParallaxBg, document.body.firstChild);
    }
  }

  createFloatingParticles() {
    let particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) {
      particlesContainer = document.createElement('div');
      particlesContainer.className = 'floating-particles';
      document.body.appendChild(particlesContainer);
    }
    
    // Reduce particles on mobile
    const particleCount = Utils.isMobile() ? 10 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  setupParallaxElements() {
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
    if (!this.isEnabled) return;

    window.addEventListener('scroll', Utils.throttle(() => {
      if (!this.isScrolling) {
        requestAnimationFrame(() => {
          this.updateParallax();
          this.isScrolling = false;
        });
        this.isScrolling = true;
      }
    }, 16));

    window.addEventListener('resize', Utils.debounce(() => {
      this.isEnabled = !Utils.isMobile();
      if (this.isEnabled) {
        this.updateParallax();
      }
    }, 100));
  }

  updateParallax() {
    if (!this.isEnabled) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    this.parallaxElements.forEach(({ element, speed }) => {
      const elements = document.querySelectorAll(element);
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;
        
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

// Enhanced Mobile Navigation Manager
class MobileNavigationManager {
  constructor() {
    this.mobileToggle = null;
    this.navMenu = document.getElementById('nav-menu');
    this.navOverlay = null;
    this.mobileFabContainer = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createMobileToggle();
    this.createOverlay();
    this.createMobileFAB();
    this.bindEvents();
    console.log('Mobile Navigation Manager initialized');
  }

  createMobileFAB() {
    // Remove existing FAB container if any
    const existingFAB = document.querySelector('.mobile-fab-container');
    if (existingFAB) {
      existingFAB.remove();
    }

    // Create mobile FAB container
    this.mobileFabContainer = document.createElement('div');
    this.mobileFabContainer.className = 'mobile-fab-container';
    
    // Get the original nav-actions content
    const originalNavActions = document.querySelector('.nav-actions');
    if (originalNavActions) {
      // Clone social icons
      const socialIcons = originalNavActions.querySelector('.social-icons');
      if (socialIcons) {
        const socialLinks = socialIcons.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
          const fabButton = document.createElement('a');
          fabButton.href = link.href;
          fabButton.target = link.target;
          fabButton.className = 'fab-button';
          fabButton.setAttribute('aria-label', link.getAttribute('aria-label'));
          fabButton.innerHTML = link.innerHTML;
          this.mobileFabContainer.appendChild(fabButton);
        });
      }

      // Clone action buttons
      const actionButtons = originalNavActions.querySelectorAll('.action-btn');
      actionButtons.forEach(button => {
        const fabButton = document.createElement('button');
        fabButton.className = 'fab-button';
        fabButton.id = button.id;
        fabButton.setAttribute('aria-label', button.getAttribute('aria-label'));
        fabButton.innerHTML = button.innerHTML;
        
        // Copy event listeners for theme toggle
        if (button.id === 'theme-toggle') {
          fabButton.addEventListener('click', () => {
            window.themeManager?.toggleTheme();
          });
        }
        
        // Handle download button
        if (button.hasAttribute('download')) {
          const downloadLink = document.createElement('a');
          downloadLink.href = button.closest('a')?.href || '#';
          downloadLink.download = button.closest('a')?.download || '';
          downloadLink.className = 'fab-button';
          downloadLink.setAttribute('aria-label', button.getAttribute('aria-label'));
          downloadLink.innerHTML = button.innerHTML;
          this.mobileFabContainer.appendChild(downloadLink);
        } else {
          this.mobileFabContainer.appendChild(fabButton);
        }
      });
    }

    // Add to body
    document.body.appendChild(this.mobileFabContainer);
    console.log('Mobile FAB container created with buttons:', this.mobileFabContainer.children.length);
  }

  createMobileToggle() {
    // Remove existing toggle if any
    const existingToggle = document.getElementById('mobile-menu-toggle');
    if (existingToggle) {
      existingToggle.remove();
    }

    // Create new toggle
    this.mobileToggle = document.createElement('button');
    this.mobileToggle.id = 'mobile-menu-toggle';
    this.mobileToggle.className = 'mobile-menu-toggle';
    this.mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');
    this.mobileToggle.innerHTML = '<span></span><span></span><span></span>';
    
    // Ensure it's visible on mobile
    if (Utils.isMobile()) {
      this.mobileToggle.style.display = 'flex';
    }
    
    document.body.appendChild(this.mobileToggle);
    console.log('Mobile toggle created');
  }

  createOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.querySelector('.nav-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    this.navOverlay = document.createElement('div');
    this.navOverlay.className = 'nav-overlay';
    document.body.appendChild(this.navOverlay);
    console.log('Mobile overlay created');
  }

  bindEvents() {
    // Mobile toggle click
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
        console.log('Mobile toggle clicked');
      });
    }

    // Overlay click
    if (this.navOverlay) {
      this.navOverlay.addEventListener('click', () => {
        this.closeMenu();
        console.log('Overlay clicked');
      });
    }
    
    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (Utils.isMobile() && this.isOpen) {
          setTimeout(() => this.closeMenu(), 300); // Small delay for smooth transition
        }
      });
    });

    // Handle resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (!Utils.isMobile() && this.isOpen) {
        this.closeMenu();
      }
      
      // Show/hide toggle based on screen size
      if (this.mobileToggle) {
        if (Utils.isMobile()) {
          this.mobileToggle.style.display = 'flex';
        } else {
          this.mobileToggle.style.display = 'none';
        }
      }
    }, 100));

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });

    // Prevent body scroll when menu is open
    document.addEventListener('touchmove', (e) => {
      if (this.isOpen && !e.target.closest('.nav-menu')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  toggleMenu() {
    console.log('Toggle menu called, current state:', this.isOpen);
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    console.log('Opening mobile menu');
    this.isOpen = true;
    
    if (this.mobileToggle) {
      this.mobileToggle.classList.add('active');
    }
    
    if (this.navMenu) {
      this.navMenu.classList.add('active');
      this.navMenu.style.display = 'flex';
    }
    
    if (this.navOverlay) {
      this.navOverlay.classList.add('active');
    }
    
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
  }

  closeMenu() {
    console.log('Closing mobile menu');
    this.isOpen = false;
    
    if (this.mobileToggle) {
      this.mobileToggle.classList.remove('active');
    }
    
    if (this.navMenu) {
      this.navMenu.classList.remove('active');
      // Don't hide the menu completely, just move it off-screen
    }
    
    if (this.navOverlay) {
      this.navOverlay.classList.remove('active');
    }
    
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
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

    this.scrollIndicator?.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        this.smoothScrollTo(aboutSection);
      }
    });
  }

  smoothScrollTo(element) {
    const targetPosition = element.offsetTop - (Utils.isMobile() ? 60 : 80);
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = Utils.isMobile() ? 800 : 1000;
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
    }, 16));
  }

  handleScroll() {
    const scrollY = window.scrollY;
    
    if (this.navbar) {
      if (scrollY > 100) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll (desktop only)
      if (!Utils.isMobile()) {
        if (scrollY > this.lastScrollY && scrollY > 200) {
          this.navbar.style.transform = 'translateY(-100%)';
        } else {
          this.navbar.style.transform = 'translateY(0)';
        }
      }
    }

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
    const scrollPos = window.scrollY + (Utils.isMobile() ? 100 : 150);

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
    this.createRippleEffect();
  }

  createRippleEffect() {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 9999;
    `;
    
    const rect = this.themeToggle.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = rect.left + rect.width / 2 - size / 2 + 'px';
    ripple.style.top = rect.top + rect.height / 2 - size / 2 + 'px';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      if (document.body.contains(ripple)) {
        document.body.removeChild(ripple);
      }
    }, 600);
  }

  bindEvents() {
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
  }
}

// Enhanced Animation Manager with Intersection Observer
class AnimationManager {
  constructor() {
    this.observerOptions = {
      threshold: Utils.isMobile() ? 0.1 : 0.15,
      rootMargin: Utils.isMobile() ? '0px 0px -10px 0px' : '0px 0px -50px 0px'
    };
    this.headerObserverOptions = {
      threshold: 0.2,
      rootMargin: Utils.isMobile() ? '0px 0px -30px 0px' : '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupHeaderAnimations();
    this.setupSkillBarAnimations();
    this.setupCounterAnimations();
    this.setupTypewriterEffect();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = Utils.isMobile() ? index * 30 : index * 100;
          setTimeout(() => {
            entry.target.classList.add('visible');
            this.triggerElementAnimation(entry.target);
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    const animatedElements = document.querySelectorAll(`
      .section, .timeline-item, .skill-category, 
      .portfolio-item, .contact-item, .stat-item, .certification-item
    `);
    
    animatedElements.forEach(element => {
      element.classList.add('fade-in');
      observer.observe(element);
    });
  }

  setupHeaderAnimations() {
    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          headerObserver.unobserve(entry.target);
        }
      });
    }, this.headerObserverOptions);

    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
      headerObserver.observe(header);
    });
  }

  triggerElementAnimation(element) {
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
    const text = element.textContent;
    const target = parseFloat(text);
    const duration = Utils.isMobile() ? 1500 : 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      if (text.includes('+')) {
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
      const speed = Utils.isMobile() ? 150 : 100;
      const timer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          setTimeout(() => {
            element.style.borderRight = 'none';
          }, 1000);
        }
      }, speed);
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
    this.setupPortfolioHoverEffects();
  }

  setupPortfolioHoverEffects() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Add subtle floating animation to portfolio items
    portfolioItems.forEach((item, index) => {
      // Add staggered floating animation
      setTimeout(() => {
        item.classList.add('animate-float');
      }, index * 200);
    });

    if (Utils.isMobile()) return; // Disable hover effects on mobile

    portfolioItems.forEach(item => {
      item.addEventListener('mouseenter', (e) => {
        this.createHoverEffect(e.target);
        // Remove floating animation on hover for better interaction
        e.target.classList.remove('animate-float');
      });
      
      item.addEventListener('mousemove', (e) => {
        this.updateHoverEffect(e);
      });
      
      item.addEventListener('mouseleave', (e) => {
        this.removeHoverEffect(e.target);
        // Re-add floating animation after hover
        setTimeout(() => {
          e.target.classList.add('animate-float');
        }, 500);
      });
    });
  }

  createHoverEffect(item) {
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

  async openModal(projectId) {
    try {
      const response = await fetch(`/api/project/${projectId}`);
      const project = await response.json();
      
      this.modalBody.innerHTML = this.generateModalContent(project);
      this.modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      this.modal.style.animation = 'modalFadeIn 0.3s ease';
      this.modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.3s ease';
    } catch (error) {
      console.error('Error loading project:', error);
      this.showNotification('Failed to load project details', 'error');
    }
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
        <p class="modal-description">${project.detailed_description || project.description}</p>
        
        ${project.images && project.images.length > 0 ? `
        <div class="modal-images">
          ${project.images.map(img => `
            <img src="${img}" alt="${project.title}" class="modal-image" loading="lazy">
          `).join('')}
        </div>
        ` : ''}
        
        ${project.technologies && project.technologies.length > 0 ? `
        <div class="modal-section">
          <h3>Technologies Used</h3>
          <div class="modal-tags">
            ${project.technologies.map(tech => `
              <span class="modal-tag">${tech}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        ${project.features && project.features.length > 0 ? `
        <div class="modal-section">
          <h3>Key Features</h3>
          <ul class="modal-features">
            ${project.features.map(feature => `
              <li>${feature}</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${project.project_url || project.github_url ? `
        <div class="modal-section">
          <h3>Links</h3>
          <div class="modal-links">
            ${project.project_url ? `
              <a href="${project.project_url}" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt"></i>
                View Project
              </a>
            ` : ''}
            ${project.github_url ? `
              <a href="${project.github_url}" target="_blank" class="btn btn-secondary">
                <i class="fab fa-github"></i>
                View Code
              </a>
            ` : ''}
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `flash-message flash-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="flash-close">&times;</button>
    `;

    const container = document.querySelector('.flash-messages') || (() => {
      const newContainer = document.createElement('div');
      newContainer.className = 'flash-messages';
      document.body.appendChild(newContainer);
      return newContainer;
    })();

    container.appendChild(notification);

    const closeBtn = notification.querySelector('.flash-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
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
    field.style.borderColor = '';
  }

  bindEvents() {
    this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const inputs = this.form.querySelectorAll('input, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showNotification('Please fix the errors above', 'error');
      return;
    }

    const formData = new FormData(this.form);
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Message sent successfully!', 'success');
        this.form.reset();
        inputs.forEach(input => {
          input.style.borderColor = '';
          this.clearFieldError(input);
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `flash-message flash-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="flash-close">&times;</button>
    `;

    const container = document.querySelector('.flash-messages') || (() => {
      const newContainer = document.createElement('div');
      newContainer.className = 'flash-messages';
      document.body.appendChild(newContainer);
      return newContainer;
    })();

    container.appendChild(notification);

    const closeBtn = notification.querySelector('.flash-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// Global Functions
function openPortfolioModal(projectId) {
  window.portfolioManager?.openModal(projectId);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  window.parallaxManager = new ParallaxManager();
  window.mobileNavigationManager = new MobileNavigationManager();
  window.navigationManager = new NavigationManager();
  window.themeManager = new ThemeManager();
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

  // Handle flash message close buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('flash-close')) {
      e.target.closest('.flash-message').remove();
    }
  });

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
    
    .field-error {
      animation: fadeInUp 0.3s ease;
    }
    
    .modal-links {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
      .modal-links {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(style);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  const titleElement = document.querySelector('title');
  if (document.hidden) {
    titleElement.textContent = 'Come back! - Portfolio';
  } else {
    titleElement.textContent = titleElement.textContent.replace('Come back! - ', '');
  }
});

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition-fast', '0.01ms');
  document.documentElement.style.setProperty('--transition-normal', '0.01ms');
  document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}