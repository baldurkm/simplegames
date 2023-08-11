const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Constants
const PADDLE_WIDTH = 75, PADDLE_HEIGHT = 10;
const BALL_RADIUS = 10, BALL_SPEED = 5;
const KEY_RIGHT = 39, KEY_LEFT = 37;

// Score
let score = 0;

// Util function: Paddle object
function createPaddle(x, y) {
  return {
    x: x,
    y: y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 10
  }
}

// Util function: Ball object
function createBall(x, y) {
  return {
    x: x,
    y: y,
    radius: BALL_RADIUS,
    speed: BALL_SPEED,
    dx: BALL_SPEED,
    dy: BALL_SPEED
  }
}

// Initialize player paddle and ball
const player = createPaddle(canvas.width / 2 - PADDLE_WIDTH / 2, canvas.height - PADDLE_HEIGHT);
const ball = createBall(canvas.width / 2, canvas.height / 2);

// Draw paddle and ball
// Draw game elements including score
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle(player.x, player.y, player.width, player.height, 'blue');
  drawBall(ball.x, ball.y, ball.radius, 'red');
  drawScore();
}

// Draw game elements
function drawPaddle(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// Detect collision
function detectCollision() {
  return ball.dx > 0 && ball.x + ball.radius > player.x && ball.x < player.x + player.width &&
         ball.y + ball.radius > player.y;
}

// Update paddle position
function updatePaddlePosition() {
  if(rightArrowKey && player.x + player.width < canvas.width) {
    player.x += player.dx;
  }
  else if(leftArrowKey && player.x > 0) {
    player.x -= player.dx;
  }
}

function drawScore() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText('Score: ' + score, 8, 20);
}

// Update ball position
function updateBallPosition() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  
  if(detectCollision()) {
    ball.dy = -ball.dy;
    score++; // Increase score when the ball bounces off the paddle
  }
  else if(ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  if(ball.y + ball.radius > canvas.height) {
    console.log('Game Over');
    ball.dy = 0;
    ball.dx = 0;
  }
}

// Keyboard event listeners
let rightArrowKey = false;
let leftArrowKey = false;

document.addEventListener('keydown', function(event) {
  switch(event.keyCode) {
    case KEY_RIGHT:
      rightArrowKey = true;
      break;
    case KEY_LEFT:
      leftArrowKey = true;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch(event.keyCode) {
    case KEY_RIGHT:
      rightArrowKey = false;
      break;
    case KEY_LEFT:
      leftArrowKey = false;
      break;
  }
});

// Main game update function
function update() {
  draw();
  updatePaddlePosition();
  updateBallPosition();
}

// Run the game loop
setInterval(update, 20);