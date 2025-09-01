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
    
    // Initialize shared handlers
    new ConvertKitFormHandler();
    new ContactFormHandler();
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
