// Game variables
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var enemies = [];
var towers = [];
var projectiles = [];
var addTowerMode = false;
var money = 100;
var killCount = 0;  // Add this line
var spawnInfluence = 0.01;  // Base spawn rate

//make a grid
var grid = [];
var gridSize = 40;
var gridRows = canvas.height / gridSize; 
var gridColumns = canvas.width / gridSize;

// Initialize the grid with zeros
for(var i = 0; i < gridRows; i++){
    grid[i] = [];
    for(var j = 0; j < gridColumns; j++){
        grid[i][j] = 0;
    }
}

// Enemy constructor
function Enemy(x, y) {
  this.x = x;
  this.y = y;
  this.speed = 2;
  this.hp = 3;  // Each enemy can withstand 3 hits before getting destroyed
}

// Projectile constructor
function Projectile(x, y, target){
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.target = target;
    this.life = 100; // Life of the projectile. This could be adjusted based on the desired decay speed.
}

// Tower constructor
function Tower(x, y){
    this.x = x;
    this.y = y;
    this.range = 300;
    this.firingDelay = 30;
    this.timeToFire = this.firingDelay;

	this.fire = function() {
		if (this.timeToFire <= 0) {
			for (var j in enemies) {
				var enemy = enemies[j];
				var dx = this.x - enemy.x;
				var dy = this.y - enemy.y;
				var distance = Math.sqrt(dx * dx + dy * dy);

				if(distance < this.range) {
					// Draw a line between tower and enemy within range
					context.beginPath();
					context.moveTo(this.x + gridSize/2, this.y + gridSize/2);  // Tower center
					context.lineTo(enemy.x + gridSize/2, enemy.y + gridSize/2);  // Enemy center
					context.stroke();
					 
					projectiles.push(new Projectile(this.x + 10, this.y + 10, enemy));
					this.timeToFire = this.firingDelay;
					break;
				}
			}
		} else {
			this.timeToFire--;
		}
	}
}
// Add tower mode
function addTower() {
  addTowerMode = !addTowerMode; // Toggle the state
}

// Place Tower
function placeTower(x, y) {
    var i = Math.floor(y / gridSize);
    var j = Math.floor(x / gridSize);
	addTowerMode = !addTowerMode; // Toggle the state

    // Only if the cell is empty and there's enough money
    if(grid[i][j] === 0 && money >= 50){
        towers.push(new Tower(j * gridSize, i * gridSize)); 
        grid[i][j] = 1; // Update grid cell to tower
        money -= 50;  // Deduct tower cost
    } else {
        alert("Not enough money or cell is not empty!");
    }
}


// Catch click to add tower
canvas.addEventListener('click', function(event) {
    if (addTowerMode) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        placeTower(x, y);
    }
}, false);

// Game loop
var gameLoop = setInterval(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw grid
    if (addTowerMode) {
        for (var i = 0; i < gridRows; i++) {
            for (var j = 0; j < gridColumns; j++) {
                context.strokeStyle = "lightgrey";
                context.strokeRect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    }
	


    
    // Move and Draw enemies
    for(var i in enemies) {
        var enemy = enemies[i];
        enemy.x += enemy.speed;
        
        context.fillStyle = enemy.hp === 3 ? "red" : enemy.hp === 2 ? "orange" : "yellow";
        context.fillRect(enemy.x, enemy.y, 30, 30);
		
		 // Check for lose condition
		if (enemy.x >= canvas.width) {
				clearInterval(gameLoop);  // End the game loop
				alert('Game Over! An enemy reached your base.');
				return;  // If you want to stop execution after losing
		}
	
    }
		
		//Draw money
	context.fillStyle = "black";
	context.font = "24px Arial";
	context.fillText("Money: " + money, 10, 30);
	context.fillText("Kills: " + killCount, 10, 60);

    // Tower firing and drawing
    for (var i in towers) {
        var tower = towers[i];
        tower.fire(); 
        context.fillStyle = "blue";
        context.fillRect(tower.x, tower.y, gridSize, gridSize);
    }

    // Projectile movement and drawing
    for (var i in projectiles){
        var projectile = projectiles[i];
        var enemy = projectile.target;
        var dx = enemy.x - projectile.x;
        var dy = enemy.y - projectile.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var velocityX = (dx / distance) * projectile.speed;
        var velocityY = (dy / distance) * projectile.speed;
		projectile.life--;

        if(distance < 1){
            // Decrease enemy's HP
            enemy.hp--;

            // If enemy's HP reached zero, delete it
			if (enemy.hp <= 0){
				var enemyIndex = enemies.indexOf(enemy);
				if (enemyIndex > -1){
					enemies.splice(enemyIndex, 1);
				}
				// Award for killing an enemy
				money += 20;
				killCount++;  // Increase kill count when enemy is destroyed
			}
            // Remove the projectile
            projectiles.splice(i, 1);
        } else {
            // Move the projectile
            projectile.x += velocityX;
            projectile.y += velocityY;
            // Draw the projectile
            context.fillStyle = "black";
            context.fillRect(projectile.x, projectile.y, 5, 5);
        }  
		
		if(projectile.life <= 0){
			projectiles.splice(i, 1);
		}		
    }
	
		// Spawn rate
	if (killCount >= 300) {
        spawnInfluence = 0.05;
	} else if (killCount >= 100) {
        spawnInfluence = 0.04;
    } else if (killCount >= 50) {
        spawnInfluence = 0.03;
    } else if (killCount >= 20) {
        spawnInfluence = 0.02;
    }

    // Enemy spawning
    if(Math.random() < spawnInfluence) {
        enemies.push(new Enemy(0, Math.random() * (canvas.height - 30)));
    }
}, 30);