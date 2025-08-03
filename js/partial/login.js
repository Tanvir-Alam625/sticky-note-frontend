// Login page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    Utils.redirectIfAuthenticated('index.html');
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Load remembered email if exists
    const rememberedEmail = Utils.storage.get('rememberedEmail');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Remember me functionality
    if (rememberMeCheckbox) {
        rememberMeCheckbox.addEventListener('change', function() {
            if (!this.checked) {
                Utils.storage.remove('rememberedEmail');
            }
        });
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    Utils.hideMessages();
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
        Utils.showMessage('Please fill in all fields');
        return;
    }
    
    if (!Utils.isValidEmail(loginData.email)) {
        Utils.showMessage('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    Utils.showLoading('loading', true, 'Signing you in...');
    
    try {
        // Make login API call
        const response = await Utils.apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        if (response.success) {
            // Store authentication data
            Utils.storage.set('token', response.data.token);
            Utils.storage.set('user', {
                id: response.data.userId,
                username: response.data.username,
                email: response.data.email
            });
            
            // Handle remember me
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                Utils.storage.set('rememberedEmail', loginData.email);
            } else {
                Utils.storage.remove('rememberedEmail');
            }
            
            // Show success message
            Utils.showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Handle API errors
            const errorMessage = response.errors 
                ? Utils.formatErrors(response.errors)
                : response.message || 'Login failed';
            Utils.showMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
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
