
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    if (!Utils.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    // Get form elements
    const createNoteForm = document.getElementById('createNote');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    
});
