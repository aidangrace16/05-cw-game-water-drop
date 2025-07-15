let score = 0;
let timeLeft = 15;
let lives = 3;
let gameInterval;
let dropInterval;
let contaminatedInterval;
let milestonesShown = new Set();
let currentDifficulty = 'normal';

// Difficulty settings
const difficultySettings = {
  easy: {
    time: 20,
    dropSpeed: 500,
    cleanDropChance: 0.7,
    canDropChance: 0.2,
    contaminatedChance: 0.1,
    contaminatedSpawnRate: 3000,
    lives: 3
  },
  normal: {
    time: 15,
    dropSpeed: 400,
    cleanDropChance: 0.6,
    canDropChance: 0.25,
    contaminatedChance: 0.15,
    contaminatedSpawnRate: 2500,
    lives: 3
  },
  hard: {
    time: 12,
    dropSpeed: 300,
    cleanDropChance: 0.45,
    canDropChance: 0.25,
    contaminatedChance: 0.3,
    contaminatedSpawnRate: 2000,
    lives: 1
  }
};

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const gameContainer = document.getElementById("game-container");
const gameOverScreen = document.getElementById("game-over");
const finalScoreEl = gameOverScreen.querySelector(".final-score");
const restartBtn = document.getElementById("restart-btn");
const gameOverMsg = gameOverScreen.querySelector("p:not(.final-score)");
const startScreen = document.getElementById("start-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const mainGame = document.getElementById("main-game");
const chooseDifficultyBtn = document.getElementById("choose-difficulty-btn");
const backBtn = document.getElementById("back-btn");
const gameWrapper = document.querySelector('.game-wrapper');
const resetBtn = document.getElementById("reset-btn");

const milestoneMessages = [
  { score: 100, message: "You're helping more families!" },
  { score: 200, message: "Amazing! Even more families helped!" },
  { score: 300, message: "You're a true Hydro Hero!" },
  { score: 400, message: "Woah..." }
];

// Wait for DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  chooseDifficultyBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    difficultyScreen.style.display = "flex";
  });

  backBtn.addEventListener("click", () => {
    difficultyScreen.style.display = "none";
    startScreen.style.display = "flex";
  });

  // Add event listeners for difficulty buttons
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Get the button element, not just the event target
      const button = e.currentTarget;
      currentDifficulty = button.dataset.difficulty;
      console.log('Button clicked, difficulty set to:', currentDifficulty);
      difficultyScreen.style.display = "none";
      mainGame.style.display = "";
      gameWrapper.classList.remove('centered-screen');
      startGame();
    });
  });

  // Restart button handler
  restartBtn.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    difficultyScreen.style.display = "flex";
    gameWrapper.classList.add('centered-screen');
  });

  // Reset button handler
  resetBtn.addEventListener("click", () => {
    // End current game and start a new one
    clearInterval(gameInterval);
    clearInterval(dropInterval);
    startGame();
  });

  // On initial load, center the start screen
  if (startScreen.style.display !== "none") {
    gameWrapper.classList.add('centered-screen');
  }
});

function startGame() {
  resetGame();
  // Hide Game Over screen if visible
  gameOverScreen.style.display = "none";
  mainGame.style.display = "";
  gameContainer.style.display = "";
  document.querySelector(".lives").style.display = "";
  document.querySelector(".score-panel").style.display = "";

  // Add difficulty-specific styling
  gameContainer.className = "";
  if (currentDifficulty === 'easy') {
    gameContainer.classList.add('village-well');
  }

  // Set time based on difficulty
  const settings = difficultySettings[currentDifficulty];
  console.log('Starting game with difficulty:', currentDifficulty, 'settings:', settings);
  timeLeft = settings.time;
  timeEl.textContent = timeLeft;

  gameInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0 || lives <= 0) {
      endGame();
      return; // Stop further execution in this interval tick
    }
  }, 1000);
  dropInterval = setInterval(spawnDrop, settings.dropSpeed);
  contaminatedInterval = setInterval(spawnContaminatedDrop, settings.contaminatedSpawnRate);
  gameWrapper.classList.remove('centered-screen');
}

function resetGame() {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  clearInterval(contaminatedInterval);
  score = 0;
  const settings = difficultySettings[currentDifficulty];
  timeLeft = settings.time;
  lives = settings.lives;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  livesEl.textContent = "❤️".repeat(lives);
  gameContainer.innerHTML = "";
  milestonesShown.clear();
}

function spawnDrop() {
  const drop = document.createElement("div");
  drop.classList.add("drop");

  // Prevent drag events on drops
  drop.draggable = false;
  drop.addEventListener('dragstart', e => e.preventDefault());

  const settings = difficultySettings[currentDifficulty];
  const rand = Math.random();
  
  if (rand < settings.cleanDropChance) {
    drop.innerHTML = '<img src="img/clean_drop.png" alt="Clean Drop" style="width:100%;height:100%;">';
    drop.dataset.points = "10";
  } else if (rand < settings.cleanDropChance + settings.canDropChance) {
    drop.innerHTML = '<img src="img/water-can-transparent.png" alt="Water Can" style="width:100%;height:100%;">';
    drop.dataset.points = "20";
  } else {
    // Make contaminated drop slightly smaller
    drop.innerHTML = '<img src="img/contaminated_drop.png" alt="Contaminated Drop" style="width:85%;height:85%;display:block;margin:auto;">';
    drop.dataset.bad = "true";
  }

  // Responsive spawn: wider range on large screens
  let containerWidth = gameContainer.offsetWidth;
  let dropWidth = window.matchMedia('(min-width: 700px)').matches ? 70 : 40;
  let maxLeft = containerWidth - dropWidth;
  drop.style.left = Math.random() * maxLeft + "px";

  drop.addEventListener("click", (e) => {
    // Show correct feedback above the drop
    if (drop.dataset.bad) {
      lives--;
      livesEl.textContent = "❤️".repeat(lives);
      showFeedback(drop, "-1 ❤️", e);
      if (lives <= 0) {
        endGame();
        return; // Stop further execution if lives are exhausted
      }
    } else {
      score += parseInt(drop.dataset.points);
      scoreEl.textContent = score;
      showFeedback(drop, "+" + drop.dataset.points, e);
      checkMilestones();
    }
    drop.remove();
  });

  drop.addEventListener("animationend", () => drop.remove());
  gameContainer.appendChild(drop);
}

function spawnContaminatedDrop() {
  const drop = document.createElement("div");
  drop.classList.add("drop");

  // Prevent drag events on drops
  drop.draggable = false;
  drop.addEventListener('dragstart', e => e.preventDefault());

  // Always spawn contaminated drop
  drop.innerHTML = '<img src="img/contaminated_drop.png" alt="Contaminated Drop" style="width:85%;height:85%;display:block;margin:auto;">';
  drop.dataset.bad = "true";

  // Responsive spawn: wider range on large screens
  let containerWidth = gameContainer.offsetWidth;
  let dropWidth = window.matchMedia('(min-width: 700px)').matches ? 70 : 40;
  let maxLeft = containerWidth - dropWidth;
  drop.style.left = Math.random() * maxLeft + "px";

  drop.addEventListener("click", (e) => {
    lives--;
    livesEl.textContent = "❤️".repeat(lives);
    showFeedback(drop, "-1 ❤️", e);
    if (lives <= 0) {
      endGame();
      return;
    }
    drop.remove();
  });

  drop.addEventListener("animationend", () => drop.remove());
  gameContainer.appendChild(drop);
}

function showFeedback(drop, text, event) {
  const fb = document.createElement("div");
  fb.className = "feedback";
  fb.textContent = text;

  // Calculate position relative to gameContainer
  let dropRect = drop.getBoundingClientRect();
  let containerRect = gameContainer.getBoundingClientRect();
  let left = dropRect.left - containerRect.left;
  let top = dropRect.top - containerRect.top;

  // Position feedback above the drop
  fb.style.left = `${left}px`;
  fb.style.top = `${top - 30}px`;

  gameContainer.appendChild(fb);
  setTimeout(() => fb.remove(), 1000);
}

// Add this function after showFeedback
function checkMilestones() {
  for (const milestone of milestoneMessages) {
    if (score >= milestone.score && !milestonesShown.has(milestone.score)) {
      showMilestoneMessage(milestone.message);
      milestonesShown.add(milestone.score);
    }
  }
}

function showMilestoneMessage(message) {
  // Only one milestone message at a time
  const milestoneContainer = document.getElementById("milestone-container");
  if (document.getElementById("milestone-msg")) return;
  const msg = document.createElement("div");
  msg.id = "milestone-msg";
  msg.className = "milestone-message";
  msg.textContent = message;
  milestoneContainer.appendChild(msg);
  setTimeout(() => {
    msg.remove();
  }, 1500);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  clearInterval(contaminatedInterval);
  // Hide game UI, show Game Over screen
  gameContainer.style.display = "none";
  mainGame.style.display = "none";
  document.querySelector(".lives").style.display = "none";
  document.querySelector(".score-panel").style.display = "none";

  // Determine highest milestone reached
  let milestoneMsg = "";
  let highest = 0;
  for (const milestone of milestoneMessages) {
    if (score >= milestone.score && milestone.score > highest) {
      milestoneMsg = milestone.message;
      highest = milestone.score;
    }
  }

  // Call showConfetti if score is 100 or more
  if (score >= 100 && lives > 0 && typeof showConfetti === "function") {
    showConfetti();
  }

  if (lives <= 0) {
    finalScoreEl.textContent = "You ran out of lives :(";
    if (milestoneMsg) {
      gameOverMsg.textContent = milestoneMsg + " Try again to become a Hydro Hero!";
    } else {
      gameOverMsg.textContent = "Try again to become a Hydro Hero!";
    }
  } else {
    finalScoreEl.textContent = "Final Score: " + score;
    if (milestoneMsg) {
      gameOverMsg.textContent = milestoneMsg + " Thank you for playing and supporting clean water!";
    } else {
      gameOverMsg.textContent = "Thank you for playing and supporting clean water!";
    }
  }
  gameOverScreen.style.display = "flex";
  gameWrapper.classList.add('centered-screen');
}