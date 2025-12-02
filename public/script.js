// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' // development uses relative paths
  : (window.API_URL || ''); // production can set window.API_URL

// Define the AngularJS application module
var app = angular.module('portfolioApp', []);

// Data Service to handle API calls
app.service('DataService', ['$http', function ($http) {
  this.fetchData = function (endpoint) {
    return $http.get(`${API_BASE_URL}/api/${endpoint}`)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
      });
  };

  this.getAllData = function () {
    return this.fetchData('data');
  };

  this.getPersonalDetails = function () {
    return this.fetchData('public/personal-details');
  };
}]);

// Main Controller
app.controller('MainController', ['$scope', '$sce', '$window', 'DataService', function ($scope, $sce, $window, DataService) {
  // Initialize data objects
  $scope.personal = {};
  $scope.about = {};
  $scope.experience = [];
  $scope.skills = [];
  $scope.groupedSkills = {};
  $scope.projects = [];
  $scope.certifications = [];
  $scope.publications = [];
  $scope.badgeCert = null;

  // UI State
  $scope.mobileMenuOpen = false;
  $scope.isScrolled = false;
  $scope.modalVisible = false;
  $scope.selectedProject = {};

  // Helper to trust HTML content
  $scope.trustHtml = function (html) {
    return $sce.trustAsHtml(html);
  };

  // Mobile Menu Toggle
  $scope.toggleMobileMenu = function () {
    $scope.mobileMenuOpen = !$scope.mobileMenuOpen;
  };

  $scope.closeMobileMenu = function () {
    $scope.mobileMenuOpen = false;
  };

  // Modal functions
  $scope.openModal = function (project) {
    $scope.selectedProject = project;
    $scope.modalVisible = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  $scope.closeModal = function () {
    $scope.modalVisible = false;
    $scope.selectedProject = {};
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Fetch data on initialization
  $scope.init = function () {
    // Fetch personal details
    DataService.getPersonalDetails().then(function (data) {
      if (data) {
        $scope.personal = data;
        document.title = `${data.name} - Associate Engineer`;
      }
    });

    // Fetch all other data
    DataService.getAllData().then(function (data) {
      if (data) {
        if (data.about) $scope.about = data.about;
        if (data.experience) {
          $scope.experience = data.experience;
          if ($scope.experience.length > 0) {
            $scope.currentDesignation = $scope.experience[0].title;
            document.title = `${$scope.personal.name} - ${$scope.currentDesignation}`;
          }
        }
        if (data.skills) {
          $scope.skills = data.skills;
          $scope.groupSkills(data.skills);
        }
        if (data.projects) $scope.projects = data.projects;
        if (data.certifications) {
          $scope.certifications = data.certifications;
          $scope.badgeCert = data.certifications.find(c => c.type === 'Badge');
        }
        if (data.publications) $scope.publications = data.publications;
      }
    });
  };

  // Group skills by category
  $scope.groupSkills = function (skills) {
    $scope.groupedSkills = skills.reduce((acc, skill) => {
      (acc[skill.category] = acc[skill.category] || []).push(skill);
      return acc;
    }, {});
  };

  // Scroll Event Listener
  angular.element($window).on('scroll', function () {
    $scope.$apply(function () {
      $scope.isScrolled = $window.pageYOffset > 50;
    });
  });

  // Initialize
  $scope.init();
}]);

// Initialize UI effects (Parallax, Scroll Animations)
// These are kept as vanilla JS classes for performance and simplicity in animation handling
class ParallaxManager {
  constructor() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const layers = document.querySelectorAll('.parallax-layer');
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.2;
        layer.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }
}

class ScrollEffectsManager {
  constructor() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Add specific animation classes based on element type if needed
          if (entry.target.classList.contains('skill-progress')) {
            // Trigger skill bar animation
            const width = entry.target.style.width;
            entry.target.style.width = '0%';
            setTimeout(() => {
              entry.target.style.width = width;
            }, 100);
          }
        }
      });
    }, { threshold: 0.1 });

    // Observe sections and items
    document.querySelectorAll('section, .timeline-item, .skill-item, .portfolio-item').forEach(el => {
      el.classList.add('fade-in-up'); // Add base animation class
      observer.observe(el);
    });
  }
}

// Initialize effects after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ParallaxManager();
  new ScrollEffectsManager();
});
