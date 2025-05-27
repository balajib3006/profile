document.addEventListener("DOMContentLoaded", function() {
    checkAuth();
    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", logout);
});

function checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        window.location.href = "../login/login.html";
    }
}

function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../login/login.html";
}