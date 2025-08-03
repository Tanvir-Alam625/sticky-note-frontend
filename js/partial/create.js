document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in
    if (!Utils.isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }
    
    // Get form elements
    const createNoteForm = document.getElementById("createNote");
    
    if (createNoteForm) {
        createNoteForm.addEventListener("submit", handleCreateNote);
    }
    
   
});

// Handle button click
function handleCreateNoteClick(event) {
    event.preventDefault();
    const form = document.getElementById("createNote");
    if (form) {
        handleCreateNote({ 
            preventDefault: () => {}, 
            stopPropagation: () => {},
            target: form 
        });
    }
}

async function handleCreateNote(event) {
    // Prevent form submission and page refresh
    event.preventDefault();
    event.stopPropagation();
    
    Utils.hideMessages();
    
    const formData = new FormData(event.target);
    const payload = {
        title: formData.get("title"),
        content: formData.get("content"),
        color: formData.get("color"),
    };
    
    // Validate form data
    if (!payload.title || !payload.content || !payload.color) {
        Utils.showMessage("Please fill in all fields", "error");
        return false;
    }
    
    Utils.showLoading("loading", true, "Creating your note...");
    
    try {
        const res = await Utils.apiCall(API_CONFIG.ENDPOINTS.NOTES, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        
        if (res.success) {
            Utils.showMessage("Note created successfully!", "success");
            
            // Reset form
            event.target.reset();
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            console.error("Failed to create note:", res.message);
            Utils.showMessage("Failed to create note: " + (res.message || "Unknown error"), "error");
        }
    } catch (error) {
        console.error("Error creating note:", error);
        Utils.showMessage("Network error. Please check if the server is running and try again.", "error");
    } finally {
        Utils.showLoading("loading", false);
    }
    
    return false; // Ensure form doesn't submit
}

// Make function available globally for onclick handler
window.handleCreateNoteClick = handleCreateNoteClick;
