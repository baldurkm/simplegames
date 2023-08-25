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
var gamePaused = false;

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

//press keys
document.addEventListener('keydown', function(event) {
    if (event.key == 'B' || event.key == 'b') {
        addTowerMode = !addTowerMode;  // Toggle addTowerMode on 'B' key press
    }



});


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
console.log("Grid dimensions: ", gridRows,", ",gridColumns)

// Initialize the grid with zeros
for(var i = 0; i < gridRows; i++){
    grid[i] = [];
    for(var j = 0; j < gridColumns; j++){
        grid[i][j] = 0;
    }
}
//main enemy
// Enemy constructor with the updated move function 
function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.hp = 3;
    this.direction = 'down';
    this.justChangedDirection = false;
    this.pathUpdateFrequency = 1000; // update path every 1000 game loops
    this.pathUpdateCountdown = this.pathUpdateFrequency; // countdown to next path update
    this.path = [];
    

    this.move = function() {
        var gridX = Math.floor(this.x / gridSize);
        var gridY = Math.floor(this.y / gridSize);
        console.log("Current location ", gridX,", ", gridY)
      
        if (!this.path.length || this.justChangedDirection || --this.pathUpdateCountdown <= 0) {
            console.log("Starting pathfanding.", "this.path.length: ", this.path.length, " this.justChangedDirection: ", this.justChangedDirection, " this.pathUpdateCountdown: ", this.pathUpdateCountdown)
          this.justChangedDirection = false;
          var startNode = {i: gridY, j: gridX, f: 0, g: 0, h: 0};  // added initial f,g,h values
          console.log("Start Node: ", startNode)
          var endNode = {i: gridRows-1, j: gridColumns-1, f: 0, g: 0, h: 0};  // added initial f,g,h values
          //var endNode = {i: 5, j: 5, f: 0, g: 0, h: 0};  // added initial f,g,h values
          console.log("End Node: ", endNode)
          this.path = AStar(startNode, endNode);
          console.log("AStar Path: ", this.path)
          this.pathUpdateCountdown = this.pathUpdateFrequency;
        }

        if (this.path && this.path.length > 0) {
            var nextStep = this.path[0];
            if (nextStep.i > gridY) this.direction = 'down';
            else if (nextStep.i < gridY) this.direction = 'up';
            else if (nextStep.j > gridX) this.direction = 'right';
            else if (nextStep.j < gridX) this.direction = 'left';

            if (gridX === this.path[0].j && gridY === this.path[0].i) this.path.shift();
            console.log(nextStep)
        }

        if(this.direction === "right") this.x += this.speed;
        else if(this.direction === "left") this.x -= this.speed;
        else if(this.direction === "up") this.y -= this.speed;
        else if(this.direction === "down") this.y += this.speed;
    };
}

/*
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

    if (!this.path.length || this.justChangedDirection) {
        this.justChangedDirection = false;
        this.path = AStar({i: gridY, j: gridX}, {i: gridRows-1, j: gridColumns-1});
    }

    // Checking if the enemy has a valid path before proceeding
    if (this.path && this.path.length > 0) {
        var nextStep = this.path[0];
        
        if (nextStep.i > gridY) this.direction = 'down';
        else if (nextStep.i < gridY) this.direction = 'up';
        else if (nextStep.j > gridX) this.direction = 'right';
        else if (nextStep.j < gridX) this.direction = 'left';

        // If the enemy reaches the next point they are following on the path, remove that point from the path.
        if (gridX === nextStep.j && gridY === nextStep.i) this.path.shift();
    }
      
    // Proceed to origin for further movement
    if(this.direction === "right") this.x += this.speed;
    else if(this.direction === "left") this.x -= this.speed;
    else if(this.direction === "up") this.y -= this.speed;
    else if(this.direction === "down") this.y += this.speed;
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
}*/


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

    if (i >= gridRows || j >= gridColumns) {
        statusMessage = 'Invalid tower location';
        statusMessageTimeout = 120;
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

        // inform each enemy that a new tower has been placed
        enemies.forEach(function(enemy) {
            var gridX = Math.floor(enemy.x / gridSize);
            var gridY = Math.floor(enemy.y / gridSize);
            enemy.justChangedDirection = true;
            enemy.path = AStar({i: gridY, j: gridX}, {i: gridRows-1, j: gridColumns-1});
        });
    }
}


//heuristic 
function heuristic(a, b, start) {
    console.log("Heuristic value check. a:",a," b:",b," start:",start," i:",i," j:",j)
    if (a.i !== start.i || a.j !== start.j){
        console.log("Current grid is ",grid[a.i][a.j])
        if (grid[a.i][a.j] === 1) {
            console.log("NON-TRAVERSABLE");// print to console
            
            return Infinity; // a tile marked as a tower is now non-traversable
        }
    }
    
    return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}
  
// Function to get the neighboring grid cells
function getNeighbors(grid, node) {
    var i = node.i;
    var j = node.j;
    var neighbors = [];
  
    if (i < gridRows-1 && grid[i+1][j] != 1) neighbors.push({i: i+1, j: j});
    if (j < gridColumns-1 && grid[i][j+1] != 1) neighbors.push({i: i, j: j+1});
    if (i > 0 && grid[i-1][j] != 1) neighbors.push({i: i-1, j: j});
    if (j > 0 && grid[i][j-1] != 1) neighbors.push({i: i, j: j-1});
  
    //console.log("Neighbors: ",neighbors)
    return neighbors;
}


/* OLD
//pathfinding AStar
function AStar(start, goal) {
    console.log("Starting AStar")
    var openSet = [];
    var closedSet = [];
    var path = [];
    
    openSet.push(start);
    
    var maxSteps = 100;  
    var stepCounter = 0;

    while(openSet.length > 0) {
        if(stepCounter++ > maxSteps) {
            console.error('Reached maximum calculation steps, breaking loop. Start and goal: ', start, goal);
            return "Path not found within the maximum calculation steps.";
        }

        var bestNodeIdx = 0;
        for(var i=0; i<openSet.length; i++) {
            if(openSet[i].f < openSet[bestNodeIdx].f) {
                bestNodeIdx = i;
            }
        }

        var current = openSet[bestNodeIdx];
        console.log("XXXXXXXX")
        console.log("Current: ",current, " Goal: ",  goal)
        if (current.x === goal.x && current.y === goal.y) {
            
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
            if(!closedSet.includes(neighbor) && grid[neighbor.i][neighbor.j] != 1) {
                var tempG = current.g + 1;
                if(openSet.includes(neighbor)) {
                    if(tempG < neighbor.g) {
                        neighbor.g = tempG;
                    }
                } else {
                    neighbor.g = tempG;
                    openSet.push(neighbor);
                }
                neighbor.h = heuristic(neighbor, goal, start);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
            }
        }
    }
    
    //return [];
}
*/

function removeFromArray(arr, node) {
    for(var i = arr.length; i--;){
        if(arr[i] === node){
            arr.splice(i, 1);
        }
    }
}
 
function findInArray(arr, node) {
    for(var i = 0; i < arr.length; i++){
        if(arr[i].i === node.i && arr[i].j === node.j){
            return arr[i];
        }
    }
    return null;
}

function AStar(start, goal){
    var openList = [];
    var closedList = [];
    openList.push(start);
 
    while(openList.length > 0) {
        // Best next option
        var lowInd = 0;
        for(var i=0; i<openList.length; i++) {
            if(openList[i].f < openList[lowInd].f) { 
                lowInd = i; 
            }
        }
        var currentNode = openList[lowInd];
 
        // End case
        if(currentNode.i === goal.i && currentNode.j === goal.j) {
            var curr = currentNode;
            var ret = [];
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            return ret.reverse();
        }
 
        // Normal case
        removeFromArray(openList, currentNode);
        closedList.push(currentNode);
 
        var neighbors = getNeighbors(grid, currentNode);
        
        for(var i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];
            // Not a valid node
            if(findInArray(closedList, neighbor) || grid[neighbor.i][neighbor.j] === 1) {
                continue;
            }
 
            var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
            var gScoreIsBest = false;
 
            if(!findInArray(openList, neighbor)) {
                // This the first time we have arrived at this node, it must be the best
                gScoreIsBest = true;
                neighbor.h = heuristic(neighbor, goal, start);
                openList.push(neighbor);
            }
            else if(gScore < neighbor.g) {
                // We have already seen the node, but last time it had a worse g (distance from start)
                gScoreIsBest = true;
            }
 
            if(gScoreIsBest) {
                // Found an optimal (so far) path to this node.	 Take score for node to see how good it is.	
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
 
    // No result was found - empty array signifies failure to find path
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
    console.log("Enemy moving ",enemy)

    enemy.move();
    context.drawImage(enemyImage, enemy.x, enemy.y, gridSize, gridSize);
    
    // Draw Path
    context.strokeStyle = 'red';
    console.log("Attempting to draw path, ", enemy.path)
    enemy.path.forEach((point, index, arr) => {
        console.log(`Drawing from ${point.j * gridSize}, ${point.i * gridSize}`); // Log the point where we're starting to draw from
        if (index < arr.length - 1) {
            context.beginPath();
            context.moveTo(point.j * gridSize, point.i * gridSize);
            context.lineTo(arr[index + 1].j * gridSize, arr[index + 1].i * gridSize);
            context.stroke();

            console.log(`Drew to ${arr[index + 1].j * gridSize}, ${arr[index + 1].i * gridSize}`); // Log the point where we're drawing to
        }
    });

    // Check for lose condition
    if (enemy.y + gridSize >= canvas.height - 120) {
        statusMessage = 'The enemies have reached the bottom of our base. Game Over.';
        statusMessageTimeout = 120;
        clearInterval(gameLoop);  // End the game loop
        //return;  // If you want to stop execution after losing
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


	// Exponential Spawn rate
spawnInfluence = 0.01 * Math.exp(killCount / 20.0);


// Spawn Enemies
if(killCount % 10 === 0 && killCount > 0 && lastSpawnedOnKillCount !== killCount){
    enemies.push(new Enemy(Math.random() * (canvas.width - gridSize), 0));
    lastSpawnedOnKillCount = killCount;
 } else if(Math.random() < spawnInfluence) {
     enemies.push(new Enemy(Math.random() * (canvas.width - gridSize), 0));
 }

 
 }, 30);