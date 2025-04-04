const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const encouragementText = document.getElementById("encouragement-text");
const textBox = document.querySelector(".text-box");
const sprite = document.querySelector(".sprite");
const encouragementContainer = document.querySelector(".encouragement-container");

// Game settings
const gridSize = 20; // Size of each grid square
let tileCountX, tileCountY; // Number of tiles in a row/column (calculated dynamically)

// Snake and food
let snake = [{ x: 10, y: 10 }]; // Initial snake position
let food = { x: 5, y: 5 }; // Initial food position
let direction = { x: 0, y: 0 }; // Snake direction
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // Load high score
let gameSpeed = 100; // Initial game speed
let isPaused = false;

// Difficulty settings
const difficulties = {
  Easy: 150, // Slower pace
  Medium: 100, // Normal pace
  Hard: 50, // Faster pace
};
let currentDifficulty = "Medium"; // Default difficulty

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

// Display a random encouraging message
function showEncouragement() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  encouragementText.textContent = randomMessage;

  // Trigger pop animation for text box
  textBox.style.animation = "none"; // Reset animation
  setTimeout(() => {
    textBox.style.animation = "pop 0.5s ease-in-out";
  }, 10);

  // Trigger shake animation for sprite
  sprite.style.animation = "none"; // Reset animation
  setTimeout(() => {
    sprite.style.animation = "shake 0.5s ease-in-out";
  }, 10);
}

// Resize canvas to fit the screen
function resizeCanvas() {
  const maxWidth = window.innerWidth * 0.9; // 90% of screen width
  const maxHeight = window.innerHeight * 0.8; // 80% of screen height

  // Calculate the number of tiles that fit
  tileCountX = Math.floor(maxWidth / gridSize);
  tileCountY = Math.floor(maxHeight / gridSize);

  // Set canvas dimensions
  canvas.width = tileCountX * gridSize;
  canvas.height = tileCountY * gridSize;
}

// Game loop
function gameLoop() {
  if (!isPaused) {
    update();
    draw();
  }
  setTimeout(gameLoop, gameSpeed); // Adjust speed dynamically
}

// Update game state
function update() {
  // Move snake
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Check for wall collision
  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
    gameOver();
    return;
  }

  // Check for self-collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  // Add new head
  snake.unshift(head);

  // Check for food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore); // Save high score
    }
    placeFood();
    increaseSpeed(); // Increase speed as score increases

    // Show encouragement and trigger animations
    showEncouragement();
  } else {
    snake.pop(); // Remove tail if no food eaten
  }
}

// Draw game elements
function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Draw score and high score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);

  // Draw difficulty
  ctx.fillText(`Difficulty: ${currentDifficulty}`, 10, 90);

  // Draw pause message
  if (isPaused) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Paused", canvas.width / 2 - 50, canvas.height / 2);
  }
}

// Place food randomly
function placeFood() {
  // Define the safe area for food (exclude the bottom area where the encouragement text box is)
  const safeAreaHeight = tileCountY - 2; // Reserve 2 rows at the bottom

  // Generate food position within the safe area
  food = {
    x: Math.floor(Math.random() * tileCountX),
    y: Math.floor(Math.random() * safeAreaHeight)
  };

  // Ensure food doesn't spawn on the snake
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    placeFood(); // Recursively place food again
  }
}

// Increase game speed as score increases
function increaseSpeed() {
  if (gameSpeed > 50) {
    gameSpeed -= 2; // Decrease interval to increase speed
  }
}

// Game over logic
function gameOver() {
  resetGame();
}

// Reset game
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  gameSpeed = difficulties[currentDifficulty]; // Reset speed based on difficulty
  placeFood();
}

// Handle keyboard input
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 }; // Prevent reversing direction
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 }; // Prevent reversing direction
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 }; // Prevent reversing direction
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 }; // Prevent reversing direction
      break;
    case " ": // Spacebar to pause/resume
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
  resetGame(); // Reset game with new difficulty
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

// Resize canvas when the window is resized
window.addEventListener("resize", () => {
  resizeCanvas();
  resetGame();
});

// Start the game
resizeCanvas(); // Initialize canvas size
placeFood();
gameLoop();
