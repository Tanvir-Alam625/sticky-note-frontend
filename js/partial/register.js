// Register page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    Utils.redirectIfAuthenticated('index.html');
    
    // Get form elements
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Setup password requirements validation
    if (passwordInput) {
        passwordInput.addEventListener('input', handlePasswordValidation);
    }
    
    // Setup confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', handleConfirmPasswordValidation);
    }
    
    // Form submission handler
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle password requirements validation
function handlePasswordValidation() {
    const password = this.value;
    const validation = Utils.validatePassword(password);
    
    // Update requirement indicators
    updatePasswordRequirement('length-req', validation.requirements.length);
    updatePasswordRequirement('lower-req', validation.requirements.lower);
    updatePasswordRequirement('upper-req', validation.requirements.upper);
    updatePasswordRequirement('number-req', validation.requirements.number);
    
    // Update password strength indicator
    const strengthIndicator = document.querySelector('.password-strength');
    if (strengthIndicator) {
        strengthIndicator.style.display = password ? 'block' : 'none';
        strengthIndicator.className = `password-strength ${validation.strength}`;
    }
    
    // Validate confirm password if it has a value
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword && confirmPassword.value) {
        handleConfirmPasswordValidation.call(confirmPassword);
    }
}

// Update individual password requirement indicator
function updatePasswordRequirement(elementId, isMet) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('requirement-met', isMet);
    }
}

// Handle confirm password validation
function handleConfirmPasswordValidation() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const isMatch = password === confirmPassword;
    
    // Update field validation state
    this.classList.remove('valid', 'invalid');
    if (confirmPassword) {
        this.classList.add(isMatch ? 'valid' : 'invalid');
    }
    
    // Update match indicator
    const indicator = this.parentNode.querySelector('.password-match-indicator');
    if (indicator) {
        indicator.className = 'password-match-indicator';
        if (confirmPassword) {
            indicator.classList.add(isMatch ? 'match' : 'no-match');
            indicator.textContent = isMatch ? '✓' : '✗';
        }
    }
    
    // Set custom validity message
    if (confirmPassword && !isMatch) {
        this.setCustomValidity('Passwords do not match');
    } else {
        this.setCustomValidity('');
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    Utils.hideMessages();
    
    const formData = new FormData(event.target);
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    const confirmPassword = formData.get('confirmPassword');
    
    // Validation
    if (!registerData.username || !registerData.email || !registerData.password || !confirmPassword) {
        Utils.showMessage('Please fill in all fields');
        return;
    }
    
    if (!Utils.isValidEmail(registerData.email)) {
        Utils.showMessage('Please enter a valid email address');
        return;
    }
    
    const passwordValidation = Utils.validatePassword(registerData.password);
    if (!passwordValidation.isValid) {
        Utils.showMessage('Password does not meet the requirements');
        return;
    }
    
    if (registerData.password !== confirmPassword) {
        Utils.showMessage('Passwords do not match');
        return;
    }
    
    // Check terms acceptance if checkbox exists
    const termsCheckbox = document.getElementById('acceptTerms');
    if (termsCheckbox && !termsCheckbox.checked) {
        Utils.showMessage('Please accept the terms and conditions');
        return;
    }
    
    // Show loading state
    Utils.showLoading('loading', true, 'Creating your account...');
    
    try {
        // Make register API call
        const response = await Utils.apiCall(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(registerData)
        });
        
        if (response.success) {
            // Store authentication data
            Utils.storage.set('token', response.data.token);
            Utils.storage.set('user', {
                id: response.data.userId,
                username: response.data.username,
                email: response.data.email
            });
            
            // Show success message
            Utils.showMessage('Account created successfully! Welcome!', 'success');
            
            // Redirect to dashboard after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } else {
            // Handle API errors
            const errorMessage = response.errors 
                ? Utils.formatErrors(response.errors)
                : response.message || 'Registration failed';
            Utils.showMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle different types of errors
        if (error.message.includes('fetch')) {
            Utils.showMessage('Network error. Please check if the server is running and try again.');
        } else {
            Utils.showMessage(error.message || 'An unexpected error occurred');
        }
    } finally {
        // Hide loading state
        Utils.showLoading('loading', false);
    }
}

// Additional register page functionality
const RegisterPage = {
    // Check username availability (placeholder for future implementation)
    checkUsernameAvailability: async (username) => {
        // This would make an API call to check if username is available
        // For now, just return true
        return true;
    },
    
    // Generate strong password suggestion
    generatePassword: () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one character from each required type
        password += 'a'; // lowercase
        password += 'A'; // uppercase
        password += '1'; // number
        
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Shuffle the password
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    },
    
    // Show password suggestion
    suggestPassword: () => {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (passwordInput) {
            const suggestedPassword = RegisterPage.generatePassword();
            passwordInput.value = suggestedPassword;
            if (confirmPasswordInput) {
                confirmPasswordInput.value = suggestedPassword;
            }
            
            // Trigger validation events
            passwordInput.dispatchEvent(new Event('input'));
            if (confirmPasswordInput) {
                confirmPasswordInput.dispatchEvent(new Event('input'));
            }
            
            Utils.showMessage('Strong password generated! Feel free to modify it.', 'success');
        }
    }
};

// Export for global access
window.RegisterPage = RegisterPage;