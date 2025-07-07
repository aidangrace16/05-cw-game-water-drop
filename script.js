let score = 0;
let timeLeft = 15;
let lives = 3;
let gameInterval;
let dropInterval;
let milestonesShown = new Set();

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const gameContainer = document.getElementById("game-container");
const gameOverScreen = document.getElementById("game-over");
const finalScoreEl = gameOverScreen.querySelector(".final-score");
const restartBtn = document.getElementById("restart-btn");
const gameOverMsg = gameOverScreen.querySelector("p:not(.final-score)");
const startScreen = document.getElementById("start-screen");
const mainGame = document.getElementById("main-game");
const startBtn = document.getElementById("start-btn");
const gameWrapper = document.querySelector('.game-wrapper');
const resetBtn = document.getElementById("reset-btn");

const milestoneMessages = [
  { score: 100, message: "You're helping more families!" },
  { score: 200, message: "Amazing! Even more families helped!" },
  { score: 300, message: "You’re a true Hydro Hero!" },
  { score: 400, message: "Woah..." }
];

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  mainGame.style.display = "";
  gameWrapper.classList.remove('centered-screen');
  startGame();
});

function startGame() {
  resetGame();
  // Hide Game Over screen if visible
  gameOverScreen.style.display = "none";
  mainGame.style.display = "";
  gameContainer.style.display = "";
  document.querySelector(".lives").style.display = "";
  document.querySelector(".score-panel").style.display = "";

  gameInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0 || lives <= 0) {
      endGame();
      return; // Stop further execution in this interval tick
    }
  }, 1000);
  dropInterval = setInterval(spawnDrop, 400); // Change 800 to 500 for faster drops
  gameWrapper.classList.remove('centered-screen');
}

function resetGame() {
  score = 0;
  timeLeft = 15;
  lives = 3;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  livesEl.textContent = "❤️❤️❤️";
  gameContainer.innerHTML = "";
  milestonesShown.clear();
}

function spawnDrop() {
  const drop = document.createElement("div");
  drop.classList.add("drop");

  // Prevent drag events on drops
  drop.draggable = false;
  drop.addEventListener('dragstart', e => e.preventDefault());

  const rand = Math.random();
  if (rand < 0.6) {
    drop.innerHTML = '<img src="img/clean_drop.png" alt="Clean Drop" style="width:100%;height:100%;">';
    drop.dataset.points = "10";
  } else if (rand < 0.85) {
    drop.innerHTML = '<img src="img/water-can-transparent.png" alt="Water Can" style="width:100%;height:100%;">';
    drop.dataset.points = "20";
  } else {
    // Make contaminated drop slightly smaller
    drop.innerHTML = '<img src="img/contaminated_drop.png" alt="Contaminated Drop" style="width:85%;height:85%;display:block;margin:auto;">';
    drop.dataset.bad = "true";
  }

  // Responsive spawn: wider range on large screens
  let containerWidth = gameContainer.offsetWidth;
  let dropWidth = window.matchMedia('(min-width: 700px)').matches ? 64 : 40;
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

// Restart button handler
restartBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  mainGame.style.display = "";
  gameContainer.style.display = "";
  document.querySelector(".lives").style.display = "";
  document.querySelector(".score-panel").style.display = "";
  gameWrapper.classList.remove('centered-screen');
  startGame();
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
