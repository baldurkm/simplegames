var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
let score = 0;
canvas.width = 800;
canvas.height = 800;
document.body.appendChild(canvas);

var player = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 50,
  height: 20,
  speed: 5,
  bullets: [],
  cooldown: 15
};

var aliens = [];
var alienSpeed = 1;
for (var i = 0; i < 10; i++) {
  spawnAlien();
}

function spawnAlien() {
  var xPos = Math.random() * (canvas.width - 50);
  var yPos = Math.random() * 150; 
  aliens.push({ x: xPos, y: yPos, width: 50, height: 20, speed: alienSpeed });
}

function update() {
  if (player.cooldown > 0) {
    player.cooldown--;
  }
  
  if (keys[37]) { 
    player.x -= player.speed*alienSpeed;
  }
  
  if (keys[39]) {
    player.x += player.speed*alienSpeed;
  }
  
  if (keys[32] && player.cooldown <= 0) {
    player.bullets.push({ x: player.x + player.width / 2, y: player.y, width: 3, height: 10, speed: 10 });
    player.cooldown = 5; 
  }
//alien shot
  player.bullets = player.bullets.filter(function(bullet) {
    for (var i = 0; i < aliens.length; i++) {
      if (collides(bullet, aliens[i])) {
        aliens.splice(i, 1);
        spawnAlien();
        alienSpeed *= 1.01;
        score++;
        return false;
      }
    }
    return bullet.y > 0;
  });

  // If All aliens Are destroyed  
  if (aliens.length === 0) {
    alert('You Won!');
  }

    // move bullets
    player.bullets.forEach(function(bullet) {
      bullet.y -= bullet.speed;
    });
    //move aliens
    aliens.forEach(function(alien) {
      alien.y += alien.speed;
    });

}

// Drawing On Canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00f';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  player.bullets.forEach(function(bullet) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  //score
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Score: " + score, 8, canvas.height - 20);
  });
  


  ctx.fillStyle = '#f00';
  aliens.forEach(function(alien) {
    ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
  });
}

// Collision Detection
function collides(a, b) {
  return a.x < b.x + b.width &&
         a.y < b.y + b.height &&
         b.x < a.x + a.width &&
         b.y < a.y + a.height;
}

// Key Event listeners
var keys = [];
window.onkeydown = function(e) {
  keys[e.keyCode] = true;
};

window.onkeyup = function(e) {
  keys[e.keyCode] = false;
};

// Main Game Loop
var frameRate = 60.0;
setInterval(function() {
  update();
  draw();
}, 1000 / frameRate);
