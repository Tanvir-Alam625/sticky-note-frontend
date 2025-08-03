// Create note page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!Utils.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user information
    const user = Utils.storage.get('user');
    if (user) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
    }
    
    // Get form elements
    const createNoteForm = document.getElementById('createNote');
    const titleInput = document.getElementById('title');
    const colorSelect = document.getElementById('color');
    const contentTextarea = document.getElementById('content');
    
    // Form submission handler
    if (createNoteForm) {
        createNoteForm.addEventListener('submit', handleCreateNote);
    }
    
    // Setup real-time validation
    setupFormValidation();
});

// Setup form validation
function setupFormValidation() {
    const titleInput = document.getElementById('title');
    const colorSelect = document.getElementById('color');
    const contentTextarea = document.getElementById('content');
    
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            validateField(this, 'title-error', 'Title is required');
        });
    }
    
    if (colorSelect) {
        colorSelect.addEventListener('change', function() {
            validateField(this, 'color-error', 'Please select a color');
        });
    }
    
    if (contentTextarea) {
        contentTextarea.addEventListener('input', function() {
            validateField(this, 'content-error', 'Content is required');
        });
    }
}

// Validate individual field
function validateField(field, errorElementId, errorMessage) {
    const value = field.value.trim();
    const isValid = value.length > 0;
    
    // Update field appearance
    field.classList.remove('valid', 'invalid');
    if (value) {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }
    
    // Show/hide error message
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
        errorElement.textContent = isValid ? '' : errorMessage;
        errorElement.classList.toggle('show', !isValid && value);
    }
    
    return isValid;
}

// Handle create note form submission
async function handleCreateNote(event) {
    event.preventDefault();
    
    Utils.hideMessages();
    
    const formData = new FormData(event.target);
    const noteData = {
        title: formData.get('title'),
        content: formData.get('content'),
        color: formData.get('color'),
    };
    
    // Validate form data
    if (!noteData.title || !noteData.content || !noteData.color) {
        Utils.showMessage('Please fill in all fields');
        return;
    }
    
    if (noteData.title.length < 3) {
        Utils.showMessage('Title must be at least 3 characters long');
        return;
    }
    
    if (noteData.content.length < 10) {
        Utils.showMessage('Content must be at least 10 characters long');
        return;
    }
    
    // Show loading state
    Utils.showLoading('loading', true, 'Creating your note...');
    
    try {
        // Make create note API call
        const response = await Utils.apiCall(API_CONFIG.ENDPOINTS.NOTES, {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
        
        if (response.success) {
            // Show success message
            Utils.showMessage('Note created successfully!', 'success');
            
            // Reset form
            event.target.reset();
            
            // Remove validation classes
            const inputs = event.target.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
            
            // Redirect to notes list after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Handle API errors
            const errorMessage = response.errors 
                ? Utils.formatErrors(response.errors)
                : response.message || 'Failed to create note';
            Utils.showMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Create note error:', error);
        
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

// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        Utils.logout();
    }
}

// Additional create page functionality
const CreatePage = {
    // Clear form
    clearForm: () => {
        const form = document.getElementById('createNote');
        if (form) {
            form.reset();
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
            Utils.hideMessages();
        }
    },
    
    // Save draft to localStorage
    saveDraft: () => {
        const form = document.getElementById('createNote');
        if (form) {
            const formData = new FormData(form);
            const draft = {
                title: formData.get('title'),
                content: formData.get('content'),
                color: formData.get('color'),
                timestamp: new Date().toISOString()
            };
            Utils.storage.set('noteDraft', draft);
            Utils.showMessage('Draft saved!', 'success');
        }
    },
    
    // Load draft from localStorage
    loadDraft: () => {
        const draft = Utils.storage.get('noteDraft');
        if (draft) {
            const titleInput = document.getElementById('title');
            const contentTextarea = document.getElementById('content');
            const colorSelect = document.getElementById('color');
            
            if (titleInput && draft.title) titleInput.value = draft.title;
            if (contentTextarea && draft.content) contentTextarea.value = draft.content;
            if (colorSelect && draft.color) colorSelect.value = draft.color;
            
            Utils.showMessage('Draft loaded!', 'success');
            Utils.storage.remove('noteDraft');
        }
    }
};

// Export for global access
window.CreatePage = CreatePage;
window.handleLogout = handleLogout;
