// DOM Elements
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const encouragementText = document.getElementById("encouragement-text");
const sprite = document.querySelector(".sprite");

// Game Constants
const GRID_SIZE = 20;
const TILE_COUNT = 20; // 400px canvas / 20px grid

// Game State
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameSpeed = 100;
let isPaused = true;
let gameStarted = false;

// Difficulty Levels
const difficulties = {
  Easy: 150,
  Medium: 100,
  Hard: 50
};
let currentDifficulty = "Medium";

// Encouragement Messages
const messages = [
  "Great job! Keep going! 🌟",
  "You're a snake charmer! 🐍",
  "Unstoppable! 💪",
  "Snake-tastic! 🎉",
  "Legendary! 🏆",
  "Wow! Just wow! ✨",
  "You're on fire! 🔥",
  "Perfect moves! 👑"
];

// Initialize Canvas
function setupCanvas() {
  canvas.width = 400;
  canvas.height = 400;
}

// Game Loop
function gameLoop() {
  if (!isPaused && gameStarted) update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}

// Update Game State
function update() {
  direction = { ...nextDirection };
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver();
    return;
  }

  // Self collision
  if (snake.some((seg, i) => i > 0 && seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    placeFood();
    increaseSpeed();
    showEncouragement();
  } else {
    snake.pop();
  }
}

// Draw Game
function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach(seg => {
    ctx.fillRect(seg.x * GRID_SIZE, seg.y * GRID_SIZE, GRID_SIZE-1, GRID_SIZE-1);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE/2,
    food.y * GRID_SIZE + GRID_SIZE/2,
    GRID_SIZE/2 - 1, 0, Math.PI * 2
  );
  ctx.fill();

  // Draw UI
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`High Score: ${highScore}`, 10, 40);
  ctx.fillText(`Difficulty: ${currentDifficulty}`, 10, 60);

  // Game messages
  if (!gameStarted) {
    ctx.font = "24px Arial";
    ctx.fillText("Press SPACE to Start", 70, 200);
  } else if (isPaused) {
    ctx.font = "24px Arial";
    ctx.fillText("PAUSED", 160, 200);
  }
}

// Game Functions
function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
}

function increaseSpeed() {
  gameSpeed = Math.max(50, difficulties[currentDifficulty] - (score * 2));
}

function showEncouragement() {
  encouragementText.textContent = messages[Math.floor(Math.random() * messages.length)];
  sprite.classList.remove("shake");
  encouragementText.parentElement.classList.remove("pop");
  setTimeout(() => {
    sprite.classList.add("shake");
    encouragementText.parentElement.classList.add("pop");
  }, 10);
}

function gameOver() {
  isPaused = true;
  gameStarted = false;
  encouragementText.textContent = "Game Over! Press SPACE";
  setTimeout(resetGame, 1000);
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  score = 0;
  gameSpeed = difficulties[currentDifficulty];
  placeFood();
}

// Event Listeners
document.addEventListener("keydown", e => {
  if (!gameStarted && e.key === " ") {
    gameStarted = true;
    isPaused = false;
    return;
  }

  switch (e.key) {
    case "ArrowUp": if (direction.y === 0) nextDirection = { x: 0, y: -1 }; break;
    case "ArrowDown": if (direction.y === 0) nextDirection = { x: 0, y: 1 }; break;
    case "ArrowLeft": if (direction.x === 0) nextDirection = { x: -1, y: 0 }; break;
    case "ArrowRight": if (direction.x === 0) nextDirection = { x: 1, y: 0 }; break;
    case " ": isPaused = !isPaused; break;
  }
});

// UI Controls
const difficultySelector = document.createElement("select");
difficultySelector.innerHTML = `
  <option value="Easy">Easy</option>
  <option value="Medium" selected>Medium</option>
  <option value="Hard">Hard</option>
`;
difficultySelector.addEventListener("change", () => {
  currentDifficulty = difficultySelector.value;
  resetGame();
});
document.querySelector(".difficulty-container").appendChild(difficultySelector);

const pauseButton = document.createElement("button");
pauseButton.textContent = "Pause/Resume";
pauseButton.addEventListener("click", () => {
  if (!gameStarted) gameStarted = true;
  isPaused = !isPaused;
});
document.querySelector(".start-pause-container").appendChild(pauseButton);

// Initialize Game
setupCanvas();
placeFood();
gameLoop();
