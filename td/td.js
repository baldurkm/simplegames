// Game variables

var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var statusMessage = '';
var statusMessageTimeout = 0;
var enemies = [];
var towers = [];
var projectiles = [];
var addTowerButton; // Define Add Tower button
var upgradeButton; // Define Upgrade button
var spawnButton; // Define Spawn button

var upgradePrice = 50;
var upgradeMultiplier = 0.25;
var isUpgraded = false;
var money = 250;
var killCount = 0; 
var spawnMultiFactor = 0.2; //spawn rate multiplier
var spawnLnFactor = 1; // spawn rate ln factor
var spawnInfluence = 0.01;
var lastSpawnedOnKillCount = 0;  // Keep track of the kill count on the last spawn of breaker enemy
var gamePaused = false;
var addTowerMode = false;
var gameTimer = 0;
var hoveredGridSquare = null;
var upgradeMode = false;
var Spree = 0;
var ShowSpree = 0;



var towerImage = new Image();
var towerImageFiring = new Image();
var backgroundTextureImage = new Image();
var backgroundTexturePattern;
var tileSize = 32; // Tile size in pixels
var mapWidth = 780; // Width of the game map
var mapHeight = 920; // Height of the game map
var terrainTypes = ['grass', 'desert', 'badlands'];


// Add event listener for the page load event
window.addEventListener('load', function() {
    // Initialize canvas and game-related elements
    initializeGame();

    // Add event listeners for button clicks
    addEventListeners();
});




function initializeGame() {
    // Create a background texture pattern once the image is loaded
    backgroundTextureImage.onload = function() {
        var patternCanvas = document.createElement('canvas');
        var patternContext = patternCanvas.getContext('2d');

        patternCanvas.width = mapWidth;
        patternCanvas.height = mapHeight;

        // Randomly select tiles from the tileset and fill the map
        for (var y = 0; y < mapHeight; y += tileSize) {
            for (var x = 0; x < mapWidth; x += tileSize) {
                var tileX = Math.floor(Math.random() * (backgroundTextureImage.width / tileSize));
                var tileY = Math.floor(Math.random() * (backgroundTextureImage.height / tileSize));

                patternContext.drawImage(backgroundTextureImage, tileX * tileSize, tileY * tileSize, tileSize, tileSize, x, y, tileSize, tileSize);
            }
        }

        backgroundTexturePattern = context.createPattern(patternCanvas, 'no-repeat');
        // Start the game loop after the background texture pattern has been created
        // You can place this here or wherever you start your game loop.
    };

    // Set the source of the tileset image
    var randomTerrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];    
    backgroundTextureImage.src = randomTerrainType + '.png';

    // Load other game assets (e.g., tower image)
    towerImage.src = 'tower.png';
    towerImageFiring.src = 'towerFiring.png';

        // Define Add Tower button
        addTowerButton = {x: mapWidth - 250, y: mapHeight - 120, width: 200, height: 80};
        // Upgrade button variables
        upgradeButton = {x: mapWidth - 485, y: mapHeight - 120, width: 200, height: 80};
        // Spawn button variables
        spawnButton = {x: mapWidth - 720, y: mapHeight - 120, width: 200, height: 80};

    // Set canvas size
    canvas.width = mapWidth;
    canvas.height = mapHeight;


}


//ADD EVENT LISTENERS
function addEventListeners() {
    // Press keys
    document.addEventListener('keydown', function(event) {
        if (event.key == 'B' || event.key == 'b') {
            addTowerMode = !addTowerMode;  // Toggle addTowerMode on 'B' key press
        }
        if (event.key == 'U' || event.key == 'u') {
            upgradeMode = !upgradeMode;  // Toggle upgrademode
        }
        if (event.key == 'S' || event.key == 's') {
            spawnEnemy();
        }
        if (event.key == 'X') {
            money = money + 100;
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

    if (upgradeMode) {
        // Find the nearest tower for upgrade
        var nearestTower = null;
        var nearestDistance = Infinity;

        for (var i = 0; i < towers.length; i++) {
            var tower = towers[i];
            var distance = Math.sqrt(
                Math.pow(x - (tower.x + gridSize / 2), 2) +
                Math.pow(y - (tower.y + gridSize / 2), 2)
            );

            if (distance <= tower.range && distance < nearestDistance) {
                nearestTower = tower;
                nearestDistance = distance;
            }
        }

        // Upgrade the nearest tower
        if (nearestTower) {
            nearestTower.upgrade();
            nearestTower.selectedForUpgrade = false; // Deselect the tower
            upgradeMode = false; // Exit upgrade mode
        }
    }

    else if (x >= spawnButton.x && x <= spawnButton.x + spawnButton.width &&
        y >= spawnButton.y && y <= spawnButton.y + spawnButton.height)
        {
            spawnEnemy();
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
            addTowerMode = !addTowerMode;
        } else if (addTowerMode) {
            placeTower(x, y);
        }
        else if (upgradeMode) {
            if (upgradeMode) {
                // Find the nearest tower for upgrade
                var nearestTower = null;
                var nearestDistance = Infinity;
        
                for (var i = 0; i < towers.length; i++) {
                    var tower = towers[i];
                    var distance = Math.sqrt(
                        Math.pow(x - (tower.x + gridSize / 2), 2) +
                        Math.pow(y - (tower.y + gridSize / 2), 2)
                    );
        
                    if (distance <= tower.range && distance < nearestDistance) {
                        nearestTower = tower;
                        nearestDistance = distance;
                    }
                }
        
                // Upgrade the nearest tower
                if (nearestTower) {
                    nearestTower.upgrade();
                    nearestTower.selectedForUpgrade = false; // Deselect the tower
                    upgradeMode = false; // Exit upgrade mode
                }
            }
        }
        // Check if upgrade button is clicked
        if (x >= upgradeButton.x && x <= upgradeButton.x + upgradeButton.width &&
            y >= upgradeButton.y && y <= upgradeButton.y + upgradeButton.height) {
            upgradeMode = !upgradeMode;
        } //else if (upgradeMode) {
           // placeTower(x, y);
      //  }

      if (x >= spawnButton.x && x <= spawnButton.x + spawnButton.width &&
        y >= spawnButton.y && y <= spawnButton.y + spawnButton.height)
        {
            spawnEnemy();
        }

    }, false);

canvas.addEventListener('mousemove', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Calculate the grid coordinates based on the mouse position
    var gridX = Math.floor(x / gridSize);
    var gridY = Math.floor(y / gridSize);

    // Update the hoveredGridSquare
    hoveredGridSquare = { x: gridX, y: gridY };
});

}

//make a grid
var grid = [];
var gridSize = 60;
var gridRows = Math.floor((canvas.height - 120) / gridSize); 
var gridColumns = Math.floor(canvas.width / gridSize);
//console.log("Grid dimensions: ", gridRows,", ",gridColumns)

// Initialize the grid with zeros
for(var i = 0; i < gridRows; i++){
    grid[i] = [];
    for(var j = 0; j < gridColumns; j++){
        grid[i][j] = 0;
    }
}


// Add event listener for upgrade button click
canvas.addEventListener('click', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Check if the click is on the upgrade button
    if (
        x >= upgradeButton.x &&
        x <= upgradeButton.x + upgradeButton.width &&
        y >= upgradeButton.y &&
        y <= upgradeButton.y + upgradeButton.height
    ) {
        upgradeMode = !upgradeMode; // Toggle upgrade mode
    }
}, false);

function spawnEnemy() {
    var enemyX = Math.random() * (canvas.width - gridSize);
    var enemyY = 0;
    var enemyPath = AStar({ i: Math.round(enemyY / gridSize), j: Math.round(enemyX / gridSize) }, { i: gridRows - 1, j: gridColumns - 1 });
    enemies.push(new Enemy(enemyX, enemyY, enemyPath));
}

// main enemy
// Enemy constructor
function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2 + spawnInfluence * 3;
    this.hp = 3;
    this.direction = 'down';
    this.justChangedDirection = false;
    this.pathUpdateFrequency = 1000; // update path every 1000 game loops
    this.pathUpdateCountdown = this.pathUpdateFrequency; // countdown to next path update
    this.path = [];
    //this.Image = new Image();
    //this.Image.src = 'orc.png';

    this.spriteSheet = new Image();
    this.spriteSheet.src = 'es' + (Math.floor(Math.random() * 6) + 1) + '.png'; // Set the path to your sprite sheet
    this.frameWidth = 20; // Width of each frame
    this.frameHeight = 20; // Height of each frame
    this.totalFrames = 3; // Total number of frames in the sprite sheet
    this.currentFrame = 0; // Current frame index
    this.frameUpdateInterval = 5; // Interval to update frames (adjust as needed)

    this.draw = function() {
        context.drawImage(
            this.spriteSheet, // Image object containing the sprite sheet
            this.currentFrame * this.frameWidth, // X-coordinate of the frame in the sprite sheet
            this.frameHeight, // Y-coordinate of the frame (assuming you want the bottom row)
            this.frameWidth, // Width of the frame
            this.frameHeight, // Height of the frame
            this.x, // X-coordinate to draw on the canvas
            this.y, // Y-coordinate to draw on the canvas
            gridSize * 1.25, // Width to draw on the canvas
            gridSize * 1.25 // Height to draw on the canvas
        );
    };
    
    function isWalkable(gridX, gridY) {
        // Check if the cell is within the bounds of the grid.
        if (gridX < 0 || gridX >= gridColumns || gridY < 0 || gridY >= gridRows) {
            return false; // Cell is out of bounds, considered blocked.
        }
    
        // Check if the cell is blocked by a tower.
        return grid[gridY][gridX] === 0; // 0 represents a walkable cell, 1 represents a tower.
    }
    
    // ENEMY MOVEMENT
    this.move = function() {
        var gridX = Math.round((this.x) / gridSize);
        var gridY = Math.round((this.y) / gridSize);
    
        if (!this.path.length || this.justChangedDirection || --this.pathUpdateCountdown <= 0) {
            this.justChangedDirection = false;
            var startNode = { i: gridY, j: gridX, f: 0, g: 0, h: 0 };
            var endNode = { i: gridRows - 1, j: gridColumns - 1, f: 0, g: 0, h: 0 };
            this.path = AStar(startNode, endNode);
            this.pathUpdateCountdown = this.pathUpdateFrequency;
        }
    
        if (this.path && this.path.length > 0) {
            var nextStep = this.path[0];      
    
        if (this.path.length > 0) {
            var nextStep = this.path[0];
    
            if (nextStep.i > gridY) this.direction = 'down';
            else if (nextStep.i < gridY) this.direction = 'up';
            else if (nextStep.j > (gridX)) this.direction = 'right';
            else if (nextStep.j < (gridX)) this.direction = 'left';
        }

        if (gridX === nextStep.j && gridY === nextStep.i) {
            // Check if the enemy is close to the center of the next cell
            var distanceToNextCellCenter = Math.sqrt((this.x - nextStep.j * gridSize) ** 2 + (this.y - nextStep.i * gridSize) ** 2);
            //console.log(distanceToNextCellCenter);

            if (distanceToNextCellCenter < this.speed) {
                this.path.shift();
            } 
        }
    }
    
        // Move the enemy in the current direction
        if (this.direction === "right") this.x += this.speed;
        else if (this.direction === "left") this.x -= this.speed;
        else if (this.direction === "up") this.y -= this.speed;
        else if (this.direction === "down") this.y += this.speed;
    
        if (gameTimer % this.frameUpdateInterval === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }

            //DEBUGGING
            if (this.path && this.path.length > 0) {
                var nextStep = this.path[0];
                var targetX = nextStep.j * gridSize;
                var targetY = nextStep.i * gridSize;
            
                
                if (targetY > gridY) this.direction = 'down';
                else if (targetY < gridY) this.direction = 'up';
                else if (targetX > gridX) this.direction = 'right';
                else if (targetX < gridX) this.direction = 'left';
            
                if (gridX === nextStep.j && gridY === nextStep.i) this.path.shift();
            }


    };
    
    
}
// Projectile constructor
function Projectile(x, y, target){
    this.x = x;
    this.y = y;
    this.speed = 40;
    this.target = target;
    this.life = 200; // Life of the projectile. This could be adjusted based on the desired decay speed.
}

// Tower constructor
function Tower(x, y){
    this.x = x;
    this.y = y;
    this.range = 200;
    this.firingDelay = 40;
    this.timeToFire = this.firingDelay;
    this.upgradeLevel = 0; // Initial upgrade level
    this.upgradeCost = 100; // Cost for the first upgrade
	this.damage = 1; // initial damage

Tower.prototype.upgrade = function() {
    if (money >= this.upgradeCost) {
        this.firingDelay *= 0.8; // Decrease firing delay (increase firing rate)
        this.range *= 1.1; // Increase range
	    this.damage *= 1.1 // Increase damage
        money -= this.upgradeCost;
        this.upgradeLevel++;
        this.upgradeCost *= 1.5; // Increase upgrade cost for the next level
        
        // Reset the upgradeMode flag to allow selecting a new tower
        upgradeMode = false;
    }
};


    this.fire = function() {
	//console.log("Start of this.fire function");
        if (this.timeToFire <= 0) {
	//console.log("Cooldown elapsed, firing");
            for (var j in enemies) {
	//console.log("Fire loop for enemy #" + enemies[j]);
                var enemy = enemies[j];
                var dx = this.x - (enemy.x + gridSize / 2);  // Calculate enemy center X
                var dy = this.y - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                var distance = Math.sqrt(dx * dx + dy * dy);
    
                if(distance < this.range) {
	//console.log("In range, range = " + this.range);
                    // Draw a line between tower and enemy within range
                    context.drawImage(towerImageFiring, this.x, this.y, gridSize, gridSize); // Draw tower image
                    context.beginPath();
                    context.moveTo(this.x + gridSize/2, this.y + gridSize/2 - 15);  // Tower center
                    context.lineTo(enemy.x + gridSize/2, enemy.y + gridSize/2);  // Enemy center
                    context.lineWidth = 4;
                    context.stroke();
                    enemy.hp = enemy.hp - this.damage;                    
    //console.log("Fired. Enemy HP now" + enemy.hp);
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
        
                    //projectiles.push(new Projectile(this.x + gridSize / 2, this.y + gridSize / 2, enemy));

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
	var originalValue = grid[i][j]; // Store the original value
        grid[i][j] = 1; // Mark the potential tower location as blocked

    // Check if there is a viable path for enemies on the temporary grid
    var start = { i: 1, j: 1 }; 
    var goal = { i: gridRows - 1, j: gridColumns - 1 };
    var path = AStar(start, goal, grid);

    // Restore the original grid value
    grid[i][j] = originalValue;

    if (path.length > 0) {
        // Path exists on the temporary grid, so you can place the tower
        towers.push(new Tower(j * gridSize, i * gridSize));
        grid[i][j] = 1;
        money -= 50;
    } else {
        // No viable path, show an error message to the user
        statusMessage = 'Tower blocks path';
        statusMessageTimeout = 120;
    }

        // inform each enemy that a new tower has been placed
        enemies.forEach(function(enemy) {
            var gridX = Math.round(enemy.x / gridSize);
            var gridY = Math.round(enemy.y / gridSize);
            enemy.justChangedDirection = true;
            enemy.path = AStar({i: gridY, j: gridX}, {i: gridRows - 1, j: gridColumns - 1});
        });
    }
}



// **************************************************
// THIS IS THE AI AND PATHFINDING SECTION OF THE CODE
// **************************************************
//heuristic 
function heuristic(a, b, start) {
    //console.log("Heuristic value check. a:",a," b:",b," start:",start," i:",i," j:",j)
    if (a.i !== start.i || a.j !== start.j){
        //console.log("Current grid is ",grid[a.i][a.j])
        if (grid[a.i][a.j] === 1) {
            //console.log("NON-TRAVERSABLE");// print to console
            
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

// Function AStar
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


//*******************************************************************************************
//***********************THIS IS WHERE THE GAME LOOP STARTS.*********************************
//*******************************************************************************************

var gameLoop = setInterval(function(){
    // Clear canvas
    gameTimer += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background texture for each tile
    for (var i = 0; i < gridRows; i++) {
        for (var j = 0; j < gridColumns; j++) {
            context.fillStyle = backgroundTexturePattern;
            context.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
        }
    }
    
    // Draw Add Tower button
    context.beginPath();
    context.textAlign = 'center';
    context.rect(addTowerButton.x, addTowerButton.y, addTowerButton.width, addTowerButton.height);
    context.fillStyle = "orange";
    context.font = "24px Arial";
    context.fill();
    context.stroke();
    context.fillStyle = "black";
    context.fillText("BUILD $50 (B)", addTowerButton.x + 100, addTowerButton.y + 40); 

    // Draw Upgrade button
    context.beginPath();
    context.rect(upgradeButton.x, upgradeButton.y, upgradeButton.width, upgradeButton.height);
    context.fillStyle = "blue";
    context.font = "24px Arial";
    context.fill();
    context.stroke();
    context.fillStyle = "white";
    context.fillText("UPGRADE (U)", upgradeButton.x + 100, upgradeButton.y + 40); 

    // Draw Spawn button
    context.beginPath();
    context.rect(spawnButton.x, spawnButton.y, spawnButton.width, spawnButton.height);
    context.fillStyle = "red";
    context.font = "24px Arial";
    context.fill();
    context.stroke();
    context.fillStyle = "white";
    context.fillText("SPAWN (S)", spawnButton.x + 100, spawnButton.y + 40); 



	// Draw grid
// Draw grid
if (addTowerMode || upgradeMode) {
    for (var i = 0; i < gridRows; i++) {
        for (var j = 0; j < gridColumns; j++) {
            context.lineWidth = 1;
            context.strokeStyle = "lightgrey";
            context.strokeRect(j * gridSize, i * gridSize, gridSize, gridSize);

            // Check if this grid square matches the hoveredGridSquare
            if (hoveredGridSquare && j === hoveredGridSquare.x && i === hoveredGridSquare.y) {
                context.lineWidth = 1;
                context.fillStyle = "rgba(255, 255, 0, 0.3)"; // Yellow highlight
                context.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            if (addTowerMode)
            {
                // Calculate the center of the hovered square
                var centerX = j * gridSize + gridSize / 2;
                var centerY = i * gridSize + gridSize / 2;
            
                // Set the circle's properties
                var circleRadius = 200; // Radius of the circle
            
                // Draw the circle
                context.beginPath();
                context.arc(centerX, centerY, circleRadius, 0, Math.PI * 2); // Create a full circle
                context.strokeStyle = "yellow"; // Outline color
                context.lineWidth = 2; // Outline thickness
                context.stroke();
            }
            }
        }
    }
}

    
// Move and Draw enemies
for(var i in enemies) {
    var enemy = enemies[i];
    //console.log("Enemy moving ",enemy)

    enemy.move();
    enemy.draw();
    
    // Draw Path
    /*context.strokeStyle = 'red';
    //console.log("Attempting to draw path, ", enemy.path)
    enemy.path.forEach((point) => {
        // Highlight the square in green
        context.fillStyle = "rgba(0, 255, 0, 0.5)"; // Green with 50% opacity
        context.fillRect(point.j * gridSize, point.i * gridSize, gridSize, gridSize);
    });*/

    // Check for lose condition
    if (enemy.y + gridSize >= canvas.height - 150) {
        statusMessage = 'Game Over.';
        statusMessageTimeout = 9999;
        clearInterval(gameLoop);  // End the game loop
        //return;  // If you want to stop execution after losing
    }
}


    // Tower firing and drawing
context.strokeStyle = 'red';
for (var i in towers) {
    var tower = towers[i];
    context.drawImage(towerImage, tower.x, tower.y, gridSize, gridSize); // Draw tower image
    if (tower.timeToFire <= 0) {
        tower.fire(); 
        tower.timeToFire = tower.firingDelay;
    } else {
        tower.timeToFire--;
    }
    
    
    
    
    // Draw upgrade level text
    context.font = "16px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("LV " + tower.upgradeLevel, tower.x + gridSize / 2, tower.y + gridSize - 15);

    if (upgradeMode) {
        // Display upgrade cost
        context.font = "16px Arial";
        context.fillStyle = "yellow";
        context.fillText("$" + Math.trunc(tower.upgradeCost), tower.x + gridSize / 2, tower.y + gridSize - 40);
    }
}
/*
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

*/


	// Exponential Spawn rate
//spawnInfluence = 0.01 * Math.exp(killCount / 25.0);
// ************************* SPAWN RATE
spawnInfluence = 0.01 + (0.00065 * killCount);
if (gameTimer < 100) // Enemies don't spawn until after 100 frames
{
	context.beginPath();
	context.fillStyle = "rgba(64, 64, 64, 0.2)"; // gray with 10% opacity
        context.fillRect(0, 310, canvas.width, 100);
    spawnInfluence = 0;
    context.beginPath();
    context.fillStyle = "red";
    context.font = "32px Impact";
    context.textAlign = 'center';
    context.fillText("ENEMIES ARRIVING IN " + String(Math.trunc((100-gameTimer)/30)+1), canvas.width/2, 360);
    //context.fillText("B for Build, U for Upgrade ", 360, 420);
}


// Spawn Enemies
if(Math.random() < spawnInfluence && enemies.length <= (killCount / 3)+1) {
    spawnEnemy();
 }

// MESSAGES TO THE PLAYER
if (gameTimer > 100 && gameTimer < 200) // messaging
{ 
	context.beginPath();
	context.fillStyle = "rgba(64, 64, 64, 0.2)"; // gray with 10% opacity
        context.fillRect(0, 310, canvas.width, 140);
    context.beginPath();
    context.fillStyle = "red";
    context.font = "32px Impact";
    context.textAlign = 'center';
    context.fillText("YOU HAVE 1 LIFE.", canvas.width/2, 360)
    context.fillText("GOOD LUCK", canvas.width/2, 420);
}

if (killCount % 100 === 0 && killCount > 1) // messaging
{
     Spree = killCount;
     ShowSpree = 100;
}
if (ShowSpree > 0)
{
    context.beginPath();
    context.fillStyle = "white";
    context.font = "48px Impact";
    context.textAlign = 'center';
    context.fillText(Spree + " KILLS", canvas.width/2, 360)
    ShowSpree--;
}

if (killCount % 1000 === 0 && killCount > 1) // messaging
{
	statusMessage = 'A HUGE WAVE OF ENEMIES SPAWNED';
        statusMessageTimeout = 120;
	for (let i = 0; i < (killCount / 20); i++) {
	spawnEnemy();

	}
}



     //Draw money and kills
	context.beginPath();
	context.fillStyle = "rgba(64, 64, 64, 0.2)"; // gray with 10% opacity
        context.fillRect(0, 0, canvas.width, 60);
     context.beginPath();
     context.fillStyle = "white";
     context.font = "32px Impact";
     context.textAlign = 'left';
     context.fillText("CASH: " + Math.trunc(money), 10, 30);
     context.textAlign = 'center';
     context.fillText("KILLS: " + killCount, 360, 30);
     //context.fillText("MOBS: " + enemies.length, 360, 40);
     context.font = "18px Impact";
     context.textAlign = 'right';
     context.fillText("SPAWNRATE: " + Math.trunc((spawnInfluence)*100) + "%", 710, 20);
     context.fillText("Game Timer: " + (Math.trunc(gameTimer/30)), 710, 40);

	    // Draw messages	

    context.beginPath();
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = "32px Impact";
    context.fillText(statusMessage, canvas.width/2, canvas.height/2);
    if(statusMessageTimeout > 0) {
        statusMessageTimeout--;
	context.beginPath();
	context.fillStyle = "rgba(64, 64, 64, 0.2)"; // gray with 10% opacity
        context.fillRect(0, (canvas.height/2)-50, canvas.width, 100);
    } else {
        statusMessage = '';
    }
     
     

 
 }, 30);
