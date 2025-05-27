document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("login-form").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("error-message");
        const successMessage = document.getElementById("success-message");

        if (username === "admin" && password === "admin") {
            localStorage.setItem('authToken', 'valid_token');
            errorMessage.textContent = "";
            successMessage.textContent = "Login successful!";
            window.location.href = "../admin/admin.html";
        } else {
            errorMessage.textContent = "Invalid username or password!";
            successMessage.textContent = "";
        }
    });
});