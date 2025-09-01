// KeyBard Product Page Handler
class ProductPageHandler {
    constructor() {
        this.elements = {
            // Interactive Demo Elements
            liveClock: document.getElementById('live-clock'),
            icon: document.getElementById('keybard-demo-icon'),
            mainMenu: document.getElementById('keybard-main-menu'),
            presetsMenu: document.getElementById('presets-submenu'),
            pianoKeys: document.querySelectorAll('.piano-key'),
            demoPlugin: document.getElementById('demo-plugin'),
            presetSine: document.getElementById('preset-sine'),
            presetSawtooth: document.getElementById('preset-sawtooth'),
            // How It Works Section
            howItWorksContainer: document.querySelector('.how-it-works-interactive'),
            howItWorksSteps: document.querySelectorAll('.how-it-works-steps .step'),
            // Pricing Section
            currencyToggleButtons: document.querySelectorAll('.toggle-button'),
            priceAmount: document.getElementById('price-amount'),
            priceCurrency: document.getElementById('price-currency'),
        };
        
        // Demo State
        this.audioContext = null;
        this.oscillators = {};
        this.submenuTimeout = null;
        this.currentWaveform = 'sine';
        this.noteFrequencies = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
            'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
            'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
        };

        this.init();
    }

    init() {
        this.initClock();
        this.bindMenuEvents();
        this.bindPianoEvents();
        this.bindKeyboardEvents();
        this.bindPricingToggle();
        this.bindPresetEvents();
        this.bindScrollAnimations();
        
        // Set initial state for demo
        this.elements.presetSine.classList.add('selected');
        if (this.elements.mainMenu.classList.contains('demo-start-visible')) {
            this.elements.icon.classList.add('active');
        }
    }

    initClock() {
        const updateClock = () => {
            if (!this.elements.liveClock) return;
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            this.elements.liveClock.textContent = now.toLocaleDateString('en-US', options).replace(',', '');
        };
        updateClock();
        setInterval(updateClock, 60000); // Update every minute
    }

    bindMenuEvents() {
        this.elements.icon.addEventListener('click', (e) => {
            e.stopPropagation();

            if (this.elements.mainMenu.classList.contains('demo-start-visible')) {
                this.elements.mainMenu.classList.remove('demo-start-visible');
                this.elements.presetsMenu.classList.remove('demo-start-visible');
                this.elements.icon.classList.remove('active');
            } else {
                this.elements.mainMenu.classList.toggle('visible');
                this.elements.icon.classList.toggle('active');
            }
        });

        this.elements.demoPlugin.addEventListener('mouseover', () => {
            clearTimeout(this.submenuTimeout);
            this.elements.presetsMenu.classList.add('visible');
        });

        const hideSubmenu = () => {
            this.submenuTimeout = setTimeout(() => {
                this.elements.presetsMenu.classList.remove('visible');
            }, 200);
        };

        this.elements.demoPlugin.addEventListener('mouseout', hideSubmenu);
        this.elements.presetsMenu.addEventListener('mouseover', () => clearTimeout(this.submenuTimeout));
        this.elements.presetsMenu.addEventListener('mouseout', hideSubmenu);
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
            });
        });
    }

    bindPianoEvents() {
        this.elements.pianoKeys.forEach(key => {
            key.addEventListener('mousedown', () => this.playNote(key));
            key.addEventListener('mouseup', () => this.stopNote(key));
            key.addEventListener('mouseleave', () => this.stopNote(key));
            key.addEventListener('touchstart', (e) => { e.preventDefault(); this.playNote(key); }, { passive: false });
            key.addEventListener('touchend', (e) => { e.preventDefault(); this.stopNote(key); }, { passive: false });
        });
    }

    bindKeyboardEvents() {
        this.keyMap = {};
        this.elements.pianoKeys.forEach(key => {
            const keyName = key.dataset.key;
            if (keyName) { this.keyMap[keyName] = key; }
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
            if (keyElement) { this.stopNote(keyElement); }
        });
    }
    
    bindPricingToggle() {
        this.elements.currencyToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update button active state
                this.elements.currencyToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update price display
                const price = button.dataset.price;
                const currency = button.dataset.currency;
                this.elements.priceAmount.textContent = price;
                this.elements.priceCurrency.textContent = currency;
            });
        });
    }

    bindScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.2 });

        const sections = document.querySelectorAll('.scroll-fade-in');
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playNote(key) {
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('product-page-body')) {
        new ProductPageHandler();
    }
});
