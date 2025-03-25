const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const encouragementText = document.getElementById("encouragement-text");
const textBox = document.querySelector(".text-box");
const sprite = document.querySelector(".sprite");
const encouragementContainer = document.querySelector(".encouragement-container");

// Game settings
const gridSize = 20;
let tileCountX, tileCountY;

// Snake and food
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameSpeed = 100;
let isPaused = false;

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

// Show a random encouraging message
function showEncouragement() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  encouragementText.textContent = randomMessage;

  textBox.style.animation = "none";
  setTimeout(() => {
    textBox.style.animation = "pop 0.5s ease-in-out";
  }, 10);

  sprite.style.animation = "none";
  setTimeout(() => {
    sprite.style.animation = "shake 0.5s ease-in-out";
  }, 10);
}

// Resize canvas to fit the screen
function resizeCanvas() {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.8;

  tileCountX = Math.floor(maxWidth / gridSize);
  tileCountY = Math.floor(maxHeight / gridSize);

  canvas.width = tileCountX * gridSize;
  canvas.height = tileCountY * gridSize;
}

// Game loop
function gameLoop() {
  if (!isPaused) {
    update();
    draw();
  }
  setTimeout(gameLoop, gameSpeed);
}

// Update game state
function update() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
    gameOver();
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

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

// Draw game elements
function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);
  ctx.fillText(`Difficulty: ${currentDifficulty}`, 10, 90);

  if (isPaused) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Paused", canvas.width / 2 - 50, canvas.height / 2);
  }
}

// Place food randomly
function placeFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCountX),
      y: Math.floor(Math.random() * (tileCountY - 2))
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  food = newFood;
}

// Increase game speed
function increaseSpeed() {
  if (gameSpeed > 50) {
    gameSpeed -= 1;
  }
}

// Game over logic
function gameOver() {
  alert(`Game Over! Your score: ${score}`);
  resetGame();
}

// Reset game
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  gameSpeed = difficulties[currentDifficulty];
  placeFood();
}

// Handle keyboard input
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
    case " ":
      isPaused = !isPaused;
      break;
  }
});

// Difficulty selector
const difficultyContainer = document.createElement("div");
difficultyContainer.classList.add("difficulty-container");
document.body.appendChild(difficultyContainer);

const difficultySelector = document.createElement("select");
difficultySelector.innerHTML = `
  <option value="Easy">Easy</option>
  <option value="Medium" selected>Medium</option>
  <option value="Hard">Hard</option>
`;
difficultyContainer.appendChild(difficultySelector);

difficultySelector.addEventListener("change", () => {
  currentDifficulty = difficultySelector.value;
  resetGame();
});

// Start/Pause button
const startPauseContainer = document.createElement("div");
startPauseContainer.classList.add("start-pause-container");
document.body.appendChild(startPauseContainer);

const startPauseButton = document.createElement("button");
startPauseButton.innerText = "Start/Pause";
startPauseContainer.appendChild(startPauseButton);

startPauseButton.addEventListener("click", () => {
  isPaused = !isPaused;
});

// Resize canvas on window resize
window.addEventListener("resize", () => {
  resizeCanvas();
  resetGame();
});

// Initialize game
resizeCanvas();
placeFood();
gameLoop();
