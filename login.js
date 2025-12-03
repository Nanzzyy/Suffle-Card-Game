document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");

    // Jika pengguna sudah login, langsung arahkan ke game
    if (sessionStorage.getItem("username")) {
        window.location.href = "index.html";
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            sessionStorage.setItem("username", username);
            window.location.href = "index.html";
        }
    });
});
