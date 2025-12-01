// --- DOM Elements ---
const mainMenu = document.getElementById("main-menu");
const gameContainer = document.getElementById("game-container");
const boardElement = document.getElementById("game-board");
const movesElement = document.getElementById("moves");
const matchesElement = document.getElementById("matches");
const livesElement = document.getElementById("lives");
const winsElement = document.getElementById("wins");
const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");

// --- Audio Elements ---
const cardFlipSound = document.getElementById("cardFlipSound");
const matchSuccessSound = document.getElementById("matchSuccessSound");
const matchFailSound = document.getElementById("matchFailSound");
const gameOverSound = document.getElementById("gameOverSound");
const gameWinSound = document.getElementById("gameWinSound");
const buttonClickSound = document.getElementById("buttonClickSound");

// --- Emoji Pairs ---
const allEmojiPairs = [
    ["☔", "🌧️"],   // hujan
    ["🍞", "🍳"],   // sarapan
    ["💡", "🔌"],   // listrik
    ["🔥", "🍖"],   // masak
    ["⚽", "🥅"],   // sepak bola
    ["📚", "✏️"],   // belajar
    ["🎸", "🎶"],   // musik
    ["📱", "💬"],   // chat
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

// --- Screen Management ---
function showScreen(screen) {
    if (screen === "menu") {
        mainMenu.classList.remove("hidden");
        gameContainer.classList.add("hidden");
    } else {
        mainMenu.classList.add("hidden");
        gameContainer.classList.remove("hidden");
    }
}

// --- Game Logic ---
function startGame() {
    // Reset game board and stats
    boardElement.innerHTML = "";
    moves = 0;
    matches = 0;
    const config = levelConfig[currentLevel];
    lives = config.lives;
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    // Update UI
    movesElement.textContent = moves;
    matchesElement.textContent = matches;
    livesElement.textContent = lives;

    // Create and shuffle the deck based on the level
    deck = createDeck(config.pairs);
    deck = shuffle(deck);

    // Set up the game board grid
    boardElement.style.gridTemplateColumns = `repeat(${config.columns}, 80px)`;
    const boardWidth = config.columns * 80 + (config.columns - 1) * 10;
    boardElement.style.width = `${boardWidth}px`;


    // Create and display card elements
    deck.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        boardElement.appendChild(cardElement);
    });
}

function createDeck(numPairs) {
    let tempDeck = [];
    const selectedPairs = allEmojiPairs.slice(0, numPairs);
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

    card.addEventListener("click", () => flipCard(cardData, card));
    return card;
}

function flipCard(cardData, cardElement) {
    if (lockBoard || cardElement.classList.contains("flip") || firstCard === cardElement) {
        return;
    }

    cardFlipSound.play(); // Play card flip sound

    cardElement.classList.add("flip");

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
    matchSuccessSound.play(); // Play match success sound

    // Add 'matched' class to the cards to make them disappear
    firstCard.cardElement.classList.add("matched");
    secondCard.cardElement.classList.add("matched");

    resetFlipState();

    if (matches === levelConfig[currentLevel].pairs) {
        wins++;
        winsElement.textContent = wins;
        gameWinSound.play(); // Play game win sound
        setTimeout(() => {
            alert("🎉 You Win!");
            if (wins >= 3) {
                alert("You've won 3 times! Resetting game.");
                wins = 0;
                winsElement.textContent = wins;
                showScreen("menu");
            } else {
                startGame();
            }
        }, 500);
    }
}

function handleMismatch() {
    lives--;
    livesElement.textContent = lives;
    matchFailSound.play(); // Play match fail sound

    if (lives <= 0) {
        gameOverSound.play(); // Play game over sound
        setTimeout(() => {
            alert("😭 Game Over! You ran out of lives.");
            showScreen("menu");
        }, 800);
        return;
    }

    setTimeout(() => {
        firstCard.cardElement.classList.remove("flip");
        secondCard.cardElement.classList.remove("flip");
        resetFlipState();
    }, 800);
}

function resetFlipState() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// --- Initial Setup ---
showScreen("menu");
