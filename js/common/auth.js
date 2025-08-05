document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  if (!Utils.isAuthenticated()) {
    Utils.redirectIfNotAuthenticated();
    return;
  } else {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        Utils.logout();
      });
    }
    // Load user information
    const user = Utils.storage.get("user");
    if (user) {
      document.getElementById("username").textContent = user.username;
    }
  }
});
