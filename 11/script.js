// script.js

// --- Cek Session ---
const username = sessionStorage.getItem("username");
if (!username) {
    // Jika tidak ada username di session, redirect ke halaman login
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    // --- Elemen DOM ---
    const mainMenu = document.getElementById("main-menu");
    const gameLayout = document.getElementById("game-layout");
    const boardElement = document.getElementById("game-board");
    const movesElement = document.getElementById("moves");
    const timerElement = document.getElementById("timer");
    const matchesElement = document.getElementById("matches");
    const livesElement = document.getElementById("lives");
    const winsElement = document.getElementById("wins");
    const playBtn = document.getElementById("playBtn");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const resetBtn = document.getElementById("resetBtn");
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("user-info");
    const welcomeMessage = document.getElementById("welcome-message");
    const popupRoot = document.getElementById("popup-root");

    // --- Elemen Audio (lazy load) ---
    function createLazyAudio(src) {
        let audio = null;
        return {
            play() {
                if (!audio) {
                    audio = new Audio();
                    audio.preload = 'none';
                    audio.src = src;
                }
                try { audio.play(); } catch (e) { /* ignore */ }
            },
            pause() { if (audio) audio.pause(); }
        };
    }

    const buttonClickSound = createLazyAudio('../sfx/buttonClickSound.mp3');
    const cardFlipSound = createLazyAudio('../sfx/cardFlipSound.mp3');
    const matchSuccessSound = createLazyAudio('../sfx/matchSuccessSound.mp3');
    const matchFailSound = createLazyAudio('../sfx/matchFailSound.mp3');
    const gameWinSound = createLazyAudio('../sfx/gameWinSound.mp3');
    const gameOverSound = createLazyAudio('../sfx/gameOverSound.mp3');

    // --- Konfigurasi Game ---
    const imagePairs = {
        easy: [
            'img/1.svg', 'img/1.svg', 'img/2.svg', 'img/2.svg', 
            'img/3.svg', 'img/3.svg', 'img/4.svg', 'img/4.svg'
        ],
        medium: [
            'img/1.svg', 'img/1.svg', 'img/2.svg', 'img/2.svg', 
            'img/3.svg', 'img/3.svg', 'img/4.svg', 'img/4.svg',
            'img/5.svg', 'img/5.svg', 'img/6.svg', 'img/6.svg'
        ],
        hard: [
            'img/1.svg', 'img/1.svg', 'img/2.svg', 'img/2.svg', 
            'img/3.svg', 'img/3.svg', 'img/4.svg', 'img/4.svg',
            'img/5.svg', 'img/5.svg', 'img/6.svg', 'img/6.svg',
            'img/7.svg', 'img/7.svg', 'img/8.svg', 'img/8.svg'
        ]
    };

    const levelConfig = {
        easy: { pairs: 4, lives: 15, timeMultiplier: 1.5 },
        medium: { pairs: 6, lives: 12, timeMultiplier: 1.2 },
        hard: { pairs: 8, lives: 10, timeMultiplier: 1.0 }
    };

    // --- State Game ---
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matches = 0;
    let lives = 0;
    let wins = Number(localStorage.getItem("gameWins") || 0);
    let timer = 0;
    let timerInterval = null;
    let currentLevel = "easy";

    // --- Inisialisasi ---
    async function init() {
        welcomeMessage.textContent = `Welcome, ${username}!`;
        winsElement.textContent = wins;
        
        generateDoodleBackground();

        if (window.initializeLeaderboard) {
            window.initializeLeaderboard();
        }
        
        showScreen("menu");
    }

    // --- Latar Belakang Emoji Doodle ---
    function generateDoodleBackground() {
        const emojis = ["😊", "😂", "😍", "🤔", "😎", "🤩", "🥳", "🤯", "🤗", "🤖", "👽", "🤠", "🤡", "👹", "👻", "🦄", "🙏", "❤️", "🧠", "🏆", "🎲", "🎮", "🕹️", "🃏"];
        const width = window.innerWidth;
        const height = window.innerHeight;
        const doodleCount = Math.max(30, Math.floor((width * height) / 35000)); // Adjusted density
        let svgContent = '';

        for (let i = 0; i < doodleCount; i++) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 20 + 15;
            const rotation = Math.random() * 90 - 45;
            const opacity = Math.random() * 0.1 + 0.05;

            svgContent += `<text x="${x}" y="${y}" font-size="${size}" transform="rotate(${rotation}, ${x}, ${y})" fill="white" style="opacity: ${opacity};">${emoji}</text>`;
        }

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${svgContent}</svg>`;
        // Gunakan encodeURIComponent untuk menangani emoji dan karakter non-Latin1
        const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
        document.body.style.backgroundImage = `url("data:image/svg+xml;base64,${encodedSvg}")`;
    }

    // --- Manajemen Tampilan (Screen) ---
    function showScreen(screen) {
        mainMenu.classList.add("hidden");
        gameLayout.classList.add("hidden");

        if (screen === "menu") {
            document.body.classList.remove('game-active');
            userInfo.classList.remove("hidden");
            mainMenu.classList.remove("hidden");
        } else if (screen === "game") {
            document.body.classList.add('game-active');
            userInfo.classList.add("hidden"); // Sembunyikan user info saat game berjalan
            gameLayout.classList.remove("hidden");
            if (window.renderLeaderboard) {
                window.renderLeaderboard("in-game-list");
            }
        }
    }
    
    // --- Manajemen Popup (Modal) ---
    function showPopup({ title, content, closeCallback }) {
        popupRoot.innerHTML = ''; // Hapus popup sebelumnya
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        
        let popupHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h2>${title}</h2>
                    <button class="popup-close-btn" id="closePopupBtn"><i class="fas fa-times"></i></button>
                </div>
                <div class="popup-body">
                    ${content}
                </div>
            </div>
        `;
        popupOverlay.innerHTML = popupHTML;
        popupRoot.appendChild(popupOverlay);

        const closeAction = () => {
            popupRoot.innerHTML = '';
            if (closeCallback) {
                closeCallback();
            }
        };

        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) { // Hanya tutup jika klik di luar konten
                closeAction();
            }
        });

        document.getElementById("closePopupBtn").addEventListener("click", closeAction);
    }

    function showLevelSelectionPopup() {
        const content = `
            <div class="level-selection">
                <p>Choose your challenge. More difficult levels yield higher scores!</p>
                <div class="levels">
                    <button class="level-btn level-easy" data-level="easy">
                        <span class="level-icon">👶</span> <span class="level-text">Easy</span>
                    </button>
                    <button class="level-btn level-medium" data-level="medium">
                        <span class="level-icon">🧐</span> <span class="level-text">Medium</span>
                    </button>
                    <button class="level-btn level-hard" data-level="hard">
                        <span class="level-icon">🧠</span> <span class="level-text">Hard</span>
                    </button>
                </div>
            </div>
        `;
        showPopup({ title: "Select Difficulty", content });

        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                buttonClickSound.play();
                currentLevel = btn.dataset.level;
                popupRoot.innerHTML = ''; // Tutup popup
                showScreen("game");
                startGame();
            });
        });
    }

    function showHowToPlayPopup() {
        const content = `
            <div class="how-to-play">
                <p><strong>Objective:</strong> Find all the matching pairs of images!</p>
                <ul>
                    <li>Select a difficulty and the game begins.</li>
                    <li>Click on a card to flip it and reveal the image.</li>
                    <li>Flip a second card to see if it's a match.</li>
                    <li>If they match, they will be removed from the board. If not, they flip back down.</li>
                    <li>You have a limited number of lives (mismatches).</li>
                    <li>Try to clear the board as quickly as possible with the fewest moves!</li>
                </ul>
                <p>Good luck! 🧠</p>
            </div>
        `;
        showPopup({ title: "How to Play", content });
    }

    function showLeaderboardPopup() {
        const content = `
            <div id="popup-leaderboard-container">
                <ol id="popup-leaderboard-list"></ol>
            </div>
        `;
        showPopup({ title: "🏆 Global Leaderboard", content });
        if(window.renderLeaderboard) {
            window.renderLeaderboard("popup-leaderboard-list");
        }
    }
    
    // --- Logika Timer ---
    function startTimer() {
        timer = 0;
        timerElement.textContent = timer;
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = `${timer}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- Logika Game Utama ---
    function startGame() {
        boardElement.innerHTML = '';
        moves = 0;
        matches = 0;
        timer = 0;
        lives = levelConfig[currentLevel].lives;
        lockBoard = false;
        resetFlipState();

        movesElement.textContent = moves;
        matchesElement.textContent = matches;
        timerElement.textContent = `${timer}s`;
        livesElement.textContent = lives;

        const deck = createDeck(currentLevel);
        shuffle(deck);

        deck.forEach(imagePath => {
            const cardElement = createCardElement(imagePath);
            boardElement.appendChild(cardElement);
        });

        boardElement.style.gridTemplateColumns = `repeat(${currentLevel === 'easy' ? 4 : 4}, 1fr)`;

        startTimer();
    }

    function createDeck(level) {
        return imagePairs[level];
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createCardElement(imagePath) {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.value = imagePath; // Gunakan path gambar sebagai nilai unik
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imagePath}" alt="Card Image">
                </div>
                <div class="card-back">?</div>
            </div>
        `;
        card.addEventListener("click", () => flipCard(card));
        return card;
    }

    function flipCard(cardElement) {
        if (lockBoard || cardElement.classList.contains("flip") || cardElement.classList.contains("matched")) {
            return;
        }

        cardFlipSound.play();
        cardElement.classList.add("flip");

        if (!firstCard) {
            firstCard = { cardElement, value: cardElement.dataset.value };
        } else {
            secondCard = { cardElement, value: cardElement.dataset.value };
            moves++;
            movesElement.textContent = moves;
            checkForMatch();
        }
    }

    function checkForMatch() {
        lockBoard = true;
        if (firstCard.value === secondCard.value) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }
    
    function handleMatch() {
        matches++;
        matchesElement.textContent = matches;
        matchSuccessSound.play();
    
        // Tandai sebagai cocok untuk mencegah klik lebih lanjut
        firstCard.cardElement.classList.add("matched");
        secondCard.cardElement.classList.add("matched");
    
        // Hapus kartu dari papan setelah jeda
        setTimeout(() => {
            firstCard.cardElement.classList.add('removed');
            secondCard.cardElement.classList.add('removed');
            
            // Cek kemenangan setelah kartu dihapus
            if (matches === levelConfig[currentLevel].pairs) {
                stopTimer();
                wins++;
                winsElement.textContent = wins;
                localStorage.setItem("gameWins", wins);
                gameWinSound.play();
                
                const finalScore = calculateScore();
                if (window.updateLeaderboard) {
                    window.updateLeaderboard(finalScore);
                }
    
                setTimeout(() => showWinPopup(finalScore), 500);
            }
            resetFlipState(); // Reset state after the delay
        }, 1500);
    }
    
    function handleMismatch() {
        lives--;
        livesElement.textContent = lives;
        matchFailSound.play();
    
        if (lives <= 0) {
            stopTimer();
            gameOverSound.play();
            setTimeout(showLossPopup, 800);
            return;
        }
    
        setTimeout(() => {
            firstCard.cardElement.classList.remove("flip");
            secondCard.cardElement.classList.remove("flip");
            resetFlipState();
            // Check for game over after cards flip back
            if (lives <= 0) {
                stopTimer();
                gameOverSound.play();
                setTimeout(showLossPopup, 800);
            }
        }, 1500);
    }

    function showWinPopup(finalScore) {
        const content = `
            <div class="result-summary">
                <p>Your final score is:</p>
                <h3 class="final-score">${finalScore}</h3>
            </div>
            <div id="popup-leaderboard-container">
                <h4>Leaderboard</h4>
                <ol id="popup-leaderboard-list"></ol>
            </div>
            <div class="popup-actions">
                <button id="playAgainBtn"><i class="fas fa-redo"></i> Play Again</button>
                <button id="backToMenuPopupBtn"><i class="fas fa-home"></i> Main Menu</button>
            </div>
        `;

        const closeCallback = () => showScreen("menu");
        showPopup({ title: "🎉 You Win! 🎉", content, closeCallback });
        
        if (window.renderLeaderboard) {
            window.renderLeaderboard("popup-leaderboard-list");
        }

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            popupRoot.innerHTML = '';
            showLevelSelectionPopup();
        });
        document.getElementById('backToMenuPopupBtn').addEventListener('click', () => {
            popupRoot.innerHTML = '';
            showScreen('menu');
        });
    }

    function showLossPopup() {
        let suggestion = currentLevel !== 'easy' ? "<p>Maybe try an easier level? Keep practicing!</p>" : "<p>Don't give up! You'll get it next time.</p>";
        const content = `
            <div class="result-summary">
                <p>You've run out of lives.</p>
                ${suggestion}
            </div>
            <div class="popup-actions">
                <button id="playAgainBtn"><i class="fas fa-redo"></i> Try Again</button>
                <button id="backToMenuPopupBtn"><i class="fas fa-home"></i> Main Menu</button>
            </div>
        `;
        const closeCallback = () => showScreen("menu");
        showPopup({ title: "😭 Game Over 😭", content, closeCallback });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            popupRoot.innerHTML = '';
            showLevelSelectionPopup();
        });
        document.getElementById('backToMenuPopupBtn').addEventListener('click', () => {
            popupRoot.innerHTML = '';
            showScreen('menu');
        });
    }

    function resetFlipState() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }
    
    function calculateScore() {
        const baseScore = levelConfig[currentLevel].pairs * 50;
        const timePenalty = timer * 2;
        const movePenalty = moves * 5;
        const levelMultiplier = levelConfig[currentLevel].timeMultiplier;
        
        const finalScore = Math.floor(Math.max(0, (baseScore - timePenalty - movePenalty)) * levelMultiplier);
        return finalScore;
    }

    // --- Event Listeners ---
    playBtn.addEventListener("click", () => {
        buttonClickSound.play();
        showLevelSelectionPopup();
    });

    howToPlayBtn.addEventListener("click", () => {
        buttonClickSound.play();
        showHowToPlayPopup();
    });

    leaderboardBtn.addEventListener("click", () => {
        buttonClickSound.play();
        showLeaderboardPopup();
    });

    resetBtn.addEventListener("click", () => {
        buttonClickSound.play();
        stopTimer();
        startGame();
    });

    backToMenuBtn.addEventListener("click", () => {
        buttonClickSound.play();
        stopTimer();
        showScreen("menu");
    });
    
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        window.location.href = "login.html";
    });

    // --- Mulai Aplikasi ---
    init();
});