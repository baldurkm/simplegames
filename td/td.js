// Game variables
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var statusMessage = '';
var statusMessageTimeout = 0;
var enemies = [];
var towers = [];
var projectiles = [];
var addTowerButton = {x: canvas.width - 300, y: canvas.height - 120, width: 200, height: 80}; // Define Add Tower button
var addTowerMode = false;
var money = 100;
var killCount = 0; 
var spawnInfluence = 0.01; 
var lastSpawnedOnKillCount = 0;  // Keep track of the kill count on the last spawn of breaker enemy

// Create a background texture pattern
var backgroundTextureImage = new Image();
backgroundTextureImage.src = 'grass.jpg';
var backgroundTexturePattern;

//Graphics
var towerImage = new Image();
towerImage.src = 'tower.jpg';
var enemyImage = new Image();
enemyImage.src = 'monster.jpg';
var breakerImage = new Image();
breakerImage.src = 'breaker.jpg';

backgroundTextureImage.onload = function() {
    backgroundTexturePattern = context.createPattern(backgroundTextureImage, 'repeat');
};

// Catch click to add tower
canvas.addEventListener('click', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (addTowerMode) {
        placeTower(x, y);
    } else {
        // Check if Add Tower button is clicked
        if (x >= addTowerButton.x && x <= addTowerButton.x + addTowerButton.width &&
            y >= addTowerButton.y && y <= addTowerButton.y + addTowerButton.height) {
            addTower();
        }
    }
}, false);



// Compatibility for touch devices
canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var touch = event.touches[0];

    var x = touch.clientX - rect.left;
    var y = touch.clientY - rect.top;

    // Check if Add Tower button is clicked
    if (x >= addTowerButton.x && x <= addTowerButton.x + addTowerButton.width &&
        y >= addTowerButton.y && y <= addTowerButton.y + addTowerButton.height) {
        addTower();
    } else if (addTowerMode) {
        placeTower(x, y);
    }
}, false);

//make a grid
var grid = [];
var gridSize = 60;
var gridRows = Math.floor((canvas.height - 120) / gridSize); 
var gridColumns = Math.floor(canvas.width / gridSize);

// Initialize the grid with zeros
for(var i = 0; i < gridRows; i++){
    grid[i] = [];
    for(var j = 0; j < gridColumns; j++){
        grid[i][j] = 0;
    }
}

function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.hp = 3;
    this.direction = 'down';
    this.justChangedDirection = false;  // New flag to indicate if direction just changed
    this.path = [];

    this.move = function() {
        var gridX = Math.floor(this.x / gridSize);
        var gridY = Math.floor(this.y / gridSize);

        this.path = AStar({i: gridY, j: gridX}, {i: gridRows-1, j: gridColumns-1});

        if (this.path[0]) {
            var nextStep = this.path[0];
            if (nextStep.i > gridY) this.direction = 'down';
            else if (nextStep.i < gridY) this.direction = 'up';
            else if (nextStep.j > gridX) this.direction = 'right';
            else if (nextStep.j < gridX) this.direction = 'left';
        }

        var newPosition = { x: this.x, y: this.y };
        switch (this.direction) {
            case 'right':
                newPosition.x += this.speed;
                break;
            case 'left':
                newPosition.x -= this.speed;
                break;
            case 'up':
                newPosition.y -= this.speed;
                break;
            case 'down':
                newPosition.y += this.speed;
                break;
        }

        var newGridX = Math.floor(newPosition.x / gridSize);
        var newGridY = Math.floor(newPosition.y / gridSize);
        if (grid[newGridY] && grid[newGridY][newGridX] === 0) {
            this.x = newPosition.x;
            this.y = newPosition.y;
            this.justChangedDirection = false;  // Reset flag
        } else {
            this.path = AStar({i: gridY, j: gridX}, {i: gridRows-1, j: gridColumns-1});
        }
    }
}


//Breaker Enemy Constructor
function BreakerEnemy(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 1; // Breaker enemy moves slower
    this.hp = 5; // More HP because this enemy is stronger
    this.direction = 'down';
    this.justChangedDirection = false;

    this.move = function() {
        var gridX = Math.floor(this.x / gridSize);
        var gridY = Math.floor(this.y / gridSize);

        var newPosition = { x: this.x, y: this.y };

        // Calculate new position based on current direction
        switch (this.direction) {
            case 'right':
                newPosition.x += this.speed;
                break;
            case 'left':
                newPosition.x -= this.speed;
                break;
            case 'up':
                newPosition.y -= this.speed;
                break;
            case 'down':
                newPosition.y += this.speed;
                break;
        }

        var newGridX = Math.floor(newPosition.x / gridSize);
        var newGridY = Math.floor(newPosition.y / gridSize);

        // Check if next cell in grid is free
        if (grid[newGridY] && grid[newGridY][newGridX] === 0) {
            this.x = newPosition.x;
            this.y = newPosition.y;
			this.justChangedDirection = false;  // Reset flag
        } else if (!this.justChangedDirection) {  // When hitting a tower
            // If blocked by a tower, pick a random direction other than 'right'
            var directions = ['left', 'up', 'down'];
            this.direction = directions[Math.floor(Math.random() * directions.length)];
			this.justChangedDirection = true;
        }
    };
    this.breakTower = function(){
    // Convert the position of the enemy from pixels to grid
    var gridX = Math.floor(this.x / gridSize);
    var gridY = Math.floor(this.y / gridSize);

    // Check nearby cells in a 3x3 area
    for(var dy=-1; dy<=1; dy++){
        for(var dx=-1; dx<=1; dx++){
            // Check if this cell is inside the grid's boundary
            if(gridY+dy >= 0 && gridY+dy < gridRows && gridX+dx >= 0 && gridX+dx < gridColumns){
                // If there's a tower in this cell, remove it
                if(grid[gridY+dy][gridX+dx] === 1){
                    grid[gridY+dy][gridX+dx] = 0;
                    // Loop through all towers, find the one standing in this grid cell and remove it
                    for(var i = 0; i < towers.length; i++){
                        if(towers[i].x === (gridX+dx) * gridSize && towers[i].y === (gridY+dy) * gridSize){
                            towers.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
    }
}
}

// Projectile constructor
function Projectile(x, y, target){
    this.x = x;
    this.y = y;
    this.speed = 10;
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
                var dx = this.x - (enemy.x + gridSize / 2);  // Calculate enemy center X
                var dy = this.y - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                var distance = Math.sqrt(dx * dx + dy * dy);
    
                if(distance < this.range) {
                    // Draw a line between tower and enemy within range
                    context.beginPath();
                    context.moveTo(this.x + gridSize/2, this.y + gridSize/2);  // Tower center
                    context.lineTo(enemy.x + gridSize/2, enemy.y + gridSize/2);  // Enemy center
                    context.stroke();
        
                    projectiles.push(new Projectile(this.x + gridSize / 2, this.y + gridSize / 2, enemy));

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
  addTowerMode = true;
}

// Place Tower
function placeTower(x, y) {
    var i = Math.floor(y / gridSize);
    var j = Math.floor(x / gridSize);
    addTowerMode = false;

    // Boundary condition fix
    if (i >= gridRows || j >= gridColumns) {
statusMessage = 'Invalid tower location';
statusMessageTimeout = 120;  // Show message for 120 frames (4 seconds at 30 FPS)
    } else if (grid[i][j] == 1) {
statusMessage = 'Cant build a tower on another tower';
statusMessageTimeout = 120;  
    } else if (money < 50) {
statusMessage = 'Insufficient funds';
statusMessageTimeout = 120;  
    } else {
      towers.push(new Tower(j * gridSize, i * gridSize));
      grid[i][j] = 1;
      money -= 50;
    }
}


// Function to calculate Heuristic 
function heuristic(a, b) {
    return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
  }
  
  // Function to get the neighboring grid cells
  function getNeighbors(grid, node) {
    var i = node.i;
    var j = node.j;
    var neighbors = [];
  
    if (i < gridRows-1) neighbors.push(grid[i+1][j]);
    if (j < gridColumns-1) neighbors.push(grid[i][j+1]);
    if (i > 0) neighbors.push(grid[i-1][j]);
    if (j > 0) neighbors.push(grid[i][j-1]);
  
    return neighbors;
  }
  
  // Implementing A* Search Algorithm
  function AStar(start, goal) {
    var openSet = [];
    var closedSet = [];
    var path = [];
    
    openSet.push(start);
    
    while(openSet.length > 0) {
      var bestNodeIdx = 0;
      for(var i=0; i<openSet.length; i++) {
        if(openSet[i].f < openSet[bestNodeIdx].f) {
          bestNodeIdx = i;
        }
      }
      var current = openSet[bestNodeIdx];
      
      if(current === goal) {
        var temp = current;
        path.push(temp);
        while(temp.previous) {
          path.push(temp.previous);
          temp = temp.previous;
        }
        return path;
      }
      
      openSet = openSet.filter((el) => el !== current);
      closedSet.push(current);
      
      var neighbors = getNeighbors(grid, current);
  
      for(var i=0; i<neighbors.length; i++) {
        var neighbor = neighbors[i];
        if(!closedSet.includes(neighbor)) {
            var tempG = current.g + 1;
            if(openSet.includes(neighbor)) {
                if(tempG < neighbor.g) {
                    neighbor.g = tempG;
                }
            } else {
                neighbor.g = tempG;
                openSet.push(neighbor);
            }
            neighbor.h = heuristic(neighbor, goal); // "end" replaced with "goal"
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
        }
    }
    }
  
    return [];
  }

//THIS IS WHERE THE GAME LOOP STARTS. BETTER HAVE ALL YOUR DUCKS IN A ROW B4 YOU GET HERE.
// Game loop
var gameLoop = setInterval(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background texture for each tile
    for (var i = 0; i < gridRows; i++) {
        for (var j = 0; j < gridColumns; j++) {
            context.fillStyle = backgroundTexturePattern;
            context.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
        }
    }

// Draw Add Tower button
context.rect(addTowerButton.x, addTowerButton.y, addTowerButton.width, addTowerButton.height);
context.fillStyle = "orange";
context.fill();
context.stroke();
context.fillStyle = "black";
context.fillText("BUILD $50", addTowerButton.x + 20, addTowerButton.y + 55); 

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

    enemy.move();

    if (enemy instanceof BreakerEnemy) {
        enemy.breakTower();
        context.drawImage(breakerImage, enemy.x, enemy.y, gridSize, gridSize);
    } else {
        context.drawImage(enemyImage, enemy.x, enemy.y, gridSize, gridSize);
    }

    // Check for lose condition
    if (enemy.y + gridSize >= canvas.height - 120) {
        statusMessage = 'The enemies have reached the bottom of our base. Game Over.';
        statusMessageTimeout = 120;
        clearInterval(gameLoop);  // End the game loop
        return;  // If you want to stop execution after losing
    }
}
		
		//Draw money
	context.fillStyle = "black";
	context.font = "32px Arial";
	context.fillText("CASH: " + money, 10, 40);
	context.fillText("KILLS: " + killCount, 10, 80);
// Draw messages	
context.fillStyle = 'red';
context.fillText(statusMessage, canvas.width/2, canvas.height/2);
if(statusMessageTimeout > 0) {
    statusMessageTimeout--;
} else {
    statusMessage = '';
}


    // Tower firing and drawing
for (var i in towers) {
    var tower = towers[i];
    tower.fire(); 
    context.drawImage(towerImage, tower.x, tower.y, gridSize, gridSize);
}

    // Projectile movement and drawing
    for (var i in projectiles){
        var projectile = projectiles[i];
        var enemy = projectile.target;
        var dx = enemy.x+30 - projectile.x;
        var dy = enemy.y+30 - projectile.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var velocityX = (dx / distance) * projectile.speed;
        var velocityY = (dy / distance) * projectile.speed;
		projectile.life--;

		if(distance < 30 || enemy.hp <= 0){
			// Decrease enemy's HP
			enemy.hp--;

			// If enemy's HP reached zero, delete it
			if (enemy.hp <= 0){
				var enemyIndex = enemies.indexOf(enemy);
				if (enemyIndex > -1){
					enemies.splice(enemyIndex, 1);
					// Award for killing an enemy
					money += 20;
					killCount++;  // Increase kill count when enemy is destroyed
				}
			}
			// Remove the projectile
			projectiles.splice(i, 1);
			break; // This break will prevent other projectiles from erroneously registering a hit on the same enemy in this loop iteration
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
	/*if (killCount >= 300) {
        spawnInfluence = 0.05;
	} else if (killCount >= 100) {
        spawnInfluence = 0.04;
    } else if (killCount >= 50) {
        spawnInfluence = 0.03;
    } else if (killCount >= 20) {
        spawnInfluence = 0.02;
    }*/
	// Exponential Spawn rate
spawnInfluence = 0.01 * Math.exp(killCount / 20.0);


// Spawn Enemies
if(killCount % 10 === 0 && killCount > 0 && lastSpawnedOnKillCount !== killCount){
    enemies.push(new BreakerEnemy(Math.random() * (canvas.width - gridSize), 0));
    lastSpawnedOnKillCount = killCount;
 } else if(Math.random() < spawnInfluence) {
     enemies.push(new Enemy(Math.random() * (canvas.width - gridSize), 0));
 }
 }, 30);