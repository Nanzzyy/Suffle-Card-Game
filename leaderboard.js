document.addEventListener("DOMContentLoaded", () => {
    const leaderboardList = document.getElementById("leaderboard-list");

    // Ambil data leaderboard dari localStorage
    const leaderboardData = JSON.parse(localStorage.getItem("leaderboard")) || [];

    if (leaderboardData.length === 0) {
        leaderboardList.innerHTML = "<li>No scores yet. Be the first!</li>";
    } else {
        // Urutkan berdasarkan skor (tertinggi dulu)
        leaderboardData.sort((a, b) => b.score - a.score);

        // Tampilkan 10 skor teratas
        leaderboardData.slice(0, 10).forEach(entry => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="username">${entry.username}</span><span class="score">${entry.score}</span>`;
            leaderboardList.appendChild(li);
        });
    }
});
