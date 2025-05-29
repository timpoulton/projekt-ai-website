/**
 * Apple Watch Style Animations
 * Inspired by apple.com/watch
 */

class AppleAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallax();
    this.setupNavigation();
    this.setupCounters();
    this.setupSmoothScrolling();
    this.setupLoadingAnimations();
    
    console.log('🍎 Apple-style animations initialized');
  }

  // Intersection Observer for scroll animations
  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, options);

    // Observe all animation elements
    this.observeElements();
  }

  observeElements() {
    const animationSelectors = [
      '.fade-in-up',
      '.fade-in-left',
      '.fade-in-right',
      '.scale-in',
      '.stagger-container',
      '.apple-card',
      '.feature-item'
    ];

    animationSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        this.observer.observe(el);
      });
    });
  }

  animateElement(element) {
    // Add animate class for CSS transitions
    element.classList.add('animate');

    // Handle stagger animations
    if (element.classList.contains('stagger-container')) {
      this.animateStagger(element);
    }

    // Handle counter animations
    if (element.querySelector('.counter')) {
      this.animateCounters(element);
    }

    // Unobserve after animation
    this.observer.unobserve(element);
  }

  // Stagger animation for multiple elements
  animateStagger(container) {
    const items = container.querySelectorAll('.stagger-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate');
      }, index * 100);
    });
  }

  // Counter animations
  setupCounters() {
    this.counters = document.querySelectorAll('.counter[data-count]');
  }

  animateCounters(container) {
    const counters = container.querySelectorAll('.counter[data-count]');
    counters.forEach(counter => this.animateCounter(counter));
  }

  animateCounter(counter) {
    const target = parseInt(counter.dataset.count);
    const duration = 2000;
    const start = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (target - startValue) * easeOutQuart);
      
      counter.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(animate);
  }

  // Parallax effects
  setupParallax() {
    this.parallaxElements = document.querySelectorAll('.parallax-bg');
    
    if (this.parallaxElements.length > 0) {
      window.addEventListener('scroll', this.handleParallax.bind(this));
    }
  }

  handleParallax() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    this.parallaxElements.forEach(element => {
      element.style.transform = `translateY(${rate}px)`;
    });
  }

  // Navigation effects
  setupNavigation() {
    this.nav = document.querySelector('.nav-apple');
    if (!this.nav) return;

    window.addEventListener('scroll', this.handleNavigation.bind(this));
  }

  handleNavigation() {
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
  }

  // Smooth scrolling for anchor links
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Loading animations
  setupLoadingAnimations() {
    // Add loading shimmer to images
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.classList.add('loading-shimmer');
        img.addEventListener('load', () => {
          img.classList.remove('loading-shimmer');
        });
      }
    });
  }

  // Button ripple effect
  addRippleEffect() {
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
      button.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation CSS
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Magnetic hover effect for cards
  setupMagneticEffect() {
    document.querySelectorAll('.apple-card, .feature-item').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        card.style.transform = `
          perspective(1000px)
          rotateX(${deltaY * -5}deg)
          rotateY(${deltaX * 5}deg)
          translateZ(10px)
        `;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Text reveal animation
  setupTextReveal() {
    document.querySelectorAll('.text-reveal').forEach(element => {
      const text = element.textContent;
      element.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.cssText = `
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease ${index * 0.05}s;
        `;
        element.appendChild(span);
      });
      
      this.observer.observe(element);
      
      element.addEventListener('animate', () => {
        element.querySelectorAll('span').forEach(span => {
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
        });
      });
    });
  }

  // Performance optimization
  optimizePerformance() {
    // Throttle scroll events
    let ticking = false;
    
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleParallax();
          this.handleNavigation();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.removeEventListener('scroll', this.handleParallax);
    window.removeEventListener('scroll', this.handleNavigation);
    window.addEventListener('scroll', throttledScroll, { passive: true });
  }

  // Initialize all advanced features
  initAdvancedFeatures() {
    this.addRippleEffect();
    this.setupMagneticEffect();
    this.setupTextReveal();
    this.optimizePerformance();
  }

  // Destroy instance and clean up
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    window.removeEventListener('scroll', this.handleParallax);
    window.removeEventListener('scroll', this.handleNavigation);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.appleAnimations = new AppleAnimations();
  
  // Initialize advanced features after a short delay
  setTimeout(() => {
    window.appleAnimations.initAdvancedFeatures();
  }, 100);
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when page is hidden
    document.body.style.animationPlayState = 'paused';
  } else {
    // Resume animations when page is visible
    document.body.style.animationPlayState = 'running';
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppleAnimations;
} 