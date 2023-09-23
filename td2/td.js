// Game variables
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var backgroundCanvas = document.createElement('canvas');
var backgroundContext = backgroundCanvas.getContext('2d');

/*
// Audio
// Create an AudioContext
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Define an object to store loaded audio buffers
var audioBuffers = {};

// Function to load and decode audio
function loadAudio(url, callback) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer, callback));
}

// Function to play audio from a loaded buffer
function playAudio(buffer) {
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0); // Start playing the audio
}

// Load multiple audio files
var audioFiles = [
    { name: 'bombFire', url: 'bombFire.wav' },
    { name: 'bombExplode', url: 'bombExplode.wav' },
    { name: 'iceFire', url: 'iceFire.wav' },
    { name: 'income', url: 'income.wav' },
    { name: 'laserFire', url: 'laserFire.wav' },
    // Add more audio files as needed
];

// Load each audio file and store them in the audioBuffers object
var loadedCount = 0;

audioFiles.forEach(function (audioFile) {
    loadAudio(audioFile.url, function (decodedData) {
        // Store the decoded audio data in the audioBuffers object
        audioBuffers[audioFile.name] = decodedData;

        // Increment the loadedCount
        loadedCount++;

        // Check if all files are loaded
        if (loadedCount === audioFiles.length) {
            // All audio files are loaded and ready to play

            // Example: Play 'sound1'
            playAudio(audioBuffers['income']);
        }
    });
});*/

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
var mapModeMultiplier = 1;

var tileSize = 32; // Tile size in pixels
var mapWidth = 18040; // Width of the game map
var mapHeight = 9000; // Height of the game map

var upgradeMode = false;
var buildMode = false;
var towerToPlace = '';
let buildings = [];

var mapMode = false;

var money = 1000;
var killCount = 0;
var spawnInfluence = 0;
var killReward = 10;

let keyStates = {};

let containsBase = false;

var displayStartMenu = true;

var CCounter = 0;

var incomePerTick = 0;
var manualSpawned = 0;

let lastPath = {
    path: null,
    end: null
  };

    //make a grid
    var grid = [];
    var gridSize = 60;
    var gridRows = Math.floor((mapWidth) / gridSize); 
    var gridColumns = Math.floor(mapHeight / gridSize);
    //console.log("Grid dimensions: ", gridRows,", ",gridColumns)
    backgroundCanvas.width = gridColumns * gridSize;
    backgroundCanvas.height = gridRows * gridSize;




// Add event listener for the page load event
window.addEventListener('load', function() {
    // Initialize canvas and game-related elements
    initializeGame(); // SHOULD THIS BE A MAIN MENU?
    // Add event listeners for button clicks
    addEventListeners(); // SHOULD THIS BE IN INIT GAME?

    offsetX = 4000;
    offsetY = 6000;
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
                setTimeout(() => {
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
            }, 200);

            } else {
                context.drawImage(depressedButtonImages[i], x, y, BUTTON_WIDTH, BUTTON_HEIGHT);
                setTimeout(() => {
                if (names[i] === "build") {
                    isSubMenuActive = true;
                }
                else if (names[i] === "upgrade") {
                    upgradeMode = !upgradeMode;
                }
            else if (names[i] === "map") {
                mapMode = !mapMode;
            }
        }, 200);
            }
            return;
        }
    }
}

// START MENU
// Add an image button to your start menu
var startButtonImage = new Image();
startButtonImage.src = "check.png";
var depressedStartButtonImage = new Image();
depressedStartButtonImage.src = "check_depressed.png";

var startButtonPos = {x: 600, y: 500};
var startButtonDim = {width: 64, height: 64};

// Load event listener for start button click
if (killCount < 1 && containsBase == false) {
canvas.addEventListener('mousedown', function(e) {
    var mousePos = getMousePos(canvas, e);
    if (mousePos.x >= startButtonPos.x && mousePos.x <= startButtonPos.x + startButtonDim.width && mousePos.y >= startButtonPos.y && mousePos.y <= startButtonPos.y + startButtonDim.height) {
        displayStartMenu = false;
        context.drawImage(depressedStartButtonImage, startButtonPos.x, startButtonPos.y, startButtonDim.width, startButtonDim.height);
    }
});
}

// Draw the start menu
function drawStartMenu() {
    context.globalAlpha = 0.5;
    context.fillStyle = 'black';
    context.fillRect(100, 200, 720, 400);
    context.globalAlpha = 1.0;
    
    context.lineWidth = 3;
    context.strokeStyle = 'white';
    context.strokeRect(100, 200, 720, 400);
    
    context.font = '24px Impact';
    context.textAlign = 'left';
    context.fillStyle = 'white';
    context.fillText('Build bases and defend them against the hives that spawn.', 120, 220);
    context.fillText('Each base will give you income depending on its level.', 120, 250);
    context.fillText('Using your income, build towers to defend your bases.', 120, 280);
    context.fillText('Upgrade your towers to improve their effectiveness.', 120, 310);
    context.fillText('Do your best and see how far you can get.', 120, 340);
    context.fillText('Press the button to begin.', 120, 400);

    context.drawImage(startButtonImage, startButtonPos.x, startButtonPos.y, startButtonDim.width, startButtonDim.height);


}

// DRAW THE MENU
function drawMenu() {
    submenuPrices = [Building.cost("laserTower"), Building.cost("bombTower"), Building.cost("iceTower"), Building.cost("base"), Building.cost("fence"), 0];
    context.lineWidth = 2;
    context.drawImage(menuBackgroundImage, canvas.width - menuWidth, 0, menuWidth, menuHeight);

    var x = canvas.width - menuWidth / 2 - BUTTON_WIDTH / 2;
    var names = isSubMenuActive ? subMenuNames : buttonNames;
    var images = isSubMenuActive ? subMenuImages : buttonImages;
    var prices = isSubMenuActive ? submenuPrices : [];
    var initialY = (menuHeight - (names.length * BUTTON_HEIGHT) - ((names.length - 1) * BUTTON_SPACING)) / 2;

    context.beginPath;
    context.fillStyle = "white";
    context.font = "36px Impact";
    context.textAlign = 'left';
    context.fillText("MONEY: " + Math.trunc(money), 1075, 660);
    
    if (!isSubMenuActive) {
        context.font = "18px Impact";
        context.fillText("KILLS: " + killCount, 1100, 620);
        //context.fillText("MOBS: " + enemies.length, 360, 40);
        context.fillText("SPAWNRATE: " + Math.trunc((spawnInfluence)*100) + "%", 1100, 590);
        context.fillText("Game Timer: " + (Math.trunc(gameTimer/30)), 1100, 560);
    }
    context.font = "16px Impact"; // Change the font size and name to your preference
    for (let i = 0; i < names.length; i++) {
        
        var y = initialY + i * (BUTTON_HEIGHT + BUTTON_SPACING);
        context.drawImage(images[i], x, y, BUTTON_WIDTH, BUTTON_HEIGHT);


        if (isSubMenuActive) {
            var priceTagX = x + BUTTON_WIDTH - 64; // Positioned to the right of the button
            var priceTagY = y + BUTTON_HEIGHT + 0; // Vertically centered with the button
            var rectWidth = context.measureText("$" + prices[i]).width;
            var rectHeight = parseInt(context.font, 10); // height of rectangle based on font size
                
            context.font = "16px Impact"; // Change the font size and name to your preference
            
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

  requestAnimationFrame(animate);
}
animate();

// init simplex noise for map generation
const simplex = new SimplexNoise();

// Types of terrains
var terrainTypesImages = {
  'grass': loadImage('grass.png'),
  'desert': loadImage('desert.png'),
  'badlands': loadImage('badlands.png')
};

// Initialize game
function initializeGame() {
    // Load all textures
    for(let type in terrainTypesImages) {
        terrainTypesImages[type].src = type + '.png';
        //console.log(terrainTypesImages[type].src);

    }
    
backgroundTextureImage.onload = function() {

var noiseScale = 0.001
    for (var y = 0; y < mapHeight; y += tileSize) {

        for (var x = 0; x < mapWidth; x += tileSize) {

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

        // Now that the background texture is fully loaded and created, you can call renderBackgroundTexture
        renderBackgroundTexture();
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
            //console.log(type + '.png has been loaded successfully');
        };
        terrainTypesImages[type].onerror = function() {
            //console.log('Error loading ' + type + '.png');
        };
    }


  canvas.width = 1280;
  canvas.height = 720;



}

// Load an image
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// Render the background texture to the offscreen canvas (do this once)
function renderBackgroundTexture() {
    //console.log("Rendering background texture.");
    for (var i = 0; i < gridRows; i++) {
        for (var j = 0; j < gridColumns; j++) {
            // Set the background pattern
            backgroundContext.fillStyle = backgroundTexturePattern;
            
            // Draw a tile on the offscreen canvas
            backgroundContext.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
        }
    }
}


let bPressed = false;
//ADD EVENT LISTENERS
function addEventListeners() {
    // ACTION KEYS
    document.addEventListener('keydown', function(event) {

        if (event.key == 'G' || event.key == 'g') {
            const hives = generateHiveList(buildings);
            spawnEnemy(hives);
            manualSpawned++;
        }

        // Add event listener to build or upgrade buildings
            if ((event.key == 'X' || event.key == 'x') && !bPressed) {
                createHiveNearBase(money);
                bPressed = true;
            }
                if (event.key == 'X' || event.key == 'x') {
                    bPressed = false;
                }

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

// MAP SCROLLING
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


    // Find out where the mouse is
    canvas.addEventListener('mousemove', function(event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left + offsetX;
        var y = event.clientY - rect.top + offsetY;
    
        // Calculate the grid coordinates based on the mouse position
        var gridX = Math.floor(x / gridSize);
        var gridY = Math.floor(y / gridSize);
    
        // Update the hoveredGridSquare
        hoveredGridSquare = getGridSquare(gridX, gridY);
    });
    
}

// Get grid square number function
function getGridSquare(gridX, gridY) {
    for(let buildingIndex in buildings){
        let building = buildings[buildingIndex];
        if(building.x == gridX && building.y == gridY){
            return {
                x: gridX,
                y: gridY,
                building: building
            };
        }
    }

    return {
      x: gridX,
      y: gridY,
      building: null
    };
}



// Initialize the grid with zeros
for(var i = 0; i < gridRows; i++){
    grid[i] = [];
    for(var j = 0; j < gridColumns; j++){
        grid[i][j] = 0;
    }
}


// Generate a list of hives
function generateHiveList(buildings) {
    const hives = [];
    for (let key in buildings) {
        if (buildings[key].type === 'hive') {
            hives.push(buildings[key]);
        }
    }
    return hives;
}
// Spawn enemies at hives
function spawnEnemy(hives) {
    if (!hives.length) {
        return;
    }

    let hiveIndex = Math.floor(Math.random() * hives.length);
    let hive = hives[hiveIndex];

    var enemyX = hive.x;
    var enemyY = hive.y;
    var start = { i: enemyY, j: enemyX };
    var end = getNearestBaseCoordinates(enemyX, enemyY);
    var enemyPath;

    if(lastPath.path && lastPath.end.i === end.i && lastPath.end.j === end.j){
        if(isPathStillValid(lastPath.path)) {
            enemyPath = [...lastPath.path];
            //console.log("Using last path");
        } else {
            enemyPath = AStar(start, end);
            lastPath = {
                path: [...enemyPath],
                end: { i: end.i, j: end.j }
            };
            //console.log("Finding new path");
        }
    } else {
        enemyPath = AStar(start, end);
        lastPath = {
            path: [...enemyPath],
            end: { i: end.i, j: end.j }
        };
    }

    enemies.push(new Enemy(enemyX * gridSize, enemyY *  gridSize, enemyPath));
}

// Spawn many enemies at hives
function spawnManyEnemies(hives, number) {
    if (!hives.length) {
        return;
    }

    let hiveIndex = Math.floor(Math.random() * hives.length);
    let hive = hives[hiveIndex];

    var enemyX = hive.x;
    var enemyY = hive.y;
    var start = { i: enemyY, j: enemyX };
    var end = getNearestBaseCoordinates(enemyX, enemyY);
    var enemyPath;
        enemyPath = AStar(start, end);
        for(let i = 0; i < number; i++) {
    enemies.push(new Enemy(enemyX * gridSize, enemyY *  gridSize, enemyPath));
        }
}

// Check if a path is still valid
function isPathStillValid(path) {
    for(let i = 0; i < path.length; i++) {
        if(grid[path[i].i][path[i].j] === 1) {
            // If there is a new obstacle at path[i], return false
            //console.log("Found obstacle in previous path");
            return false;
            
        }
    }
    //console.log("No obstacles in previous path.");
    return true;
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

// a directory of building types and maximum levels
const buildingTypes = {
    base: 3,
    hive: 1,
    iceTower: 3,
    laserTower: 3,
    bombTower: 3,
    fence: 1
};

// BUILDING CLASS
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
        this.hp = 20;

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
                this.damage = 3;
                this.timeToFire = this.firingDelay;
                break;
            case 'laserTower':
                this.fire = this.laserFire;
                this.firingDelay = 10;

                this.range = 350;
                this.damage = 0.3;
                this.timeToFire = this.firingDelay;
                break;
            case 'iceTower':
                this.fire = this.iceFire;
                this.firingDelay = 10;

                this.range = 250;
                this.damage = 0.5;
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

takeDamage() {
    this.hp -= 1;
    //console.log("Took damage. HP now " + this.hp);

    if (this.hp <= 0) {
        const index = buildings.indexOf(this);
        buildings.splice(index, 1);
        //console.log("Removing building:" + JSON.stringify(index));
    }
}


    updateImage() {
        if (this.level <= buildingImgSources[this.type].maxLvl) {
            this.image.src = buildingImgSources[this.type].img[this.level - 1];
        }
    }

    upgrade(){
        let remainingMoney = money;
        let cost = this.calculateUpgradeCost();
        if(money < cost){

            statusMessage = "Insufficient funds.";
            statusMessageTimeout = 120;
            return false;
        }
        if(this.level >= this.maxLevel) {

            statusMessage = "Already at max level.";
            statusMessageTimeout = 120;
            return false;
        }

        remainingMoney -= cost;
        this.level++;
        this.updateImage();
        money = remainingMoney;
        return true;
    }

    calculateCost() {
        return this.cost;
    }

    calculateUpgradeCost() {
        return this.cost * (this.level+1) * this.level;
    }

    draw() {

        if (this.ready && mapMode == false) {
            //console.log("this.image: " + this.image + " this.x: " + this.x + " this.y: " + this.y + " offsetX: " + offsetX + " offsetY: " + offsetY + " gridSize: " + gridSize)
            context.drawImage(this.image, this.x * gridSize - offsetX, this.y * gridSize - offsetY, gridSize, gridSize);
        } else {

        }
    }

    bombFire() {
        if (this.timeToFire <= 0) {
            for (var j in enemies) {
                var enemy = enemies[j];
                var dx = (this.x * gridSize ) - (enemy.x + gridSize / 2);  // Calculate enemy center X
                var dy = (this.y * gridSize ) - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                var distance = Math.sqrt(dx * dx + dy * dy);
                    if(distance < this.range) {
                    projectiles.push(new Projectile(this.x * gridSize, this.y * gridSize, enemy));
                    this.timeToFire = this.firingDelay;
                    break;
                }
            }
        } else {
            this.timeToFire = this.timeToFire - (1 * this.level);
        }
    }



    // LASER FIRE FUNCTION 
    laserFire() {
            if (this.timeToFire <= 0) {
                        for (var j in enemies) {
                            var enemy = enemies[j];
                            var dx = (this.x * gridSize ) - (enemy.x + gridSize / 2);  // Calculate enemy center X
                            var dy = (this.y * gridSize ) - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                            var distance = Math.sqrt(dx * dx + dy * dy);
                            if(distance < this.range) {

                                // Draw a line between tower and enemy within range
                                //context.drawImage(towerImageFiring, this.x, this.y, gridSize, gridSize); // Draw tower image
                                if (mapMode == false)
                                {
                                context.beginPath();
                                context.strokeStyle = 'red';
                                context.moveTo((this.x * gridSize) - offsetX + 32, (this.y * gridSize) - offsetY + 32);  // Tower center
                                context.lineTo((enemy.x) - offsetX + 32, (enemy.y) - offsetY + 32);  // Enemy center
                                context.lineWidth = 4;
                                context.stroke();
                                }
                                enemy.hp = enemy.hp - (this.damage * this.level);                    
                                            // If enemy's HP reached zero, delete it
                                if (enemy.hp <= 0){
                                    var enemyIndex = enemies.indexOf(enemy);
                                    if (enemyIndex > -1){
                                        enemies.splice(enemyIndex, 1);
                                        // Award for killing an enemy
                                        money += killReward;
                                        killCount++;  // Increase kill count when enemy is destroyed
                                    }
                                }
                    
                                
            
                                this.timeToFire = this.firingDelay;
                                break;
                            }
                        }
                    } else {
                        this.timeToFire = this.timeToFire - (1 * this.level)
                    }
                }
        
    

    iceFire() {

                    if (this.timeToFire <= 0) {

                                for (var j in enemies) {

                                    var enemy = enemies[j];
                                    var dx = (this.x * gridSize ) - (enemy.x + gridSize / 2);  // Calculate enemy center X
                                    var dy = (this.y * gridSize ) - (enemy.y + gridSize / 2);  // Calculate enemy center Y
                                    var distance = Math.sqrt(dx * dx + dy * dy);

        
                                    if(distance < this.range) {

                                        // Draw a line between tower and enemy within range
                                        //context.drawImage(towerImageFiring, this.x, this.y, gridSize, gridSize); // Draw tower image
                                        if (mapMode == false)
                                        {
                                        context.beginPath();
                                        context.strokeStyle = 'blue';
                                        context.moveTo((this.x * gridSize) - offsetX + 32, (this.y * gridSize) - offsetY + 32);  // Tower center
                                        context.lineTo((enemy.x) - offsetX + 32, (enemy.y) - offsetY + 32);  // Enemy center
                                        context.lineWidth = 4;
                                        context.stroke();
                                        }
                                        enemy.hp = enemy.hp - this.damage;                    
                                        enemy.speed = enemy.speed * this.slow;
                                                    // If enemy's HP reached zero, delete it
                                        if (enemy.hp <= 0){
                                            var enemyIndex = enemies.indexOf(enemy);
                                            if (enemyIndex > -1){
                                                enemies.splice(enemyIndex, 1);
                                                // Award for killing an enemy
                                                money += killReward;
                                                killCount++;  // Increase kill count when enemy is destroyed
                                            }
                                        }
                            
                                        //projectiles.push(new Projectile(this.x + gridSize / 2, this.y + gridSize / 2, enemy));
                    
                                        this.timeToFire = this.firingDelay;
                                        break;
                                    }
                                }
                            } else {
                                this.timeToFire = this.timeToFire - (1 * this.level)
                            }
    }

    }



// BUILD A BUILDING
    function buildBuilding(type, money) {
        let newBuilding;
        let remainingMoney = money;
    
        function onConfirmLocation(hoveredGridSquare) {
            let i = Math.round(hoveredGridSquare.y);
            let j = Math.round(hoveredGridSquare.x);
            
            if (i >= gridRows || j >= gridColumns) {
                statusMessage = 'Invalid tower location';
                statusMessageTimeout = 120;
                
                return remainingMoney;
            } else if (grid[i][j] == 1) {
                statusMessage = "Can't build a tower on another tower";
                statusMessageTimeout = 120;
                
                return remainingMoney;
            }
            
            if (hoveredGridSquare !== null) {
                newBuilding = new Building(hoveredGridSquare.x, hoveredGridSquare.y, type);
                const cost = newBuilding.calculateCost();
    
                if (remainingMoney < cost) {
                    statusMessage = "Insufficient funds.";
                    statusMessageTimeout = 120;
                    return remainingMoney;
                }
    
                remainingMoney -= cost; 
                buildings.push(newBuilding);
                isSubMenuActive = false;
                // Check if enemies can still reach the base. If not, force them to recalculate.
                if (type !== 'base') {
                    grid[i][j] = 1; // Set grid value to 1 if the building is not a base
                    for (const enemy of enemies) { 
                        if (enemy.isAttacking == true) {
                            let nearestBase = getNearestBaseCoordinates(this.x + offsetX, this.y + offsetY);
                            if (lastPath.path && lastPath.end.i === nearestBase.i && lastPath.end.j === nearestBase.j) {
                                if(!isPathStillValid(lastPath.path)) {
                                    enemy.pathUpdateCountdown = 1;
                                } else {
                                    enemy.path = [...lastPath.path];
                                }
                            } else {
                                enemy.path = AStar(start, nearestBase);
                                lastPath = {
                                    path: [...enemy.path],
                                    end: { i: nearestBase.i, j: nearestBase.j }
                                };
                            }
                        
                            let dx = nearestBase.j*gridSize - enemy.x;
                            let dy = nearestBase.i*gridSize - enemy.y;
                            let magnitude = Math.sqrt(dx*dx + dy*dy);
                             
                            if(magnitude != 0){
                                enemy.x += (dx/magnitude) * enemy.speed;
                                enemy.y += (dy/magnitude) * enemy.speed;
                            }    
                        } else if (!isPathStillValid(enemy.path)) {
                            enemy.pathUpdateCountdown = 1;
                        }
                    }
                    
                }
                buildMode = false;
            }
            return remainingMoney;
        }
        return onConfirmLocation;
    }
    

//Upgrade building
function upgradeBuilding(hoveredGridSquare) {
  let remainingMoney = money;
  //console.log("Trying to upgrade. hoveredGridSquare = " + JSON.stringify(hoveredGridSquare) + ". .building = " + JSON.stringify(hoveredGridSquare.building));
  if (hoveredGridSquare && hoveredGridSquare.building) {
    const building = hoveredGridSquare.building;
    const upgradeCost = building.calculateUpgradeCost();
  
    if (remainingMoney < upgradeCost) {
      statusMessage = "Insufficient funds.";
      statusMessageTimeout = 120;
      return remainingMoney;
    }
  
    if(building.level >= building.maxLevel){
      statusMessage = "Building already at max level.";
      statusMessageTimeout = 120;
      return remainingMoney;
    }
  
    remainingMoney -= upgradeCost;
    building.upgrade();
  }
  
  return remainingMoney;
  
}

//Create a hive
function createHiveNearBase(money) {
    let randomLocation = getNearestBaseCoordinates(offsetX, offsetY);
    if (!randomLocation) {
        //console.log("No base exists");
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
    statusMessage = "A hive has spawned.";
    statusMessageTimeout = 120;
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

// MAIN ENEMY CONSTRUCTOR & METHODS
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

    this.spriteSheet = new Image();
    this.spriteSheet.src = 'es' + (Math.floor(Math.random() * 6) + 1) + '.png'; // Set the path to your sprite sheet
    this.frameWidth = 20; // Width of each frame
    this.frameHeight = 20; // Height of each frame
    this.totalFrames = 3; // Total number of frames in the sprite sheet
    this.currentFrame = 0; // Current frame index
    this.frameUpdateInterval = 5; // Interval to update frames (adjust as needed)

    // Attack animation frames
    this.attackFrames = 8;
    this.currentAttackFrame = 4;
    this.attackFrameUpdateInterval = 6; // Interval to update attack frames

    this.isAttacking = false; // Variable to store attack state

    // Add a new method for initiating attack
    this.initiateAttack = function() {
    this.isAttacking = true;
    this.currentAttackFrame = 4; // Start from 4th frame for attack animation
}

    // ENEMY DRAWING
    this.draw = function() {
        if (mapMode == false){
    if (this.isAttacking) {
        context.drawImage(
            this.spriteSheet, 
            this.currentAttackFrame * this.frameWidth,
            this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            this.x - offsetX, 
            this.y - offsetY, 
            gridSize * 1.0, 
            gridSize * 1.0
        );
        
        if (gameTimer % this.attackFrameUpdateInterval === 0) {
            this.currentAttackFrame = (this.currentAttackFrame + 1) % this.attackFrames;
            //console.log(JSON.stringify(this.currentAttackFrame));
            let nearestBase = getNearestBaseCoordinates(this.x + offsetX, this.y + offsetY);
            // Reset attacking state and currentFrame after the last attack frame
            if(this.currentAttackFrame === this.attackFrames - 1 && nearestBase) {
                // HERE IS THE TAKEDAMAGE CODE
                
                buildings[nearestBase.closestBaseKey].takeDamage(buildings);
                //console.log("takeDamage called");
                //this.isAttacking = false;
                //this.currentAttackFrame = 4;
                }
            }
        } else {
            // Draw regular frames
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
            
            if (gameTimer % this.frameUpdateInterval === 0) {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            }
        }
    }

        let nearestBase = getNearestBaseCoordinates(this.x + offsetX, this.y + offsetY);
        
//        console.log("NearestBase I: " + nearestBase.i + "NearestBase J" + nearestBase.j);
//        let distanceToNearestBase = Math.sqrt((this.x + offsetX - nearestBase.j * gridSize) ** 2 + (this.y + offsetY - nearestBase.i * gridSize) ** 2);
//        console.log(JSON.stringify(distanceToNearestBase));
        //let someCriteriaForAttack = true; // TODO: Define this criteria
        if (nearestBase !== null) {
        // Add criteria for initiating the attack: if enemy is close to the base
        if (Math.abs(nearestBase.j - this.x/gridSize) <= 1 && Math.abs(nearestBase.i - this.y/gridSize) <= 1) {
            //console.log("Initiating attack");
            this.isAttacking = true;
            this.speed = 1;
            return; // Stop moving and initiate attack animation
        } else {
            this.isAttacking = false;
        }
    }
        
    };

    // ENEMY MOVEMENT
    this.move = function () {
        let nearestBase = getNearestBaseCoordinates(this.x + offsetX, this.y + offsetY);
        var gridX = Math.round((this.x) / gridSize);
        var gridY = Math.round((this.y) / gridSize);
        if (nearestBase !== null) {
        //if (!this.path.length || this.justChangedDirection || --this.pathUpdateCountdown <= 0) {
        if (!this.path.length || --this.pathUpdateCountdown <= 0) {
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
        return { i: closestBaseY, j: closestBaseX, closestBaseKey };
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
function AStar(start, goal) {
    start.g = 0;
    start.f = heuristic(start, goal, goal);

    var openList = [start];
    var closedList = [];

    while(openList.length > 0) {
        var currentNode = openList.reduce((prev, curr) => prev.f < curr.f ? prev : curr);

        if(currentNode.i === goal.i && currentNode.j === goal.j) {
            var curr = currentNode;
            var ret = [];
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            return ret.reverse();
        }

        removeFromArray(openList, currentNode);
        closedList.push(currentNode);

        var neighbors = getNeighbors(grid, currentNode);
        
        for(var i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];

            if(findInArray(closedList, neighbor) || grid[neighbor.i][neighbor.j] === 1) {
                continue;
            }

            var gScore = currentNode.g + 1; 
            var gScoreIsBest = false;

            if(!findInArray(openList, neighbor)) {
                gScoreIsBest = true; 
                neighbor.g = gScore;
                neighbor.h = heuristic(neighbor, start, goal); 
                neighbor.f = neighbor.g + neighbor.h;
                openList.push(neighbor);
            } 
            
            else if(gScore < neighbor.g) {
                gScoreIsBest = true;
            }

            if(gScoreIsBest) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }

    return [];
}






// Bomb constructor
function Projectile(x, y, target){
    this.x = x;
    this.y = y;
    this.speed = 20;
    this.target = target;
    this.life = 300; // Life of the projectile. This could be adjusted based on the desired decay speed.
    this.damage = 3
}

// ***************************************************
// ****************DRAWING FUNCTIONS******************
// ***************************************************

function drawMap() {
    if (mapMode == true) {
        // Calculate the scaled dimensions for the source
        var scaledSourceWidth = canvas.width / 0.333;
        var scaledSourceHeight = canvas.height / 0.333;

        // Draw the background using the scaled offset and dimensions
        //console.log("Scaled offset, " + scaledOffsetX + ", " + scaledOffsetY);
        //context.drawImage(backgroundCanvas, scaledOffsetX, scaledOffsetY, scaledSourceWidth, scaledSourceHeight, 0, 0, canvas.width, canvas.height);
        var mapModeOffsetX = offsetX - canvas.width;
        var mapModeOffsetY = offsetY - canvas.height;
        context.drawImage(backgroundCanvas, mapModeOffsetX, mapModeOffsetY, scaledSourceWidth, scaledSourceHeight, 0, 0, canvas.width, canvas.height);

        // Draw black squares for buildings in map mode
        context.fillStyle = 'black';
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        for (const building of buildings) {
                //console.log("Checking building: " + JSON.stringify(building));
                // Calculate building's position on the map
                const mapX = ((building.x * gridSize) - mapModeOffsetX) * 0.333;
                const mapY = ((building.y * gridSize) - mapModeOffsetY) * 0.333;
                //console.log("Building type: " + JSON.stringify(building.type));
                if (building.type == 'base')
                {
                    context.fillStyle = 'blue';
                } else if (building.type == 'hive')
                {
                    context.fillStyle = 'red';
                }
                else 
                {
                    context.fillStyle = 'black';
                }
                // Draw a black square as a placeholder for the building
                //console.log("Drawing black square at " + mapX + ", " + mapY);
                context.fillRect(mapX, mapY, gridSize * 0.333, gridSize * 0.333);
                context.strokeRect(mapX, mapY, gridSize * 0.333, gridSize * 0.333);
            
        }
            // Draw red dots for enemies in map mode
        context.fillStyle = 'red';
        for (const enemy of enemies) {
            //console.log("Checking enemy: " + JSON.stringify(enemy));
            // Calculate enemy's position on the map
            const mapX = ((enemy.x) - mapModeOffsetX) * 0.333;
            const mapY = ((enemy.y) - mapModeOffsetY) * 0.333;
            // Draw a red dot as a placeholder for the enemy
            //console.log("Drawing red dot at " + mapX + ", " + mapY);
            context.beginPath();
            context.arc(mapX, mapY, gridSize * 0.05, 0, 2 * Math.PI);
            context.fill();
        }


    } else {
        // Draw the background using the original offset and dimensions
        //console.log("Offset, " + offsetX + ", " + offsetY);
        context.drawImage(backgroundCanvas, offsetX, offsetY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
}

function drawGrid() {
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
        //var key = `${hoveredGridSquare.x},${hoveredGridSquare.y}`
        if (hoveredGridSquare && hoveredGridSquare.building) {
            const upgradeCost = hoveredGridSquare.building.calculateUpgradeCost();
            //console.log("Upgrade cost: " + upgradeCost);

            // Assuming ctx is your canvas context
            // Set styles for the box
	    context.beginPath();
            context.fillStyle = "#333";
            context.strokeStyle = '#fff';

            // Calculate position for the box 
            var boxX = (hoveredGridSquare.x * gridSize) - offsetX;
            var boxY = (hoveredGridSquare.y * gridSize+64) - offsetY;

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

}

function income()
{
    incomePerTick = 0;
    for (var key in buildings) {
        if (buildings.hasOwnProperty(key) && buildings[key].type === 'base') {
            incomePerTick += buildings[key].generateIncome();
        }
    }
    // Add the generated income to the player's total income
    money += incomePerTick;
}

function renderProjectiles() {
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
            if (mapMode == false)
            {
            context.beginPath();
            context.arc(projectile.x - offsetX, projectile.y - offsetY, 50, 0, Math.PI * 2, true); 
            context.fillStyle = "red";
            context.fill();
            }
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
                    money += 5;
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
            if (mapMode == false)
            {
            context.beginPath();
            context.arc(projectile.x - offsetX, projectile.y - offsetY, 10, 0, Math.PI * 2, false);  // Change the "10" to your desired radius
            context.fillStyle = "black";
            context.fill();
            }

        }  
		
		if(projectile.life <= 0){
			projectiles.splice(i, 1);
		}		
    }

}

function drawMessages() {
    // Draw messages	
    context.beginPath();
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = "32px Impact";
    context.fillText(statusMessage, 1024/2, canvas.height/2);
    if(statusMessageTimeout > 0) {
        statusMessageTimeout--;
	context.beginPath();
	context.fillStyle = "rgba(64, 64, 64, 0.2)"; // gray with 10% opacity
        context.fillRect(0, (canvas.height/2)-50, 1024, 100);
    } else {
        statusMessage = '';
    }
     
    if(displayStartMenu == true)
    {
     drawStartMenu();
    }

    // base count and income stats
    context.beginPath();
	context.fillStyle = "rgba(64, 64, 64, 0.2)"; // gray with 10% opacity
    context.fillRect(1024, 720, -200, -75);
    let baseCount = Object.values(buildings).filter(building => building.type === 'base' && !building.destroyed).length;
    context.beginPath();
    context.fillStyle = 'white';
    context.textAlign = 'right';
    context.font = '20px Impact';
    context.fillText('BASES: ' + baseCount, canvas.width - 270, canvas.height - 50);
    context.fillText('INCOME: ' + incomePerTick, canvas.width - 270, canvas.height - 20);

    
    let containsBase = Object.values(buildings).some(building => building.type === 'base');
        if (containsBase == false && killCount > 1) {
        //console.log("No bases left.");
        statusMessage = 'Game Over.';
        statusMessageTimeout = 9999;
        //clearInterval(gameLoop);  // End the game loop

    }
}


// Define a function to draw health bars for all base buildings
function drawHealthBars() {
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        if (building.type === 'base') {
            const maxHealth = 20; // Assuming 20 is the maximum health
            const barWidth = gridSize;
            const barHeight = 5;
            const barX = building.x * gridSize - offsetX;
            const barY = building.y * gridSize - offsetY - 10; // 10 units above the building
            const healthRatio = building.hp / maxHealth;
            let fillColor = 'rgb(0, 255, 0)';

            if (building.hp > 10) {
                fillColor = 'rgb(0, 255, 0)';
            }
            if (building.hp > 4 && building.hp < 11) {
                fillColor = 'yellow';
            }
            if (building.hp < 5) {
                fillColor = 'rgb(255, 0, 0)';
            }
            // Background of health bar
            if (mapMode == false) {
                context.fillStyle = 'black';
                context.fillRect(barX, barY, barWidth, barHeight);
                // Actual health level
                context.fillStyle = fillColor;
                context.fillRect(barX, barY, barWidth * healthRatio, barHeight);
            } else if (mapMode == true) {
                const barMapX = (((building.x * gridSize) - offsetX + canvas.width) * 0.333);   
                const barMapY = (((building.y * gridSize) - offsetY + canvas.height) * 0.333) - 5;
                context.fillStyle = 'black';
                context.fillRect(barMapX, barMapY, barWidth*0.333, barHeight);
                context.fillStyle = fillColor;
                context.fillRect(barMapX, barMapY, barWidth*0.333 * healthRatio, barHeight);
            }
        }
    }
}




//*******************************************************************************************
//***********************THIS IS WHERE THE GAME LOOP STARTS.*********************************
//*******************************************************************************************

var gameLoop = setInterval(function(){
    // Updated game loop
    gameTimer += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawMap(); // DRAW THE MAP
   

    buildings.forEach(building => building.draw()); // DRAW BUILDINGS

    //Move and draw enemies
    for(var i in enemies) {
        var enemy = enemies[i];
        enemy.move();
        enemy.draw();
    }

    drawGrid(); // DRAW THE GRID
    
    renderProjectiles(); // DRAW PROJECTILES (AND MOVE)

    // BUILDINGS FIRE
    Object.values(buildings).forEach((building) => {
        if(typeof building.fire === 'function') {
            // Only call .fire if it's defined as a function on the building object
            building.fire();
        }
    });

    drawMenu(); // DRAW THE MENU

    drawHealthBars(); // DRAW HEALTH BARS

    drawMessages(); // DRAW MESSAGES


    // INCOME
    if (gameTimer % 600 === 0) {
    income();
    }

    
// Spawn the first hive
const hives = generateHiveList(buildings);
if(hives.length === 0)
{
    let containsBase = false;
    let buildingValues = Object.values(buildings);
    for(let i=0; i<buildingValues.length; i++){
        //console.log("Cheking: " + JSON.stringify(buildingValues[i]) + ". Type is " + JSON.stringify(buildingValues[i].type));
        if(buildingValues[i].type === 'base'){
            //console.log("At least one base building has been built.");
            createHiveNearBase(money);
            //console.log("Hives now " + hives.length);
            containsBase = true;
            break;
        }
    }
}

// Spawn enemies
spawnInfluence = (0.01 + (0.00065 * (killCount - manualSpawned)));
if(Math.random() < spawnInfluence) {
spawnEnemy(hives);
}

// Spawn more hives
if(spawnInfluence > hives.length && gameTimer > 1000) {
createHiveNearBase(money);
}

// HUGE WAVES
if (killCount % 2000 === 0 && killCount > 1)
{
	statusMessage = 'A HUGE WAVE OF ENEMIES SPAWNED';
        statusMessageTimeout = 120;
        var number = killCount / 20
	spawnManyEnemies(hives, number);
}



 }, 30);
