// Game variables
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var offsetY = 0; // Offset for vertical scrolling
var offsetX = 0; // Offset for horizontal scrolling
var statusMessage = '';
var statusMessageTimeout = 0;
var enemies = [];
var gameTimer = 0;
var backgroundTextureImage = new Image();
var backgroundTexturePattern;
var hoveredGridSquare = null;
var projectiles = [];

var tileSize = 32; // Tile size in pixels
var mapWidth = 18040; // Width of the game map
var mapHeight = 9000; // Height of the game map

var upgradeMode = false;
var buildMode = false;
var towerToPlace = '';
let buildings = {};

var mapMode = false;

var money = 1000;
var killCount = 0;
var spawnInfluence = 0;

let keyStates = {};

var CCounter = 0;

    //make a grid
    var grid = [];
    var gridSize = 60;
    var gridRows = Math.floor((mapWidth) / gridSize); 
    var gridColumns = Math.floor(mapHeight / gridSize);
    console.log("Grid dimensions: ", gridRows,", ",gridColumns)

// Add event listener for the page load event
window.addEventListener('load', function() {
    // Initialize canvas and game-related elements
    initializeGame(); // SHOULD THIS BE A MAIN MENU?
    // Add event listeners for button clicks
    addEventListeners(); // SHOULD THIS BE IN INIT GAME?
});

// Variables for menu and buttons
var BUTTON_WIDTH = 192;
var BUTTON_HEIGHT = 64;
var BUTTON_SPACING = 30;
var menuWidth = 256;
var menuHeight = 720;
var buttonImages = [];
var depressedButtonImages = [];
var buttonNames = ["build", "upgrade", "spawn", "map"];
var menuBackgroundImage = new Image();
menuBackgroundImage.src = "menu_background.png";
var subMenuNames = ["laser", "bomb", "frost", "base", "fence", "back"];
var subMenuImages = [];
var depressedSubMenuImages = [];
var submenuPrices = [0, 0, 0, 0, 0];


// Preload button images
for (let i = 0; i < buttonNames.length; i++) {
    let buttonImage = new Image();
    buttonImage.src = buttonNames[i] + ".png";
    buttonImages.push(buttonImage);

    let depressedButtonImage = new Image();
    depressedButtonImage.src = buttonNames[i] + "_depressed.png";
    depressedButtonImages.push(depressedButtonImage);
}
// Preload submenu button images
for (let i = 0; i < subMenuNames.length; i++) {
    let buttonImage = new Image();
    buttonImage.src = subMenuNames[i] + ".png";
    subMenuImages.push(buttonImage);

    let depressedButtonImage = new Image();
    depressedButtonImage.src = subMenuNames[i] + "_depressed.png";
    depressedSubMenuImages.push(depressedButtonImage);
}

let isSubMenuActive = false;

// Event listener for keyboard input
window.addEventListener('keydown', function(event) {
    if (!isSubMenuActive) {
        switch (event.key) {
            case 'b': 
            case 'B': 
                isSubMenuActive = true;
                break;
            case 'u':
            case 'U':
                upgradeMode = !upgradeMode;
                break;
            case 'm':
            case 'M':
                mapMode = !mapMode;
                break;
            case 'Esc': 
            case 'Escape':
                upgradeMode = false;
                mapMode = false;
                buildMode = false;
                break;
            default:
                return;
        }
    } else {
        switch (event.key) {
            case 'l': 
            case 'L': 
                towerToPlace = 'laserTower';
                buildMode = true;
                break;
            case 'b':
            case 'B':
                towerToPlace = 'bombTower';
                buildMode = true;
                break;
            case 'f':
            case 'F':
                towerToPlace = 'iceTower';
                buildMode = true;
                break;
            case 'h':
            case 'H':
                towerToPlace = 'base';
                buildMode = true;
                break;
            case 'e':
            case 'E':
                    towerToPlace = 'fence';
                    buildMode = true;
                break;
            case 'Esc': 
            case 'Escape':
                isSubMenuActive = false;
                break;
            default:
                return;
        }
    }
});

// HANDLE MENU CLICKS
function handleMenuClick(e) {
    var mousePos = getMousePos(canvas, e);
    var x = canvas.width - menuWidth / 2 - BUTTON_WIDTH / 2;
    var names = isSubMenuActive ? subMenuNames : buttonNames;
    var initialY = (menuHeight - (names.length * BUTTON_HEIGHT) - ((names.length - 1) * BUTTON_SPACING)) / 2;

    for (let i = 0; i < names.length; i++) {
        var y = initialY + i * (BUTTON_HEIGHT + BUTTON_SPACING);
        if (mousePos.x >= x && mousePos.x <= x + BUTTON_WIDTH && mousePos.y >= y && mousePos.y <= y + BUTTON_HEIGHT) {
            if (isSubMenuActive) {
                context.drawImage(depressedSubMenuImages[i], x, y, BUTTON_WIDTH, BUTTON_HEIGHT);
                if (names[i] === "back") {
                    isSubMenuActive = false;
                    buildMode = false;
                }
                else if (names[i] === "base") {
                    buildMode = true;
                    towerToPlace = 'base';
                }
                else if (names[i] === "frost") {
                    buildMode = true;
                    towerToPlace = 'iceTower';
                }
                else if (names[i] === "laser") {
                    buildMode = true;
                    towerToPlace = 'laserTower';
                }
                else if (names[i] === "bomb") {
                    buildMode = true;
                    towerToPlace = 'bombTower';
                }
                else if (names[i] === "fence") {
                    buildMode = true;
                    towerToPlace = 'fence';
                }
            } else {
                context.drawImage(depressedButtonImages[i], x, y, BUTTON_WIDTH, BUTTON_HEIGHT);
                if (names[i] === "build") {
                    isSubMenuActive = true;
                }
                else if (names[i] === "upgrade") {
                    upgradeMode = !upgradeMode;
                }
            else if (names[i] === "map") {
                mapMode = !mapMode;
            }

            }
            return;
        }
    }
}

// DRAW THE MENU
function drawMenu() {
    context.drawImage(menuBackgroundImage, canvas.width - menuWidth, 0, menuWidth, menuHeight);

    var x = canvas.width - menuWidth / 2 - BUTTON_WIDTH / 2;
    var names = isSubMenuActive ? subMenuNames : buttonNames;
    var images = isSubMenuActive ? subMenuImages : buttonImages;
    var prices = isSubMenuActive ? submenuPrices : [];
    var initialY = (menuHeight - (names.length * BUTTON_HEIGHT) - ((names.length - 1) * BUTTON_SPACING)) / 2;

    for (let i = 0; i < names.length; i++) {
        var y = initialY + i * (BUTTON_HEIGHT + BUTTON_SPACING);
        context.drawImage(images[i], x, y, BUTTON_WIDTH, BUTTON_HEIGHT);
        
        if (isSubMenuActive) {
            var priceTagX = x + BUTTON_WIDTH - 64; // Positioned to the right of the button
            var priceTagY = y + BUTTON_HEIGHT + 0; // Vertically centered with the button
            var rectWidth = context.measureText("$" + prices[i]).width;
            var rectHeight = parseInt(context.font, 10); // height of rectangle based on font size
                
            context.font = "20px Impact"; // Change the font size and name to your preference
            
            // Fill the rectangle with black color
            context.fillStyle = "black";
            context.fillRect(priceTagX - 5, priceTagY - rectHeight, rectWidth + 10, rectHeight + 10);
            
            // Draw a white rectangle border around the text
            context.strokeStyle = "white"; // Set stroke color to white
            context.strokeRect(priceTagX - 5, priceTagY - rectHeight, rectWidth + 10, rectHeight + 10);
        
            // Change the color of the text to white
            context.fillStyle = "white";
            context.fillText("$" + prices[i], priceTagX, priceTagY);
        }
    }
}

// Utility function to get mouse position
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Event listener for user mouse click
canvas.addEventListener("click", handleMenuClick, false);


canvas.addEventListener('click', handleMouseClickInBuildMode);

function handleMouseClickInBuildMode(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (buildMode && hoveredGridSquare && x < canvas.width - menuWidth) {
        if (towerToPlace) {
            const onConfirmLocation = buildBuilding(towerToPlace, money);
            money = onConfirmLocation(hoveredGridSquare);
        }
    }
    if (upgradeMode && hoveredGridSquare && x < canvas.width - menuWidth) {
            money = upgradeBuilding(hoveredGridSquare);
      
    }
}



// FPS COUNTER

var frame = 0; 
var lastUpdateTime = Date.now();
var fps = 0;

function animate() {
  frame++;

  var currentTime = Date.now();

  if (currentTime - lastUpdateTime >= 1000) {
    fps = frame;
    frame = 0;
    lastUpdateTime = currentTime;
  }

  context.textAlign = 'left';
  context.fillStyle = "red";
  context.font = "20px Impact";

  // Display the FPS in the top left corner
  context.fillText("FPS: " + fps, 50 , canvas.height - 50);

  // Rest of your rendering code below
  // ...

  requestAnimationFrame(animate);
}

animate();


// Include CDN link in your HTML
// <script src="https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.3.0/simplex-noise.min.js"></script>

const simplex = new SimplexNoise();

var terrainTypesImages = {
  'grass': loadImage('grass.png'),
  'desert': loadImage('desert.png'),
  'badlands': loadImage('badlands.png')
};

function initializeGame() {
    // Load all textures
    console.log("Loading all textures");
    for(let type in terrainTypesImages) {
        terrainTypesImages[type].src = type + '.png';
        console.log(terrainTypesImages[type].src);
    }
    
backgroundTextureImage.onload = function() {

var noiseScale = 0.001
    for (var y = 0; y < mapHeight; y += tileSize) {
       // console.log("Running outer for loop");
        for (var x = 0; x < mapWidth; x += tileSize) {
       //     console.log("Running inner for loop");
            var noiseValue = simplex.noise2D(x * noiseScale, y * noiseScale);
            var terrainType;

            if(noiseValue < -0.5) {
                terrainType = 'desert';
            } else if (noiseValue < 0) {
                terrainType = 'badlands';
            } else {
                terrainType = 'grass';
            }

            var tileX = Math.floor(Math.random() * (terrainTypesImages[terrainType].width / tileSize));
            var tileY = Math.floor(Math.random() * (terrainTypesImages[terrainType].height / tileSize));

            patternContext.drawImage(terrainTypesImages[terrainType], tileX * tileSize, tileY * tileSize, tileSize, tileSize, x, y, tileSize, tileSize);
        }
    }

    backgroundTexturePattern = context.createPattern(patternCanvas, 'no-repeat');

};

var patternCanvas = document.createElement('canvas');
var patternContext = patternCanvas.getContext('2d');

patternCanvas.width = mapWidth;
patternCanvas.height = mapHeight;



    // Now this is outside of the onload function
    backgroundTextureImage.src = patternCanvas.toDataURL();
    // Load all textures
    for(let type in terrainTypesImages) {
        terrainTypesImages[type].src = type + '.png';
        terrainTypesImages[type].onload = function() {
            console.log(type + '.png has been loaded successfully');
        };
        terrainTypesImages[type].onerror = function() {
            console.log('Error loading ' + type + '.png');
        };
    }


  canvas.width = 1280;
  canvas.height = 720;
}



function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}


let bPressed = false;
//ADD EVENT LISTENERS
function addEventListeners() {
    // ACTION KEYS
    document.addEventListener('keydown', function(event) {

        if (event.key == 'G' || event.key == 'g') {
            const hives = generateHiveList(buildings);
            spawnEnemy(hives);
        }

        // Add event listener to build or upgrade buildings
            if ((event.key == 'X' || event.key == 'x') && !bPressed) {
                createHiveNearBase(money);
                bPressed = true;
            }
                if (event.key == 'X' || event.key == 'x') {
                    bPressed = false;
                }

    /*if (event.key == 'U' || event.key == 'u') {
        money = upgradeBuilding(hoveredGridSquare, money);
    }*/
    //...
});

// Move the screen
    // On keydown, change the state to true
window.addEventListener('keydown', event => {
    keyStates[event.key] = true;
});

// On keyup, change the state back to false
window.addEventListener('keyup', event => {
    keyStates[event.key] = false;
});

// Check for the key states
setInterval(() => {
    const canvasScrollSpeed = 10;
    if (keyStates['ArrowRight'] || keyStates['KeyD']) {
        // Scroll right.
        offsetX += canvasScrollSpeed;
    } 
    if (keyStates['ArrowLeft'] || keyStates['KeyA']) {
        // Scroll left.
        offsetX -= canvasScrollSpeed;
    } 
    if (keyStates['ArrowDown'] || keyStates['KeyS']) {
        // Scroll down.
        offsetY += canvasScrollSpeed;
    } 
    if (keyStates['ArrowUp'] || keyStates['KeyW']) {
        // Scroll up.
        offsetY -= canvasScrollSpeed;
    }
}, 1000/60); // Framerate of 60fps

    //MOVE SCREEN
     // Set this to the speed you want for scrolling
    // Add keydown event listener to move canvas on arrow key press.

    // Find out where the mouse is
    canvas.addEventListener('mousemove', function(event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left + offsetX;
        var y = event.clientY - rect.top + offsetY;
    
        // Calculate the grid coordinates based on the mouse position
        var gridX = Math.floor(x / gridSize);
        var gridY = Math.floor(y / gridSize);
    
        // Update the hoveredGridSquare
        hoveredGridSquare = { x: gridX, y: gridY };
    });
    

}



// Initialize the grid with zeros
for(var i = 0; i < gridRows; i++){
    grid[i] = [];
    for(var j = 0; j < gridColumns; j++){
        grid[i][j] = 0;
    }
}



/*
// Just spawn a basic enemy anywhere on the map
function spawnEnemy() {
    var enemyX = Math.random() * (canvas.width - gridSize);
    var enemyY = Math.random() * (canvas.height - gridSize);
    var start = { i: Math.round(enemyY / gridSize), j: Math.round(enemyX / gridSize) };
    var end = getNearestBaseCoordinates(enemyX, enemyY);
    var enemyPath = AStar(start, end);
    enemies.push(new Enemy(enemyX, enemyY, enemyPath));
    console.log("Spawned enemy at " + start + ". Walking to" + end + ". Taking route: " + enemyPath);
}*/
//Generate a list of hives
function generateHiveList(buildings) {
    const hives = [];
    for (let key in buildings) {
        if (buildings[key].type === 'hive') {
            hives.push(buildings[key]);
        }
    }
    return hives;
}

// Spawn an enemy at a hive
function spawnEnemy(hives) {
    if (!hives.length) {
        console.log("No hives present to spawn enemy");
        return;
    }

    // Choose a random hive from the hives array
    let hiveIndex = Math.floor(Math.random() * hives.length);
    let hive = hives[hiveIndex];
    //console.log("Chose hive" + JSON.stringify(hive));

    var enemyX = hive.x;
    var enemyY = hive.y;
    var start = { i: enemyY, j: enemyX };
    var end = getNearestBaseCoordinates(enemyX, enemyY);
    var enemyPath = AStar(start, end);
    enemies.push(new Enemy(enemyX * gridSize, enemyY *  gridSize, enemyPath));
    //console.log("enemyX: " + enemyX + " enemyY: " + enemyY);
    //console.log("Spawned enemy at " + JSON.stringify(start) + ". Walking to" + JSON.stringify(end));
}


// ***********************************
// HERE IS THE BUILDING CODE
// ***********************************
// define a directory of building types, levels, and their corresponding image sources
const buildingImgSources = {
    base: {
        maxLvl: 3,
        img: ["base1.png", "base2.png", "base3.png"]
    },
    hive: {
        maxLvl: 1,
        img: ["hive1.png"]
    },
    iceTower: {
        maxLvl: 3,
        img: ["iceTower1.png", "iceTower2.png", "iceTower3.png"]
    },
    laserTower: {
        maxLvl: 3,
        img: ["laserTower1.png", "laserTower2.png", "laserTower3.png"]
    },
    bombTower: {
        maxLvl: 3,
        img: ["bombTower1.png", "bombTower2.png", "bombTower3.png"]
    },
    fence: {
        maxLvl: 1,
        img: ["fence1.png"]
    }
};

class Building {
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.maxLevel = buildingImgSources[this.type].maxLvl;
        this.ready = false;
        this.image = new Image();
        this.image.onload = () => { this.ready = true; };
        this.updateImage();

        this.cost = Building.cost(type);


    if (type === 'bombTower' || type === 'laserTower' || type === 'iceTower') {
        this.bombFire = this.bombFire.bind(this);
        this.laserFire = this.laserFire.bind(this);
        this.iceFire = this.iceFire.bind(this);


        
    // Determine type of fire and target
        switch (this.type) {
            case 'bombTower':
                this.fire = this.bombFire;
                this.firingDelay = 200;
                
                this.range = 750;
                this.damage = 4;
                this.timeToFire = this.firingDelay;
                break;
            case 'laserTower':
                this.fire = this.laserFire;
                this.firingDelay = 10;

                this.range = 350;
                this.damage = 0.5;
                this.timeToFire = this.firingDelay;
                break;
            case 'iceTower':
                this.fire = this.iceFire;
                this.firingDelay = 10;

                this.range = 250;
                this.damage = 1;
                this.slow = 0.8
                this.timeToFire = this.firingDelay;
                break;
            default:
                console.error('Unknown tower type');
        }
    } else {
        // This will define an empty function for 'base' type buildings
        this.fire = () => {};
    }

    
}

static cost(type){
    switch(type){
        case 'bombTower':
            return 300;
        case 'laserTower':
            return 100;
        case 'iceTower':
            return 200;
        case 'base':
            return 500;
        case 'fence':
            return 10;
        default:
            console.error('Unknown tower type');
            return null;
    }
}

 
    
    //methods
    generateIncome() {
        return 100 * this.level; // just an example, adjust as per your game economy.
    }

    updateImage() {
        if (this.level <= buildingImgSources[this.type].maxLvl) {
            this.image.src = buildingImgSources[this.type].img[this.level - 1];
        }
    }

    upgrade(money){
        const cost = this.calculateCost();
        if(money < cost){
            console.log("Not enough money to upgrade")
            return false;
        }
        if(this.level >= this.maxLevel) {
            console.log(`${this.type} has reached maximum level`);
            return false;
        }
        money -= cost;
        this.level++;
        this.updateImage();
        console.log(`Building upgraded to level ${this.level}.`);
        return true;
    }

    calculateCost() {
        return this.cost;
    }

    calculateUpgradeCost() {
        // Implement your cost calculation logic here.
        // I'm just returning a mock value here for demonstration purposes.
        return 100;
    }

    draw() {
        //console.log('Ready status:', this.ready);
       // console.log('Image src:', this.image.src);
        if (this.ready) {
            //console.log("this.image: " + this.image + " this.x: " + this.x + " this.y: " + this.y + " offsetX: " + offsetX + " offsetY: " + offsetY + " gridSize: " + gridSize)
            context.drawImage(this.image, this.x * gridSize - offsetX, this.y * gridSize - offsetY, gridSize, gridSize);
        } else {
            console.error('Waiting for image to load');
        }
    }

    bombFire() {
        if (this.timeToFire <= 0) {
            //console.log("Cooldown elapsed, bomb tower firing");
            for (var j in enemies) {
                var enemy = enemies[j];
                var dx = (this.x * gridSize ) - (enemy.x + gridSize / 2);  // Calculate enemy center X
                var dy = (this.y * gridSize ) - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                var distance = Math.sqrt(dx * dx + dy * dy);
                //console.log("Checking range. Distance is " + distance + ". Range is " + this.range );
                if(distance < this.range) {
                    projectiles.push(new Projectile(this.x * gridSize, this.y * gridSize, enemy));
                    this.timeToFire = this.firingDelay;
                    break;
                }
            }
        } else {
            this.timeToFire--;
        }
    }



    // LASER FIRE FUNCTION 
    laserFire() {
        	//console.log("Start of this.fire function");
            if (this.timeToFire <= 0) {
                //console.log("Cooldown elapsed, laser tower firing");
                        for (var j in enemies) {
                //console.log("Fire loop for enemy #" + JSON.stringify(enemies[j]));
                            var enemy = enemies[j];
                            var dx = (this.x * gridSize ) - (enemy.x + gridSize / 2);  // Calculate enemy center X
                            var dy = (this.y * gridSize ) - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                            var distance = Math.sqrt(dx * dx + dy * dy);
                //console.log("Checking range. Distance is " + distance + ". Range is " + this.range );

              /* context.beginPath();
                context.moveTo(this.x * gridSize, this.y * gridSize);
                // Draw the line to the enemy's position
                context.lineTo(enemy.x + gridSize / 2, enemy.y + gridSize / 2);
                context.stroke();*/

                            if(distance < this.range) {
                //console.log("In range, range = " + this.range);
                                // Draw a line between tower and enemy within range
                                //context.drawImage(towerImageFiring, this.x, this.y, gridSize, gridSize); // Draw tower image
                                context.beginPath();
                                context.strokeStyle = 'red';
                                context.moveTo((this.x * gridSize) - offsetX + 32, (this.y * gridSize) - offsetY + 32);  // Tower center
                                context.lineTo((enemy.x) - offsetX + 32, (enemy.y) - offsetY + 32);  // Enemy center
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
                    
                                
            
                                this.timeToFire = this.firingDelay;
                                break;
                            }
                        }
                    } else {
                        this.timeToFire--;
                    }
                }
        
    

    iceFire() {
                	//console.log("Start of this.fire function");
                    if (this.timeToFire <= 0) {
                        //console.log("Cooldown elapsed, ice Tower firing");
                                for (var j in enemies) {
                        //console.log("Fire loop for enemy #" + JSON.stringify(enemies[j]));
                                    var enemy = enemies[j];
                                    var dx = (this.x * gridSize ) - (enemy.x + gridSize / 2);  // Calculate enemy center X
                                    var dy = (this.y * gridSize ) - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                                    var distance = Math.sqrt(dx * dx + dy * dy);
                        //console.log("Checking range. Distance is " + distance + ". Range is " + this.range );
        
                      /* context.beginPath();
                        context.moveTo(this.x * gridSize, this.y * gridSize);
                        // Draw the line to the enemy's position
                        context.lineTo(enemy.x + gridSize / 2, enemy.y + gridSize / 2);
                        context.stroke();*/
        
                                    if(distance < this.range) {
                        //console.log("In range, range = " + this.range);
                                        // Draw a line between tower and enemy within range
                                        //context.drawImage(towerImageFiring, this.x, this.y, gridSize, gridSize); // Draw tower image
                                        context.beginPath();
                                        context.strokeStyle = 'blue';
                                        context.moveTo((this.x * gridSize) - offsetX + 32, (this.y * gridSize) - offsetY + 32);  // Tower center
                                        context.lineTo((enemy.x) - offsetX + 32, (enemy.y) - offsetY + 32);  // Enemy center
                                        context.lineWidth = 4;
                                        context.stroke();
                                        enemy.hp = enemy.hp - this.damage;                    
                                        enemy.speed = enemy.speed * this.slow;
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

    /*fire() {
        switch(this.type) {
            case 'bomb':
                this.bombFire();
                break;
            case 'laser':
                this.laserFire();
                break;
            case 'ice':
                this.iceFire();
                break;
            default:
                console.error('Fire method not assigned');
        }
    }*/

    }


// a directory of building types and maximum levels
const buildingTypes = {
    base: 3,
    hive: 1,
    iceTower: 3,
    laserTower: 3,
    bombTower: 3,
    fence: 1
};


// build building function
function buildBuilding(type, money) {
    let newBuilding;
    let remainingMoney = money;

    function onConfirmLocation(hoveredGridSquare) {
        let i = Math.round(hoveredGridSquare.y);
        let j = Math.round(hoveredGridSquare.x);
        //console.log("i set to " + i + ", j set to " + j);
        
        if (i >= gridRows || j >= gridColumns) {
            statusMessage = 'Invalid tower location';
            statusMessageTimeout = 120;
            console.log("Error building tower");
            return remainingMoney;
        } else if (grid[i][j] == 1) {
            statusMessage = 'Cant build a tower on another tower';
            statusMessageTimeout = 120;
            console.log("Error building tower");
            return remainingMoney;
        }
        
        if (hoveredGridSquare !== null) {
            newBuilding = new Building(hoveredGridSquare.x, hoveredGridSquare.y, type);
            const cost = newBuilding.calculateCost();
            console.log("Cost is " + cost);
            if (remainingMoney < cost) {
                console.log("Not enough money to build");
                return remainingMoney;
            }
            console.log("Going to deduct cost. Money = " + remainingMoney);
            remainingMoney -= cost;
            console.log("Money now " + remainingMoney)
            buildings[`${hoveredGridSquare.x},${hoveredGridSquare.y}`] = newBuilding;
            if (type !== 'base') {
                grid[i][j] = 1; // Set grid value to 1 if the building is not a base
            }
            console.log(`A ${type} building was built at.` + i + j + ", value set to " + grid[i][j]);
            buildMode = false;
        }
        return remainingMoney;
    }

    return onConfirmLocation;
}



//Upgrade building
function upgradeBuilding(hoveredGridSquare, money) {
    let remainingMoney = money;
    if (hoveredGridSquare !== null) {
        var key = `${hoveredGridSquare.x},${hoveredGridSquare.y}`
        if (buildings[key]) {
            const upgradeCost = buildings[key].calculateUpgradeCost();
            if (remainingMoney < upgradeCost) {
                console.log("Not enough money to upgrade");
                return remainingMoney;
            }
            remainingMoney -= upgradeCost;
            buildings[key].upgrade();
            console.log(`Upgraded the building at ${key}.`);
        }
    }
    return remainingMoney;
}

//Create a hive
function createHiveNearBase(money) {
    let randomLocation = getNearestBaseCoordinates(offsetX, offsetY);
    if (!randomLocation) {
        console.log("No base exists");
        return;
    }
    let xStart = Math.max(0, randomLocation.j - 10);
    let yStart = Math.max(0, randomLocation.i - 10);
    let xEnd = Math.min(gridColumns - 1, randomLocation.j + 10);
    let yEnd = Math.min(gridRows - 1, randomLocation.i + 10);
    let randomI, randomJ;
    do {
        randomI = Math.floor(Math.random() * (yEnd - yStart + 1)) + yStart;
        randomJ = Math.floor(Math.random() * (xEnd - xStart + 1)) + xStart;
    } while (grid[randomI][randomJ] !== 0);
    const randomHiveLocation = { x: randomJ, y: randomI };
    console.log("Building hive at " + JSON.stringify(randomHiveLocation));
    const onConfirmHiveLocation = buildBuilding('hive', money);
    money = onConfirmHiveLocation(randomHiveLocation);
}


// Bomb constructor
function Bomb(x, y, target){
    this.x = x;
    this.y = y;
    this.speed = 30;
    this.target = target;
    this.life = 500; // Life of the bomb. This could be adjusted based on the desired decay speed.
}

// main enemy
// Enemy constructor
function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 3;
    this.hp = 7;
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
            this.spriteSheet, 
            this.currentFrame * this.frameWidth,
            this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            this.x - offsetX, 
            this.y - offsetY, 
            gridSize * 1.0, 
            gridSize * 1.0
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
    this.move = function () {
        var gridX = Math.round((this.x) / gridSize);
        var gridY = Math.round((this.y) / gridSize);
    
        if (!this.path.length || this.justChangedDirection || --this.pathUpdateCountdown <= 0) {
            this.justChangedDirection = false;
            var startNode = { i: gridY, j: gridX, f: 0, g: 0, h: 0 };
            //console.log("Start Node: "+ JSON.stringify(startNode));
            var {i: endNodeI, j: endNodeJ} = getNearestBaseCoordinates(this.x + offsetX, this.y + offsetY);
            //console.log("getNearestBaseCoordinates: " + JSON.stringify(getNearestBaseCoordinates(this.x + offsetX, this.y + offsetY)));
            var endNode = { i: endNodeI, j: endNodeJ, f: 0, g: 0, h: 0 };
            this.path = AStar(startNode, endNode);
            this.pathUpdateCountdown = this.pathUpdateFrequency;
            //console.log("Picked path: " + JSON.stringify(this.path));
        }
    
        if (this.path && this.path.length > 0) {
            var nextStep = this.path[0];
    
            if (nextStep.i > gridY) this.direction = 'down';
            else if (nextStep.i < gridY) this.direction = 'up';
            else if (nextStep.j > gridX) this.direction = 'right';
            else if (nextStep.j < gridX) this.direction = 'left';
    
            if (gridX === nextStep.j && gridY === nextStep.i) {
                var distanceToNextCellCenter = Math.sqrt((this.x + offsetX - nextStep.j * gridSize) ** 2 + (this.y + offsetY - nextStep.i * gridSize) ** 2);

                if (distanceToNextCellCenter > this.speed) {
                    this.path.shift();
                }
            }
        }
    
        if (this.direction === "right") this.x += this.speed;
        else if (this.direction === "left") this.x -= this.speed;
        else if (this.direction === "up") this.y -= this.speed;
        else if (this.direction === "down") this.y += this.speed;
    
        if (gameTimer % this.frameUpdateInterval === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
    };
    
    
}


// Find the nearest base
function getNearestBaseCoordinates(enemyX, enemyY) {
    var closestDistance = Infinity;
    var closestBaseKey = null;

    for (var key in buildings) {
        if (buildings[key].type == 'base') {
            var baseX = buildings[key].x;
            var baseY = buildings[key].y;
            var distance = Math.sqrt(Math.pow(baseX - enemyX, 2) + Math.pow(baseY - enemyY, 2));

            if (distance < closestDistance) {
                closestDistance = distance;
                closestBaseKey = key;
            }
        }
    }

    if (closestBaseKey === null) {
        return null;
    } else {
        var closestBaseX = buildings[closestBaseKey].x;
        var closestBaseY = buildings[closestBaseKey].y;
        //console.log("Closest Base Key: " + closestBaseKey);
        //console.log("Closest Base X: " + closestBaseX);
        //console.log("Closest Base Y: " + closestBaseY);
        return { i: closestBaseY, j: closestBaseX };
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
            //console.log("NON-TRAVERSABLE: " + grid[a.i][a.j]);// print to console
            
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

// Bomb constructor
function Projectile(x, y, target){
    this.x = x;
    this.y = y;
    this.speed = 20;
    this.target = target;
    this.life = 300; // Life of the projectile. This could be adjusted based on the desired decay speed.
    this.damage = 7
}

//*******************************************************************************************
//***********************THIS IS WHERE THE GAME LOOP STARTS.*********************************
//*******************************************************************************************

var gameLoop = setInterval(function(){
    // Updated game loop
    gameTimer += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);


    
// Draw the background texture for each tile
if (mapMode === false){
    for (var i = Math.floor((offsetY / gridSize)); i < Math.min(gridRows, Math.ceil((offsetY + canvas.height) / gridSize)); i++) {
        for (var j = Math.floor((offsetX / gridSize)); j < Math.min(gridColumns, Math.ceil((offsetX + canvas.width) / gridSize)); j++) {
            // Get repeatable texture
            context.fillStyle = backgroundTexturePattern;

            context.save();
            context.translate(-offsetX, -offsetY);
            context.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            context.restore();
        }
    }
} else if (mapMode === true){
    // Normal scale
    for (var i = Math.floor(offsetY / gridSize); i < Math.min(gridRows, Math.ceil((offsetY + canvas.height) / gridSize) * 3); i++) {
        for (var j = Math.floor(offsetX / gridSize); j < Math.min(gridColumns, Math.ceil((offsetX + canvas.width) / gridSize) * 3); j++) {
            // Get repeatable texture
            context.fillStyle = backgroundTexturePattern;

            context.save();
            context.scale(0.333, 0.333);  
            context.translate(-offsetX, -offsetY);
            context.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            context.restore();
        }
    }
}


//console.log("Drew " + CCounter + " grid squares");
//CCounter = 0;

// Draw grid
if (buildMode || upgradeMode) {
for (var i = Math.floor((offsetY / gridSize)); i < Math.min(gridRows, Math.ceil((offsetY + canvas.height) / gridSize)); i++) {
    for (var j = Math.floor((offsetX / gridSize)); j < Math.min(gridColumns, Math.ceil((offsetX + canvas.width) / gridSize)); j++) {
        context.lineWidth = 1;
        context.strokeStyle = "lightgrey";
        context.strokeRect(j * gridSize - offsetX, i * gridSize - offsetY, gridSize, gridSize);

        // Display numbers on each grid tile
        /*context.textAlign = 'center';
        context.fillStyle = "black";
        context.font = "10px Arial";
        context.fillText((i*gridColumns)+j+1, j*gridSize - offsetX + gridSize/2, i*gridSize - offsetY + gridSize/2);
*/

        // Check if this grid square matches the hoveredGridSquare
        if (hoveredGridSquare && j === hoveredGridSquare.x && i === hoveredGridSquare.y) {
            context.lineWidth = 1;
            context.fillStyle = "rgba(255, 255, 0, 0.3)"; // Yellow highlight
            context.fillRect(j * gridSize - offsetX, i * gridSize - offsetY, gridSize, gridSize);
        }
    }
}
}

// SHOW COST TOOLTIP
if (upgradeMode)
{
    if (hoveredGridSquare !== null) {
        var key = `${hoveredGridSquare.x},${hoveredGridSquare.y}`
        if (buildings[key]) {
            const upgradeCost = buildings[key].calculateUpgradeCost();

            // Assuming ctx is your canvas context
            // Set styles for the box
            context.fillStyle = "#333";
            context.strokeStyle = '#fff';

            // Calculate position for the box 
            var boxX = hoveredGridSquare.x * gridSize;
            var boxY = hoveredGridSquare.y * gridSize+64;

            // Set properties for the textbox
            context.font = '20px Impact';
            var text = "$" + upgradeCost;
            var textWidth = context.measureText(text).width;

            // Draw the box
            context.fillRect(boxX, boxY, textWidth + 10, 30);
            context.strokeRect(boxX, boxY, textWidth + 10, 30);

            // Set styles for the text
            context.fillStyle = "#fff";

            // Draw the text
            context.fillText(text, boxX + 5, boxY + 18);
        }
    }
}


// Draw buildings and fire
Object.values(buildings).forEach((building) => {
    building.draw();
    if(typeof building.fire === 'function') {
        // Only call .fire if it's defined as a function on the building object
        building.fire();
    }
});

//passive income every 10 sec
if (gameTimer % 300 === 0) {
var incomePerTick = 0;
for (var key in buildings) {
    if (buildings.hasOwnProperty(key) && buildings[key].type === 'base') {
        incomePerTick += buildings[key].generateIncome();
    }
}
// Add the generated income to the player's total income
money += incomePerTick;
}

//Draw menu
submenuPrices = [Building.cost("laserTower"), Building.cost("bombTower"), Building.cost("iceTower"), Building.cost("base"), Building.cost("fence"), 0];
drawMenu();

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

        if(distance < 10){
            //console.log("Bomb just hit an enemy!");

            context.beginPath();
            context.arc(projectile.x - offsetX, projectile.y - offsetY, 50, 0, Math.PI * 2, true); 
            context.fillStyle = "red";
            context.fill();

            // If we hit an enemy, iterate through all other enemies and check if splash damage should apply
            var splashRadius = 100;  // Set this to whatever your desired splash radius is
            for(var j in enemies){
                var otherEnemy = enemies[j];
                var splashDx = otherEnemy.x - enemy.x;
                var splashDy = otherEnemy.y - enemy.y;
                var splashDistance = Math.sqrt(splashDx * splashDx + splashDy * splashDy);

                if(splashDistance <= splashRadius){
                    otherEnemy.hp -= projectile.damage;  // Apply damage
                    //console.log("Damaged another enemy");
                }
            }            

            enemy.hp -= projectile.damage; // initial enemy damage, outside the radius

            if (enemy.hp <= 0){
                var enemyIndex = enemies.indexOf(enemy);
                if (enemyIndex > -1){
                    enemies.splice(enemyIndex, 1);
                    money += 20;
                    killCount++;
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
            context.beginPath();
            context.arc(projectile.x - offsetX, projectile.y - offsetY, 10, 0, Math.PI * 2, false);  // Change the "10" to your desired radius
            context.fillStyle = "black";
            context.fill();

        }  
		
		if(projectile.life <= 0){
			projectiles.splice(i, 1);
		}		
    }

    const hives = generateHiveList(buildings);
    
if(hives.length === 0)
{
    console.log("No hives. Looking for a base. Number of buildings:" + Object.values(buildings).length);
    //console.log("Buildings: " + JSON.stringify(buildings));

    let containsBase = false;
    let buildingValues = Object.values(buildings);
    for(let i=0; i<buildingValues.length; i++){
        //console.log("Cheking: " + JSON.stringify(buildingValues[i]) + ". Type is " + JSON.stringify(buildingValues[i].type));
        if(buildingValues[i].type === 'base'){
            console.log("At least one base building has been built.");
            createHiveNearBase(money);
            console.log("Hives now " + hives.length);
            containsBase = true;
            break;
        }
    }
}

    

    // Spawn enemies
    
spawnInfluence = (0.001 * (10+killCount) * (hives.length)/2);
if(Math.random() < spawnInfluence && enemies.length <= (killCount / 3)+1) {

spawnEnemy(hives);

}

//Move and draw enemies
for(var i in enemies) {
    var enemy = enemies[i];
    //console.log("Enemy moving ",enemy)

    enemy.move();
    enemy.draw();
    
    // Draw Path
    context.strokeStyle = 'red';
    //console.log("Attempting to draw path, ", enemy.path)
    //enemy.path.forEach((point) => {
        // Highlight the square in green
    //    context.fillStyle = "rgba(0, 255, 0, 0.5)"; // Green with 50% opacity
    //    context.fillRect(point.j * gridSize, point.i * gridSize, gridSize, gridSize);
    //});

    // Check for lose condition
    /*if (enemy.y + gridSize >= canvas.height - 150) {
        statusMessage = 'Game Over.';
        statusMessageTimeout = 9999;
        clearInterval(gameLoop);  // End the game loop
        //return;  // If you want to stop execution after losing
    }*/
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
