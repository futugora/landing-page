// Scroll animation controller
class ScrollAnimationController {
    constructor() {
        this.elements = {
            hero: document.getElementById('hero'),
            futu: document.getElementById('futu'),
            gora: document.getElementById('gora'),
            tagline: document.getElementById('tagline'),
            stickyHeader: document.getElementById('stickyHeader'),
            productCard: document.getElementById('productCard'),
            signupCard: document.getElementById('signupCard'),
            scrollIndicator: document.getElementById('scrollIndicator'),
            brandContainer: document.querySelector('.brand-container')
        };
        
        this.scrollProgress = 0;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.onScroll(); // Initial check
    }

    bindEvents() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Intersection Observer for product card and signup card
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (this.elements.productCard) {
            cardObserver.observe(this.elements.productCard);
        }
        
        if (this.elements.signupCard) {
            cardObserver.observe(this.elements.signupCard);
        }
    }

    onScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate scroll progress (0 to 1)
        this.scrollProgress = scrollY / (documentHeight - windowHeight);
        
        // Hero section animations
        this.animateHeroSection(scrollY, windowHeight);
        
        // Sticky header
        this.animateStickyHeader(scrollY, windowHeight);
        
        // Scroll indicator
        this.animateScrollIndicator(scrollY, windowHeight);
    }

    animateHeroSection(scrollY, windowHeight) {
        // Phase 1: Split animation (0 to 0.5 viewport height)
        const splitThreshold = windowHeight * 0.5;
        const splitProgress = Math.min(scrollY / splitThreshold, 1);
        
        if (splitProgress > 0.1) {
            this.elements.brandContainer.classList.add('split');
            
            // Animate FUTU to the left
            const futuTransform = `translateX(-${splitProgress * 50}vw)`;
            this.elements.futu.style.transform = futuTransform;
            
            // Animate GORA to the right  
            const goraTransform = `translateX(${splitProgress * 50}vw)`;
            this.elements.gora.style.transform = goraTransform;
            
            // Fade in tagline
            const taglineOpacity = Math.min(splitProgress * 2, 1);
            this.elements.tagline.style.opacity = taglineOpacity;
            this.elements.tagline.style.transform = `translateY(${30 - (splitProgress * 30)}px)`;
            
            if (taglineOpacity > 0.5) {
                this.elements.tagline.classList.add('visible');
            }
        } else {
            this.elements.brandContainer.classList.remove('split');
            this.elements.futu.style.transform = 'translateX(0)';
            this.elements.gora.style.transform = 'translateX(0)';
            this.elements.tagline.style.opacity = 0;
            this.elements.tagline.style.transform = 'translateY(30px)';
            this.elements.tagline.classList.remove('visible');
        }
    }

    animateStickyHeader(scrollY, windowHeight) {
        // Show sticky header when scrolled past hero section
        const heroHeight = this.elements.hero.offsetHeight;
        const showHeaderThreshold = heroHeight * 0.8;
        
        if (scrollY > showHeaderThreshold) {
            this.elements.stickyHeader.classList.add('visible');
        } else {
            this.elements.stickyHeader.classList.remove('visible');
        }
    }

    animateScrollIndicator(scrollY, windowHeight) {
        // Hide scroll indicator when user starts scrolling
        const hideThreshold = windowHeight * 0.1;
        
        if (scrollY > hideThreshold) {
            this.elements.scrollIndicator.classList.add('hidden');
        } else {
            this.elements.scrollIndicator.classList.remove('hidden');
        }
    }
}

// ConvertKit Form Handler
class ConvertKitFormHandler {
    constructor() {
        this.form = document.getElementById('ck-form');
        this.status = document.getElementById('form-status');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const email = formData.get('email_address');
        
        if (!this.validateEmail(email)) {
            this.showStatus('Please enter a valid email address.', 'error');
            return;
        }
        
        this.showStatus('Signing you up...', '');
        
        try {
            // Replace YOUR_FORM_ID with your actual ConvertKit form ID
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showStatus('🎉 Thanks! You\'ll be the first to know when we launch something amazing.', 'success');
                this.form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showStatus('Oops! Something went wrong. Please try again.', 'error');
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showStatus(message, type) {
        if (this.status) {
            this.status.textContent = message;
            this.status.className = `form-status ${type}`;
            
            if (type === 'success') {
                setTimeout(() => {
                    this.status.textContent = '';
                    this.status.className = 'form-status';
                }, 5000);
            }
        }
    }
}

// Initialize smooth scrolling and animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll animation controller
    const scrollController = new ScrollAnimationController();
    
    // Add loading animation
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Smooth scroll for internal links
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
    
    // Initialize ConvertKit form handler
    new ConvertKitFormHandler();
});

// Performance optimization: Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    
    // Override CSS transitions
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}
