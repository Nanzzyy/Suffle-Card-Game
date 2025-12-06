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

    generateDoodleBackground(); // Panggil fungsi background di akhir
});

// --- Latar Belakang Emoji Doodle ---
function generateDoodleBackground() {
    const emojis = ["😊", "😂", "😍", "🤔", "😎", "🤩", "🥳", "🤯", "🤗", "🤖", "👽", "🤠", "🤡", "👹", "👻", "🦄", "🙏", "❤️", "🧠", "🏆", "🎲", "🎮", "🕹️", "🃏"];
    const doodleCount = Math.max(30, Math.floor((width * height) / 35000)); // Adjusted density
    let svgContent = '';
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < doodleCount; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 20 + 15; // Ukuran antara 15px dan 35px
        const rotation = Math.random() * 90 - 45; // Rotasi antara -45 dan 45 derajat
        const opacity = Math.random() * 0.1 + 0.05; // Opasitas antara 0.05 dan 0.15

        svgContent += `<text x="${x}" y="${y}" font-size="${size}" transform="rotate(${rotation}, ${x}, ${y})" fill="white" style="opacity: ${opacity};">${emoji}</text>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${svgContent}</svg>`;
    // Gunakan encodeURIComponent untuk menangani emoji dan karakter non-Latin1 dengan benar
    const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
    document.body.style.backgroundImage = `url("data:image/svg+xml;base64,${encodedSvg}")`;
}
