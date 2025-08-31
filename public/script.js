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

// Contact Form Handler
class ContactFormHandler {
    constructor() {
        this.subjectSelect = document.getElementById('subject-select');
        this.subjectText = document.getElementById('subject-text');
        this.form = this.subjectSelect ? this.subjectSelect.closest('form') : null;
        this.init();
    }

    init() {
        if (!this.subjectSelect || !this.subjectText || !this.form) return;
        
        this.subjectSelect.addEventListener('change', this.handleSubjectChange.bind(this));
        this.handleURLParameters();
        this.form.addEventListener('submit', this.prepareSubmission.bind(this));
    }

    handleSubjectChange() {
        if (this.subjectSelect.value === 'Other') {
            this.subjectSelect.style.display = 'none';
            this.subjectSelect.removeAttribute('required');
            this.subjectText.style.display = 'block';
            this.subjectText.setAttribute('required', '');
            this.subjectText.focus();
        }
    }

    handleURLParameters() {
        const params = new URLSearchParams(window.location.search);
        const subject = params.get('subject');
        
        if (subject) {
            const subjectLower = subject.toLowerCase();
            const option = Array.from(this.subjectSelect.options).find(opt => opt.value.toLowerCase() === subjectLower);
            
            if (option) {
                this.subjectSelect.value = option.value;
            }
        }
    }
    
    prepareSubmission() {
        if (this.subjectSelect.value !== 'Other') {
            // If "Other" is not selected, ensure the text input is not part of the submission
            this.subjectText.removeAttribute('name');
        } else {
            // If "Other" is selected, rename the text input to be the main subject
            this.subjectSelect.removeAttribute('name');
            this.subjectText.setAttribute('name', 'subject');
        }
    }
}

// Initialize smooth scrolling and animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll animation controller only on the main page
    if (document.body.classList.contains('home-page')) {
        new ScrollAnimationController();
    }
    
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
    
    // Initialize Contact Form handler
    new ContactFormHandler();

    // Initialize KeyBard Product Page Demo if on the correct page
    if (document.body.classList.contains('product-page-body')) {
        new KeyBardDemoHandler();
    }
});

// KeyBard Product Page Interactive Demo Handler
class KeyBardDemoHandler {
    constructor() {
        this.elements = {
            icon: document.getElementById('keybard-demo-icon'),
            mainMenu: document.getElementById('keybard-main-menu'),
            demoPlugin: document.getElementById('demo-plugin'),
            presetsMenu: document.getElementById('presets-submenu'),
            liveClock: document.getElementById('live-clock'),
            pianoKeys: document.querySelectorAll('.piano-key')
        };
        
        this.audioContext = null;
        this.oscillators = {}; // Store oscillators by note
        this.submenuTimeout = null;
        this.currentWaveform = 'sine'; // Default waveform
        this.noteFrequencies = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
            'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
            'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
        };

        this.init();
    }

    init() {
        // The check in the DOMContentLoaded ensures elements exist
        this.initClock();
        this.bindMenuEvents();
        this.bindPianoEvents();
        this.bindPresetEvents();
        this.bindKeyboardEvents(); // Add this line

        // Start with menus open for the demo
        this.elements.mainMenu.classList.add('visible');
        this.elements.presetsMenu.classList.add('visible');
    }

    initClock() {
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            this.elements.liveClock.textContent = now.toLocaleDateString('en-US', options).replace(',', '');
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    bindMenuEvents() {
        this.elements.icon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu(this.elements.mainMenu);
        });

        this.elements.demoPlugin.addEventListener('mouseover', () => {
            clearTimeout(this.submenuTimeout);
            if (this.elements.mainMenu.classList.contains('visible')) {
                this.elements.presetsMenu.classList.add('visible');
            }
        });

        const hideSubmenu = () => {
            this.submenuTimeout = setTimeout(() => {
                this.elements.presetsMenu.classList.remove('visible');
            }, 200); // 200ms delay
        };

        this.elements.demoPlugin.addEventListener('mouseout', hideSubmenu);
        this.elements.presetsMenu.addEventListener('mouseover', () => clearTimeout(this.submenuTimeout));
        this.elements.presetsMenu.addEventListener('mouseout', hideSubmenu);

        document.addEventListener('click', () => {
            this.elements.mainMenu.classList.remove('visible');
            this.elements.presetsMenu.classList.remove('visible');
        });

        // Prevent menu clicks from closing the menu
        this.elements.mainMenu.addEventListener('click', e => e.stopPropagation());
        this.elements.presetsMenu.addEventListener('click', e => e.stopPropagation());
    }

    bindKeyboardEvents() {
        this.keyMap = {};
        this.elements.pianoKeys.forEach(key => {
            const keyName = key.dataset.key;
            if (keyName) {
                this.keyMap[keyName] = key;
            }
        });

        document.addEventListener('keydown', (e) => {
            const keyName = e.key.toLowerCase();
            const keyElement = this.keyMap[keyName];
            if (keyElement && !keyElement.classList.contains('playing')) {
                this.playNote(keyElement);
            }
        });

        document.addEventListener('keyup', (e) => {
            const keyName = e.key.toLowerCase();
            const keyElement = this.keyMap[keyName];
            if (keyElement) {
                this.stopNote(keyElement);
            }
        });
    }

    bindPresetEvents() {
        const presets = this.elements.presetsMenu.querySelectorAll('.menu-item');
        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                // Update visual selection
                presets.forEach(p => p.classList.remove('selected'));
                preset.classList.add('selected');

                // Change waveform
                const newWaveform = preset.textContent.toLowerCase();
                this.currentWaveform = newWaveform;

                // Close menus after selection
                this.elements.mainMenu.classList.remove('visible');
                this.elements.presetsMenu.classList.remove('visible');
            });
        });
    }

    toggleMenu(menu) {
        const isVisible = menu.classList.contains('visible');
        // Always close submenus when toggling the main
        this.elements.presetsMenu.classList.remove('visible');
        if (isVisible) {
            menu.classList.remove('visible');
        } else {
            // Close other menus before opening
            this.elements.mainMenu.classList.remove('visible');
            menu.classList.add('visible');
        }
    }

    bindPianoEvents() {
        const piano = document.querySelector('.interactive-piano');
        if (!piano) return;

        this.elements.pianoKeys.forEach(key => {
            key.addEventListener('mousedown', () => this.playNote(key));
            key.addEventListener('mouseup', () => this.stopNote(key));
            key.addEventListener('mouseleave', () => this.stopNote(key));
            key.addEventListener('touchstart', (e) => { e.preventDefault(); this.playNote(key); }, { passive: false });
            key.addEventListener('touchend', (e) => { e.preventDefault(); this.stopNote(key); }, { passive: false });
        });
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume audio context if it's in a suspended state (required by modern browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playNote(key) {
        // Initialize audio on the first interaction (click or keypress)
        this.initAudio();
        
        const note = key.dataset.note;
        if (!note || this.oscillators[note] || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = this.currentWaveform;
        oscillator.frequency.setValueAtTime(this.noteFrequencies[note], this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        this.oscillators[note] = { oscillator, gainNode };
        key.classList.add('playing');
    }

    stopNote(key) {
        const note = key.dataset.note;
        if (this.oscillators[note]) {
            const { oscillator, gainNode } = this.oscillators[note];
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            oscillator.stop(this.audioContext.currentTime + 0.1);
            delete this.oscillators[note];
            key.classList.remove('playing');
        }
    }
}

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
