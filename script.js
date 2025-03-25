const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const encouragementText = document.getElementById("encouragement-text");
const textBox = document.querySelector(".text-box");
const sprite = document.querySelector(".sprite");

// Game settings
const gridSize = 20;
let tileCountX, tileCountY;

// Snake and food
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 }; // Buffer for direction changes
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameSpeed = 100;
let isPaused = true; // Start paused
let gameStarted = false;

// Difficulty settings
const difficulties = {
  Easy: 150,
  Medium: 100,
  Hard: 50,
};
let currentDifficulty = "Medium";

// Encouraging messages
const messages = [
  "You're doing great! Keep going! 🌟",
  "Wow, you're amazing! 🐍",
  "Don't give up! You've got this! 💪",
  "Yay! You're a snake superstar! 🎉",
  "Keep slithering! You're unstoppable! 🚀",
  "So close! Just a little more! 🍎",
  "You're on fire! 🔥",
  "Snake-tastic! Keep it up! 🐍✨",
];

// Display encouragement with animations
function showEncouragement() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  encouragementText.textContent = randomMessage;

  // Reset and trigger animations
  textBox.style.animation = "none";
  sprite.style.animation = "none";
  setTimeout(() => {
    textBox.style.animation = "pop 0.5s ease-in-out";
    sprite.style.animation = "shake 0.5s ease-in-out";
  }, 10);
}

// Resize canvas responsively
function resizeCanvas() {
  const maxWidth = Math.min(400, window.innerWidth * 0.9);
  const maxHeight = Math.min(400, window.innerHeight * 0.7);

  tileCountX = Math.floor(maxWidth / gridSize);
  tileCountY = Math.floor(maxHeight / gridSize);

  canvas.width = tileCountX * gridSize;
  canvas.height = tileCountY * gridSize;
}

// Main game loop
function gameLoop() {
  if (!isPaused && gameStarted) {
    update();
  }
  draw();
  setTimeout(gameLoop, gameSpeed);
}

// Update game state
function update() {
  // Apply buffered direction
  direction = { ...nextDirection };

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collision
  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
    gameOver();
    return;
  }

  // Self collision
  if (snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
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

// Draw everything
function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1); // -1 for grid lines
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 1,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw UI
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`High Score: ${highScore}`, 10, 40);
  ctx.fillText(`Difficulty: ${currentDifficulty}`, 10, 60);

  // Draw pause/game over messages
  if (!gameStarted) {
    ctx.font = "24px Arial";
    ctx.fillText("Press Space to Start", canvas.width / 2 - 100, canvas.height / 2);
  } else if (isPaused) {
    ctx.font = "24px Arial";
    ctx.fillText("PAUSED", canvas.width / 2 - 50, canvas.height / 2);
  }
}

// Place food avoiding snake
function placeFood() {
  const safeAreaHeight = tileCountY - 2;
  
  do {
    food = {
      x: Math.floor(Math.random() * tileCountX),
      y: Math.floor(Math.random() * safeAreaHeight)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Increase difficulty gradually
function increaseSpeed() {
  gameSpeed = Math.max(50, difficulties[currentDifficulty] - (score * 2));
}

// Game over handler
function gameOver() {
  isPaused = true;
  gameStarted = false;
  setTimeout(resetGame, 1500); // Brief delay before reset
}

// Reset game state
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  score = 0;
  gameSpeed = difficulties[currentDifficulty];
  placeFood();
}

// Input handling
document.addEventListener("keydown", e => {
  if (!gameStarted && e.key === " ") {
    gameStarted = true;
    isPaused = false;
    return;
  }

  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
    case " ":
      if (gameStarted) isPaused = !isPaused;
      break;
  }
});

// Difficulty selector
const difficultySelector = document.createElement("select");
difficultySelector.innerHTML = `
  <option value="Easy">Easy</option>
  <option value="Medium" selected>Medium</option>
  <option value="Hard">Hard</option>
`;
document.querySelector(".difficulty-container").appendChild(difficultySelector);

difficultySelector.addEventListener("change", () => {
  currentDifficulty = difficultySelector.value;
  resetGame();
});

// Start/Pause button
const startPauseButton = document.createElement("button");
startPauseButton.textContent = "Start/Pause";
document.querySelector(".start-pause-container").appendChild(startPauseButton);

startPauseButton.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
  }
  isPaused = !isPaused;
});

// Window resize handler
window.addEventListener("resize", () => {
  resizeCanvas();
  resetGame();
});

// Initialize game
resizeCanvas();
placeFood();
gameLoop();
