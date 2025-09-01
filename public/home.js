// Scroll animation controller
class ScrollAnimationController {
    constructor() {
        this.elements = {
            hero: document.getElementById('hero'),
            futu: document.getElementById('futu'),
            gora: document.getElementById('gora'),
            tagline: document.getElementById('tagline'),
            stickyHeader: document.getElementById('stickyHeader'),
            observedSections: document.querySelectorAll('.observed-section'),
            scrollIndicator: document.getElementById('scrollIndicator'),
            brandContainer: document.querySelector('.brand-container')
        };
        
        this.scrollProgress = 0;
        this.isAnimating = false;
        
        // Abort if not on the main page
        if (!this.elements.hero) return;

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
                    const card = entry.target.querySelector('.product-card, .signup-card');
                    if (card) {
                        if (entry.isIntersecting) {
                            card.classList.add('visible');
                        } else {
                            card.classList.remove('visible');
                        }
                    }
                });
            },
            { threshold: 0.3 }
        );

        this.elements.observedSections.forEach(section => {
            cardObserver.observe(section);
        });
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('home-page')) {
        new ScrollAnimationController();
    }
});
