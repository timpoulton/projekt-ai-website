// UPLINK-INSPIRED SCROLL ANIMATIONS
// Modern scroll-triggered animations and effects

class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollEffects();
        this.setupCounterAnimations();
        this.setupParallaxEffects();
        this.setupNavigationEffects();
    }

    // Intersection Observer for scroll-triggered animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Trigger counter animation if it's a counter element
                    if (entry.target.classList.contains('counter-container')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe all elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Observe stagger animation containers
        document.querySelectorAll('.stagger-animation').forEach(el => {
            observer.observe(el);
        });

        // Observe counter containers
        document.querySelectorAll('.counter-container').forEach(el => {
            observer.observe(el);
        });
    }

    // Animated counters (like Uplink's stats)
    animateCounter(container) {
        const counters = container.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        });
    }

    // Parallax effects for background elements
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Navigation scroll effects
    setupNavigationEffects() {
        const nav = document.querySelector('header');
        if (!nav) return;

        nav.classList.add('nav-enhanced');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // General scroll effects
    setupScrollEffects() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add enhanced card effects to existing cards
        document.querySelectorAll('.card, .service-card').forEach(card => {
            card.classList.add('enhanced-card');
        });

        // Add enhanced button effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('btn-enhanced');
        });
    }

    // Add animation classes to existing elements
    static addAnimationClasses() {
        // Add fade-up to section headers
        document.querySelectorAll('.section-header').forEach(header => {
            header.classList.add('animate-on-scroll', 'fade-up');
        });

        // Add stagger animation to service grids
        document.querySelectorAll('.services-grid').forEach(grid => {
            grid.classList.add('stagger-animation');
        });

        // Add fade animations to alternating content
        document.querySelectorAll('.hero-text').forEach((text, index) => {
            text.classList.add('animate-on-scroll', index % 2 === 0 ? 'fade-left' : 'fade-right');
        });

        // Add scale-in to demo containers
        document.querySelectorAll('.hero-demo').forEach(demo => {
            demo.classList.add('animate-on-scroll', 'scale-in');
        });
    }
}

// Utility function to create animated stats section
function createAnimatedStats() {
    const statsSection = document.querySelector('#stats');
    if (!statsSection) return;

    // Add counter animation to existing stats
    const statItems = statsSection.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        const h3 = item.querySelector('h3');
        if (h3) {
            const text = h3.textContent;
            const number = text.match(/\d+/);
            if (number) {
                h3.setAttribute('data-count', number[0]);
                h3.textContent = '0';
                h3.classList.add('animated-counter');
                item.classList.add('counter-container');
            }
        }
    });

    // Add animation classes
    statsSection.classList.add('animate-on-scroll', 'fade-up');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to existing elements
    ScrollAnimations.addAnimationClasses();
    
    // Create animated stats
    createAnimatedStats();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Add loading animation
    const body = document.body;
    body.style.opacity = '0';
    
    window.addEventListener('load', () => {
        body.style.transition = 'opacity 0.5s ease';
        body.style.opacity = '1';
    });
});

// Export for use in other scripts
window.ScrollAnimations = ScrollAnimations; 