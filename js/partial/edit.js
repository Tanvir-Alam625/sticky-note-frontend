// Edit note page JavaScript functionality

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
    
    // Get note ID from URL
    const noteId = new URLSearchParams(window.location.search).get('id');
    if (!noteId) {
        Utils.showMessage('Note ID is required', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Load note data
    loadNoteData(noteId);
    
    // Setup form submission
    const editForm = document.getElementById('editNoteForm');
    if (editForm) {
        editForm.addEventListener('submit', (event) => handleUpdateNote(event, noteId));
    }
    
    // Setup form validation
    setupFormValidation();
});

// Load note data
async function loadNoteData(noteId) {
    Utils.hideMessages();
    Utils.showLoading('loading', true, 'Loading note...');
    
    try {
        const response = await Utils.apiCall(`${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`, {
            method: 'GET'
        });
        
        if (response.success) {
            populateForm(response.data);
        } else {
            Utils.showMessage('Failed to load note: ' + (response.message || 'Unknown error'));
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error loading note:', error);
        if (error.message.includes('fetch')) {
            Utils.showMessage('Network error. Please check if the server is running and try again.');
        } else {
            Utils.showMessage('Failed to load note. Redirecting...');
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } finally {
        Utils.showLoading('loading', false);
    }
}

// Populate form with note data
function populateForm(noteData) {
    const titleInput = document.getElementById('title');
    const contentTextarea = document.getElementById('content');
    const colorSelect = document.getElementById('color');
    
    if (titleInput) titleInput.value = noteData.title || '';
    if (contentTextarea) contentTextarea.value = noteData.content || '';
    if (colorSelect) colorSelect.value = noteData.color || '';
    
    // Update page title
    document.title = `Edit: ${noteData.title} - Sticky Notes`;
}

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

// Handle update note form submission
async function handleUpdateNote(event, noteId) {
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
    Utils.showLoading('loading', true, 'Updating your note...');
    
    try {
        // Make update note API call
        const response = await Utils.apiCall(`${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(noteData)
        });
        
        if (response.success) {
            // Show success message
            Utils.showMessage('Note updated successfully!', 'success');
            
            // Redirect to notes list after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Handle API errors
            const errorMessage = response.errors 
                ? Utils.formatErrors(response.errors)
                : response.message || 'Failed to update note';
            Utils.showMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Update note error:', error);
        
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

// Cancel edit function
function cancelEdit() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = 'index.html';
    }
}

// Export for global access
window.handleLogout = handleLogout;
window.cancelEdit = cancelEdit;
