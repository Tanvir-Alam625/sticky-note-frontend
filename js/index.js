// Common JavaScript functionality for Sticky Notes application

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:9000/api',
    ENDPOINTS: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        PROFILE: '/auth/profile',
        NOTES: '/notes'
    }
};

// Utility functions
const Utils = {
    // Show/hide loading state
    showLoading: (elementId, show = true, loadingText = 'Loading...') => {
        const element = document.getElementById(elementId);
        const btn = document.querySelector('.btn, .login-btn, .register-btn');
        
        if (show) {
            if (element) element.style.display = 'block';
            if (btn) {
                btn.disabled = true;
                btn.dataset.originalText = btn.textContent;
                btn.textContent = loadingText;
            }
        } else {
            if (element) element.style.display = 'none';
            if (btn) {
                btn.disabled = false;
                if (btn.dataset.originalText) {
                    btn.textContent = btn.dataset.originalText;
                }
            }
        }
    },

    // Show/hide messages
    showMessage: (message, type = 'error') => {
        Utils.hideMessages();
        
        const elementId = type === 'error' ? 'errorMessage' : 'successMessage';
        const element = document.getElementById(elementId);
        
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        }
    },

    // Hide all messages
    hideMessages: () => {
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    },

    // Format errors from API response
    formatErrors: (errors) => {
        if (Array.isArray(errors)) {
            return errors.map(err => err.msg || err.message || err).join(', ');
        }
        return errors.toString();
    },

    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password strength
    validatePassword: (password) => {
        const requirements = {
            length: password.length >= 6,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            number: /\d/.test(password)
        };
        
        const score = Object.values(requirements).filter(Boolean).length;
        
        return {
            requirements,
            score,
            strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
            isValid: Object.values(requirements).every(Boolean)
        };
    },

    // Storage functions
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Storage set error:', error);
            }
        },
        
        get: (key) => {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.error('Storage get error:', error);
                return null;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Storage remove error:', error);
            }
        },
        
        clear: () => {
            try {
                localStorage.clear();
            } catch (error) {
                console.error('Storage clear error:', error);
            }
        }
    },

    // API call wrapper
    apiCall: async (endpoint, options = {}) => {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = Utils.storage.get('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = Utils.storage.get('token');
        const user = Utils.storage.get('user');
        return !!(token && user);
    },

    // Logout user
    logout: () => {
        Utils.storage.remove('token');
        Utils.storage.remove('user');
        window.location.href = 'login.html';
    },

    // Redirect if authenticated
    redirectIfAuthenticated: (redirectTo = 'index.html') => {
        if (Utils.isAuthenticated()) {
            window.location.href = redirectTo;
        }
    },

    // Redirect if not authenticated
    redirectIfNotAuthenticated: (redirectTo = 'login.html') => {
        if (!Utils.isAuthenticated()) {
            window.location.href = redirectTo;
        }
    }
};

// Form validation helpers
const FormValidator = {
    // Real-time input validation
    setupRealTimeValidation: (form) => {
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                FormValidator.validateField(this);
            });
            
            input.addEventListener('blur', function() {
                FormValidator.validateField(this);
            });
        });
    },

    // Validate individual field
    validateField: (field) => {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Type-specific validation
        if (value && type === 'email' && !Utils.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        if (value && type === 'password' && field.name === 'password') {
            const validation = Utils.validatePassword(value);
            if (!validation.isValid) {
                isValid = false;
                errorMessage = 'Password does not meet requirements';
            }
        }
        
        // Update field appearance
        field.classList.remove('valid', 'invalid');
        field.classList.add(isValid ? 'valid' : 'invalid');
        
        // Show/hide error message
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.toggle('show', !isValid && errorMessage);
        }
        
        return isValid;
    },

    // Validate entire form
    validateForm: (form) => {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!FormValidator.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
};

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup form validation if forms exist
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        FormValidator.setupRealTimeValidation(form);
    });
    
    // Auto-hide messages after 5 seconds
    setTimeout(() => {
        Utils.hideMessages();
    }, 5000);
});

// Export for use in other files
window.Utils = Utils;
window.FormValidator = FormValidator;
window.API_CONFIG = API_CONFIG;