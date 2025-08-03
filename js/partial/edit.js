document.addEventListener("DOMContentLoaded", function () {
  const noteId = new URLSearchParams(window.location.search).get("id");
  if (!noteId) {
    Utils.showMessage("Note ID is required", "error");
    return;
  } else {
    getNoteInfo(noteId);
  }
});

async function getNoteInfo(noteId) {
  Utils.hideMessages();
  const circleLoader = document.getElementById("circleLoader");
  const updateNoteFrom = document.getElementById("createNote");

  try {
    const res = Utils.apiCall(`${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`);
    if (res.success) {
      console.log(res.data);
    }
  } catch (error) {
    
  } finally {
    circleLoader.style.display = "none";
  }
}
