// --- User and Session Management ---
const username = sessionStorage.getItem("username");
if (!username) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM Elements ---
    const mainMenu = document.getElementById("main-menu");
    const gameContainer = document.getElementById("game-container");
    const boardElement = document.getElementById("game-board");
    const movesElement = document.getElementById("moves");
    const matchesElement = document.getElementById("matches");
    const livesElement = document.getElementById("lives");
    const winsElement = document.getElementById("wins");
    const timerElement = document.getElementById("timer");
    const playBtn = document.getElementById("playBtn");
    const resetBtn = document.getElementById("resetBtn"); 
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("user-info");
    const welcomeMessage = document.getElementById("welcome-message");
    
    // --- Audio Elements ---
    const cardFlipSound = document.getElementById("cardFlipSound");
    const matchSuccessSound = document.getElementById("matchSuccessSound");
    const matchFailSound = document.getElementById("matchFailSound");
    const gameOverSound = document.getElementById("gameOverSound");
    const gameWinSound = document.getElementById("gameWinSound");
    const buttonClickSound = document.getElementById("buttonClickSound");
    
    // --- Emoji Pairs ---
    const allEmojiPairs = [
        ["☔", "🌧️"], ["🍞", "🍳"], ["💡", "🔌"], ["🔥", "🍖"],
        ["⚽", "🥅"], ["📚", "✏️"], ["🎸", "🎶"], ["📱", "💬"],
    ];
    
    // --- Game State Variables ---
    let currentLevel = "easy";
    let deck = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matches = 0;
    let lives = 10;
    let wins = 0;
    let seconds = 0;
    let timerInterval = null;

    // --- Level Configuration ---
    const levelConfig = {
        easy: { pairs: 4, columns: 4, lives: 10 },
        medium: { pairs: 6, columns: 4, lives: 7 },
        hard: { pairs: 8, columns: 4, lives: 5 }
    };

    // --- Event Listeners ---
    playBtn.addEventListener("click", () => {
        buttonClickSound.play();
        const selectedLevel = document.querySelector('input[name="level"]:checked').value;
        currentLevel = selectedLevel;
        showScreen("game");
        startGame();
    });
    
    resetBtn.addEventListener("click", () => {
        buttonClickSound.play();
        startGame();
    });
    
    backToMenuBtn.addEventListener("click", () => {
        buttonClickSound.play();
        showScreen("menu");
    });

    logoutBtn.addEventListener("click", () => {
        buttonClickSound.play();
        sessionStorage.removeItem("username");
        window.location.href = "login.html";
    });

    // --- Screen Management ---
    function showScreen(screen) {
        if (screen === "menu") {
            mainMenu.classList.remove("hidden");
            gameContainer.classList.add("hidden");
            userInfo.classList.remove("hidden");
        } else if (screen === "game") {
            mainMenu.classList.add("hidden");
            gameContainer.classList.remove("hidden");
            userInfo.classList.remove("hidden");
        }
    }

    // --- Timer ---
    function startTimer() {
        stopTimer(); // Hentikan timer sebelumnya jika ada
        seconds = 0;
        timerElement.textContent = `${seconds}s`;
        timerInterval = setInterval(() => {
            seconds++;
            timerElement.textContent = `${seconds}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- Leaderboard ---
    async function initializeLeaderboard() {
        if (!localStorage.getItem("leaderboard")) {
            try {
                const response = await fetch("leaderboard.json");
                const data = await response.json();
                localStorage.setItem("leaderboard", JSON.stringify(data));
            } catch (error) {
                console.error("Could not load initial leaderboard:", error);
                localStorage.setItem("leaderboard", "[]");
            }
        }
    }

    function updateLeaderboard(newScore) {
        let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        const userIndex = leaderboard.findIndex(entry => entry.username === username);

        if (userIndex !== -1) {
            // User exists, update only if the new score is higher
            if (newScore > leaderboard[userIndex].score) {
                leaderboard[userIndex].score = newScore;
            }
        } else {
            // User does not exist, add them
            leaderboard.push({ username: username, score: newScore });
        }

        leaderboard.sort((a, b) => b.score - a.score); // Sort descending
        leaderboard = leaderboard.slice(0, 10); // Keep top 10
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    }
    
    function calculateScore() {
        const score = (lives * 100) + (levelConfig[currentLevel].pairs * 50) - moves - seconds;
        return Math.max(score, 10); // Minimum score of 10
    }

    // --- Game Logic ---
    function startGame() {
        boardElement.innerHTML = "";
        moves = 0;
        matches = 0;
        const config = levelConfig[currentLevel];
        lives = config.lives;
        lockBoard = false;
        firstCard = null;
        secondCard = null;

        movesElement.textContent = moves;
        matchesElement.textContent = matches;
        livesElement.textContent = lives;

        deck = createDeck(config.pairs);
        deck = shuffle(deck);

        boardElement.style.gridTemplateColumns = `repeat(${config.columns}, 80px)`;
        const boardWidth = config.columns * 80 + (config.columns - 1) * 10;
        boardElement.style.width = `${boardWidth}px`;

        deck.forEach((card, index) => {
            const cardElement = createCardElement(card, index);
            boardElement.appendChild(cardElement);
        });
        
        startTimer();
    }
    
    function createDeck(numPairs) {
        let tempDeck = [];
        const availablePairs = [...allEmojiPairs];
        shuffle(availablePairs); // Randomize which pairs are chosen
        const selectedPairs = availablePairs.slice(0, numPairs);
        selectedPairs.forEach((pair, idx) => {
            tempDeck.push({ emoji: pair[0], pairId: idx });
            tempDeck.push({ emoji: pair[1], pairId: idx });
        });
        return tempDeck;
    }
    
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function createCardElement(cardData, index) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = index;
    
        const inner = document.createElement("div");
        inner.classList.add("card-inner");
    
        const front = document.createElement("div");
        front.classList.add("card-front");
        front.textContent = cardData.emoji;
    
        const back = document.createElement("div");
        back.classList.add("card-back");
        back.textContent = "❓";
    
        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);
    
        card.classList.add("flip"); 
    
        card.addEventListener("click", () => flipCard(cardData, card));
        return card;
    }
    
    function flipCard(cardData, cardElement) {
        if (lockBoard || !cardElement.classList.contains("flip") || firstCard === cardElement) {
            return;
        }
    
        cardFlipSound.play();
        cardElement.classList.remove("flip");
    
        if (!firstCard) {
            firstCard = { cardData, cardElement };
            return;
        }
    
        secondCard = { cardData, cardElement };
        lockBoard = true;
        moves++;
        movesElement.textContent = moves;
    
        checkForMatch();
    }
    
    function checkForMatch() {
        const isMatch = firstCard.cardData.pairId === secondCard.cardData.pairId;
        isMatch ? handleMatch() : handleMismatch();
    }
    
    function handleMatch() {
        matches++;
        matchesElement.textContent = matches;
        matchSuccessSound.play();
    
        firstCard.cardElement.classList.add("matched");
        secondCard.cardElement.classList.add("matched");
    
        resetFlipState();
    
        if (matches === levelConfig[currentLevel].pairs) {
            stopTimer();
            wins++;
            winsElement.textContent = wins;
            gameWinSound.play();
            const finalScore = calculateScore();
            updateLeaderboard(finalScore);

            setTimeout(() => {
                alert(`🎉 You Win!\nYour Score: ${finalScore}`);
                showScreen("menu");
            }, 500);
        }
    }
    
    function handleMismatch() {
        lives--;
        livesElement.textContent = lives;
        matchFailSound.play();
    
        if (lives <= 0) {
            stopTimer();
            gameOverSound.play();
            setTimeout(() => {
                alert("😭 Game Over! You ran out of lives.");
                showScreen("menu");
            }, 800);
            return;
        }
    
        setTimeout(() => {
            firstCard.cardElement.classList.add("flip");
            secondCard.cardElement.classList.add("flip");
            resetFlipState();
        }, 800);
    }
    
    function resetFlipState() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }
    
    // --- Initial Setup ---
    async function init() {
        welcomeMessage.textContent = `Welcome, ${username}!`;
        await initializeLeaderboard();
        showScreen("menu");
    }

    init();
});
