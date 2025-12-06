// leaderboard.js

// --- Inisialisasi Leaderboard dari JSON ---
async function initializeLeaderboard() {
    try {
        const response = await fetch('leaderboard.json');
        if (!response.ok) throw new Error('Failed to fetch');
        const jsonData = await response.json();

        const localData = JSON.parse(localStorage.getItem("leaderboard"));

        if (!localData || localData.length === 0) {
            jsonData.sort((a, b) => b.score - a.score);
            localStorage.setItem("leaderboard", JSON.stringify(jsonData.slice(0, 10)));
        }
    } catch (error) {
        console.error("Could not initialize leaderboard from JSON:", error);
    }
}

// --- Fungsi untuk memperbarui leaderboard ---
function updateLeaderboard(newScore) {
    const username = sessionStorage.getItem("username");
    if (!username) return;

    let leaderboardData = JSON.parse(localStorage.getItem("leaderboard")) || [];
    
    const playerIndex = leaderboardData.findIndex(entry => entry.username === username);

    if (playerIndex > -1) {
        // Pemain sudah ada, perbarui jika skor baru lebih tinggi
        if (newScore > leaderboardData[playerIndex].score) {
            leaderboardData[playerIndex].score = newScore;
        }
    } else {
        // Pemain baru, tambahkan ke data
        leaderboardData.push({ username, score: newScore });
    }

    // Urutkan berdasarkan skor
    leaderboardData.sort((a, b) => b.score - a.score);

    // Simpan top 10
    localStorage.setItem("leaderboard", JSON.stringify(leaderboardData.slice(0, 10)));

    // Perbarui tampilan leaderboard dalam game jika terlihat
    renderLeaderboard("in-game-list");
}

// --- Fungsi untuk merender leaderboard ---
function renderLeaderboard(elementId) {
    const leaderboardList = document.getElementById(elementId);
    if (!leaderboardList) return;

    const leaderboardData = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const currentUsername = sessionStorage.getItem("username");

    leaderboardList.innerHTML = '';

    if (leaderboardData.length === 0) {
        leaderboardList.innerHTML = "<li>No scores yet. Be the first!</li>";
    } else {
        leaderboardData.forEach((entry, index) => {
            const li = document.createElement("li");
            const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            
            // Tambahkan kelas jika entri ini milik pengguna saat ini
            if (entry.username === currentUsername) {
                li.classList.add('current-user');
            }

            li.innerHTML = `
                <span class="rank">${rankIcon}</span>
                <span class="username">${entry.username}</span>
                <span class="score">${entry.score}</span>
            `;
            leaderboardList.appendChild(li);
        });
    }
}

// --- Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
    const runInit = async () => {
        await initializeLeaderboard();
        // Hapus rendering untuk #leaderboard-list karena halaman itu akan dihapus
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => { runInit().catch(e => console.error(e)); });
    } else {
        setTimeout(() => { runInit().catch(e => console.error(e)); }, 50);
    }
});

// --- Jadikan fungsi global ---
window.renderLeaderboard = renderLeaderboard;
window.updateLeaderboard = updateLeaderboard;
window.initializeLeaderboard = initializeLeaderboard;