document.addEventListener("DOMContentLoaded", function () {
  // Initialize the home page
  initHomePage();
});

// Initialize home page functionality
async function initHomePage() {
  // Show initial loading state
  showInitialLoading();

  // Load notes on page load
  await loadNotes();

  // Setup event listeners
  setupEventListeners();
}

// Show initial loading state
function showInitialLoading() {
  const homeContainer = document.querySelector(".home-container");
  if (homeContainer) {
    homeContainer.innerHTML = `
            <div class="initial-loading">
                <div class="loading-content">
                    <div class="spinner"></div>
                    <p>Loading your notes...</p>
                </div>
            </div>
        `;
  }
}

// Setup event listeners for home page
function setupEventListeners() {
  // Note list item click handlers will be added dynamically
  const noteList = document.getElementById("noteList");
  if (noteList) {
    // Remove existing event listener to prevent duplicates
    noteList.removeEventListener("click", handleNoteListClick);
    noteList.addEventListener("click", handleNoteListClick);
  }
}

// Handle clicks on note list items
function handleNoteListClick(event) {
  const listItem = event.target.closest("li");
  const deleteIcon = event.target.closest(".delete-icon");

  if (deleteIcon) {
    // Handle delete icon click
    event.preventDefault();
    const noteId = deleteIcon.closest("a").id.replace("note-", "");
    if (noteId) {
      deleteNote(noteId);
    }
    return;
  }

  if (listItem) {
    // Handle note selection
    selectNote(listItem);
  }
}

// Load notes from API
async function loadNotes() {
  try {
    Utils.showLoading("loading", true, "Loading notes...");

    // Make API call to fetch notes
    const response = await Utils.apiCall(API_CONFIG.ENDPOINTS.NOTES, {
      method: "GET",
    });

    if (response.success) {
      displayNotes(response.data || []);
    } else {
      Utils.showMessage(response.message || "Failed to load notes");
    }
  } catch (error) {
    console.error("Error loading notes:", error);
    Utils.showMessage("Failed to load notes. Please try again.");

    console.log("Showing sample notes due to API connection issue");
  } finally {
    Utils.showLoading("loading", false);
  }
}

// Display notes in the sidebar list
function displayNotes(notes) {
  const homeContainer = document.querySelector(".home-container");

  if (!homeContainer) return;

  if (notes.length === 0) {
    // Show no notes full-screen message
    showNoNotesView(homeContainer);
    return;
  }

  // Show normal layout with sidebar and content
  showNormalView(homeContainer);

  const noteList = document.getElementById("noteList");
  if (!noteList) return;

  // Clear existing notes
  noteList.innerHTML = "";

  // Display each note
  notes.forEach((note, index) => {
    const listItem = createNoteListItem(note, index === 0);
    noteList.appendChild(listItem);
  });

  // Auto-select first note
  if (notes.length > 0) {
    displayNoteContent(notes[0]);
    showActionButtons();
  }
}

// Show the no notes view (replaces entire home container content)
function showNoNotesView(homeContainer) {
  homeContainer.innerHTML = `
        <div class="no-notes-container">
            <div class="no-notes-content">
                <div class="no-notes-icon">📝</div>
                <h2 class="no-notes-title">No Notes Yet</h2>
                <p class="no-notes-description">Start organizing your thoughts by creating your first sticky note!</p>
                <a href="./create.html" class="create-first-note-btn">Create Your First Note</a>
            </div>
        </div>
    `;
}

// Show the normal view with sidebar and content
function showNormalView(homeContainer) {
  homeContainer.innerHTML = `
        <aside class="sidebar">
            <div class="side-head">
                <h2>Note List</h2>
                <a href="./create.html" class="btn">Create</a>
            </div>
            <ul class="note-list" id="noteList">
                <!-- Notes will be dynamically loaded here -->
            </ul>
            <div class="error-message" id="errorMessage"></div>
            <div class="success-message" id="successMessage"></div>
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        </aside>
        <div class="content">
            <div class="content-head">
                <h2 class="note-title" id="noteTitle">No Note Selected</h2>
                <div class="note-actions">
                    <div class="color-status" id="colorStatus" style="background-color: #e0e0e0;"></div>
                    <a id="editNote" href="./create.html" class="btn">Edit</a>
                    <a id="deleteNote" href="#" class="btn delete">Delete</a>
                </div>
            </div>
            <blockquote>
            </blockquote>
        </div>
    `;

  // Re-setup event listeners for the new elements
  setupEventListeners();
}

// Create a note list item element
function createNoteListItem(note, isActive = false) {
  const listItem = document.createElement("li");
  listItem.className = isActive ? "active" : "";
  listItem.dataset.noteId = note.id;

  // Truncate title if too long
  const maxLength = 15;
  const title =
    note.title && note.title.length > maxLength
      ? note.title.substring(0, maxLength) + "..."
      : note.title || "Untitled Note";

  listItem.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
    <div style="height:10px;width:10px;border-radius:50%;background:${note.color}"></div>
        <span>${title}</span>
    </div>
        <a id="note-${note.id}" href="#" onclick="event.preventDefault()">
            <img class="delete-icon" src="./images/delete.svg" alt="delete-img">
        </a>
    `;

  return listItem;
}

// Select a note and display its content
function selectNote(listItem) {
  // Remove active class from all items
  const allItems = document.querySelectorAll("#noteList li");
  allItems.forEach((item) => item.classList.remove("active"));

  // Add active class to selected item
  listItem.classList.add("active");

  // Get note ID and find the note
  const noteId = listItem.dataset.noteId;
  if (noteId) {
    loadNoteContent(noteId);
  }
}

// Load and display note content
async function loadNoteContent(noteId) {
  try {
    Utils.showLoading("loading", true, "Loading note...");

    // Make API call to fetch specific note
    const response = await Utils.apiCall(
      `${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`,
      {
        method: "GET",
      }
    );

    if (response.success) {
      displayNoteContent(response.data);
    } else {
      Utils.showMessage(response.message || "Failed to load note");
    }
  } catch (error) {
    console.error("Error loading note:", error);
    Utils.showMessage("Failed to load note content.");
  } finally {
    Utils.showLoading("loading", false);
  }
}

// Display note content in the main area
function displayNoteContent(note) {
  const noteTitle = document.getElementById("noteTitle");
  const colorStatus = document.getElementById("colorStatus");
  const contentArea = document.querySelector(".content blockquote");
  const editNote = document.getElementById("editNote");
  const deleteNote = document.getElementById("deleteNote");

  if (noteTitle) {
    noteTitle.textContent = note.title || "Untitled Note";
  }

  if (colorStatus) {
    // Set background color based on note color
    colorStatus.style.backgroundColor = note.color || "#667eea";
  }

  if (contentArea) {
    // Display note content (handle both text and HTML)
    if (note.content) {
      contentArea.innerHTML = note.content;
    } else {
      contentArea.textContent = note.text || "No content available.";
    }
  }

  // Show and enable action buttons
  showActionButtons();
  enableActionButtons();

  // Update action buttons with note ID
  if (editNote) {
    editNote.href = `./edit.html?id=${note.id || note._id}`;
  }

  if (deleteNote) {
    deleteNote.onclick = (e) => {
      e.preventDefault();
      deleteNoteById(note.id || note._id);
    };
  }
}

// Clear content area when no notes
function clearContentAreaForNoNotes() {
  const noteTitle = document.getElementById("noteTitle");
  const colorStatus = document.getElementById("colorStatus");
  const contentArea = document.querySelector(".content blockquote");

  if (noteTitle) {
    noteTitle.textContent = "No Notes Yet";
  }

  if (colorStatus) {
    colorStatus.style.backgroundColor = "#e0e0e0";
  }

  if (contentArea) {
    contentArea.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <h3 style="color: #666; margin-bottom: 20px;">📝 No Notes Yet</h3>
                <p style="color: #888; margin-bottom: 30px;">Start organizing your thoughts by creating your first sticky note!</p>
                <a href="./create.html" class="btn" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Create Your First Note</a>
            </div>
        `;
  }

  // Hide action buttons when no notes
  hideActionButtons();
}

// Clear content area when notes exist but none selected
function clearContentArea() {
  const noteTitle = document.getElementById("noteTitle");
  const colorStatus = document.getElementById("colorStatus");
  const contentArea = document.querySelector(".content blockquote");

  if (noteTitle) {
    noteTitle.textContent = "No Note Selected";
  }

  if (colorStatus) {
    colorStatus.style.backgroundColor = "#e0e0e0";
  }

  if (contentArea) {
    contentArea.innerHTML = `
            <p>Select a note from the sidebar to view its content, or 
            <a href="./create.html">create a new note</a>.</p>
        `;
  }

  // Show action buttons but disable them
  showActionButtons();
  disableActionButtons();
}

// Hide action buttons
function hideActionButtons() {
  const editNote = document.getElementById("editNote");
  const deleteNote = document.getElementById("deleteNote");

  if (editNote) {
    editNote.style.display = "none";
  }

  if (deleteNote) {
    deleteNote.style.display = "none";
  }
}

// Show action buttons
function showActionButtons() {
  const editNote = document.getElementById("editNote");
  const deleteNote = document.getElementById("deleteNote");

  if (editNote) {
    editNote.style.display = "inline-block";
  }

  if (deleteNote) {
    deleteNote.style.display = "inline-block";
  }
}

// Disable action buttons
function disableActionButtons() {
  const editNote = document.getElementById("editNote");
  const deleteNote = document.getElementById("deleteNote");

  if (editNote) {
    editNote.style.opacity = "0.5";
    editNote.style.pointerEvents = "none";
  }

  if (deleteNote) {
    deleteNote.style.opacity = "0.5";
    deleteNote.style.pointerEvents = "none";
  }
}

// Enable action buttons
function enableActionButtons() {
  const editNote = document.getElementById("editNote");
  const deleteNote = document.getElementById("deleteNote");

  if (editNote) {
    editNote.style.opacity = "1";
    editNote.style.pointerEvents = "auto";
  }

  if (deleteNote) {
    deleteNote.style.opacity = "1";
    deleteNote.style.pointerEvents = "auto";
  }
}

// Delete a note
async function deleteNoteById(noteId) {
  if (!confirm("Are you sure you want to delete this note?")) {
    return;
  }

  try {
    Utils.showLoading("loading", true, "Deleting note...");

    // Make API call to delete note
    const response = await Utils.apiCall(
      `${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`,
      {
        method: "DELETE",
      }
    );

    if (response.success) {
      Utils.showMessage("Note deleted successfully!", "success");
      // Reload notes list
      await loadNotes();
    } else {
      Utils.showMessage(response.message || "Failed to delete note");
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    Utils.showMessage("Failed to delete note. Please try again.");
  } finally {
    Utils.showLoading("loading", false);
  }
}

// Delete a note (legacy function name for compatibility)
async function deleteNote(noteId) {
  return await deleteNoteById(noteId);
}

// Refresh notes list (can be called from other parts of the app)
window.refreshNotes = loadNotes;

// Export functions for external use
window.HomePageFunctions = {
  loadNotes,
  displayNotes,
  selectNote,
  loadNoteContent,
  deleteNote,
};
