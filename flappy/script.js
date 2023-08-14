// Game Constants
const GRAVITY = 1.2;
const FLAP_POWER = -24;
const PIPE_SPEED = 4;

// Game Variables
let bird;
let pipes = [];
let gameContainer;
let gameInterval;
let score = 0;

// Game Initialization
function init() {
    bird = document.getElementById('bird');
    gameContainer = document.getElementById('game-container');
    gameInterval = setInterval(update, 20);

// Event Listener for Flap
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        flap();
    }
});

// Event Listener for touch (Mobile Devices)
document.addEventListener('touchstart', function() {
    flap();
});
}

// Update Game
function update() {
    // Update Bird Position
    bird.style.top = bird.offsetTop + GRAVITY + 'px';

    // Check Collision with Ground
    if (bird.offsetTop + bird.offsetHeight >= gameContainer.offsetHeight - 10) {
        gameOver();
    }

    // Check Collision with Pipes
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        pipe.style.left = pipe.offsetLeft - PIPE_SPEED + 'px';

        // Increase Score for upper pipes only
        if (i % 2 === 0 && pipe.offsetLeft + pipe.offsetWidth < bird.offsetLeft && !pipe.scored) {
            pipe.scored = true;
            score++;
            updateScore();
        }

        // Collision for all pipes
        if (isColliding(bird, pipe)) {
            gameOver();
        }

    }

    // Generate New Pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].offsetLeft < 0) {
        generatePipes();
    }
}

// Flap
function flap() {
    bird.style.top = bird.offsetTop + FLAP_POWER + 'px';
}

// Generate Pipes
function generatePipes() {
    const minHeight = 50;
    const maxHeight = gameContainer.offsetHeight - 200;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const pipeGap = 150;

    const pipeUpper = document.createElement('div');
    const pipeLower = document.createElement('div');

    pipeUpper.className = 'pipe upper-pipe';
    pipeLower.className = 'pipe lower-pipe';

    pipeUpper.style.height = height + 'px';
    pipeLower.style.height = (gameContainer.offsetHeight - height - pipeGap) + 'px';
    
    pipeUpper.style.left = gameContainer.offsetWidth + 'px';
    pipeLower.style.left = gameContainer.offsetWidth + 'px';
  
    pipeLower.style.top = (parseInt(pipeUpper.style.height, 10) + pipeGap) + 'px';

    gameContainer.appendChild(pipeUpper);
    gameContainer.appendChild(pipeLower);

    pipes.push(pipeUpper);
    pipes.push(pipeLower);
}

// Game Over
function gameOver() {
    clearInterval(gameInterval);
    const gameOverText = document.getElementById('game-over-text');
    gameOverText.style.display = 'block';
    gameOverText.innerHTML = 'Game Over! Score: ' + score;
}

// Update Score
function updateScore() {
    const scoreContainer = document.getElementById('score-container');
    scoreContainer.innerHTML = 'Score: ' + score;
}

// Collision Detection
function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

// Start Game
window.onload = init;