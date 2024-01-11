document.addEventListener('DOMContentLoaded', function() {

    // base variables
    const body = document.body;
    const gameContainer = createGameContainer();
    const mainDisplay = createMainDisplay();
    const screenContainer = createScreenContainer(); // New container for dynamic content
    const inboxContainer = createInboxContainer();
    const continueButton = createButton('Continue', 'continue-button');
    const homeButton = createButton('Home', 'home-button');
    const caravanButton = createButton('Caravan', 'caravan-button');
    const membersButton = createButton('Members', 'members-button');
    const mapButton = createButton('Map', 'map-button');
    const mainMenuButton = createButton('Main Menu', 'menu-button');


    
    // Map variables
    const mapCanvas = createMapCanvas();
    const mapContext = mapCanvas.getContext('2d');
    createDirectionButtons();

    // gameplay variables
    let events;
    let dayCounter = 0;
    let seasonCounter = 0;
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    let currentLocation = 'Missouri';
    let chosenDirection = null;

    // location mapping
    const gridMap = [
    ['Forest', 'Plains', 'River', 'Mountain', 'Plains'],
    ['Desert', 'Forest', 'Plains', 'Forest', 'Hills'],
    ['Mountain', 'River', 'Forest', 'Forest', 'Plains'],
    ['River', 'Mountain', 'Forest', 'Plains', 'Desert'],
    ['River', 'Mountain', 'Plains', 'Desert', 'Desert'],
    ];
    let playerPosition = { row: 0, col: 0 }; // Initial position

    // Fetch events from events.json
    fetch('events.json')
        .then(response => response.json())
        .then(data => {
            // Store events in a variable for later use
            events = data;
        })
        .catch(error => console.error('Error fetching events:', error));

    continueButton.addEventListener('click', handleContinueButtonClick);
    homeButton.addEventListener('click', displayHomePage);
    caravanButton.addEventListener('click', displayCaravanPage);
    membersButton.addEventListener('click', displayMembersPage);
    mapButton.addEventListener('click', displayMapPage);
    mainMenuButton.addEventListener('click', () => handleButtonClick('Main Menu'));

    function updateScreenContainerContent(screenLabel, content) {
        // Hide all screen elements by default
        mainDisplay.style.display = 'none';
        screenContainer.style.display = 'none';
        mapCanvas.style.display = 'none';

        // Determine which element to display based on the screen label
        switch (screenLabel) {
            case 'Home':
                mainDisplay.textContent = content;
                mainDisplay.style.display = 'block';
                break;
            case 'Caravan':
            case 'Members':
                screenContainer.innerHTML = `<p>${screenLabel}: ${content}</p>`;
                screenContainer.style.display = 'block';
                break;
            case 'Map':
                // Additional logic for map screen
                screenContainer.style.display = 'block';
                mapCanvas.style.display = 'block';
                updateMapDisplay(); // Add this line to update the map when displaying the map screen
                break;
            // Add additional cases for other screens if needed
        }
    }

    function handleContinueButtonClick() {
        dayCounter++;
        if (dayCounter % 90 === 0) {
            // Transition to the next season
            seasonCounter = (seasonCounter + 1) % 4;
            updateMainDisplay(`Day ${dayCounter}: ${seasons[seasonCounter]} begins.`);
        } else {
            updateMainDisplay(`Day ${dayCounter}: ${seasons[seasonCounter]}`);
        }

        // Apply movement if a direction was chosen
        if (chosenDirection !== null) {
            const newPosition = calculateNewPosition(playerPosition, chosenDirection.toLowerCase());
            if (isValidPosition(newPosition)) {
                const newLocation = gridMap[newPosition.row][newPosition.col];
                updateMainDisplay(`Day ${dayCounter}: Traveling to ${newLocation}.`);
                playerPosition = newPosition;
                displayMapInfo(); // Update map information
                updateMapDisplay(); // Add this line to update the map after a continue
            } else {
                updateMainDisplay(`Day ${dayCounter}: Error - Invalid path.`);
            }

            // Reset the chosen direction after applying movement
            chosenDirection = null;
        }

        // Randomize the number of events (between 0 and 3)
        const numEvents = Math.floor(Math.random() * 4);

        // Randomize and select events based on likelihoods
        for (let i = 0; i < numEvents; i++) {
            const randomEvent = getRandomEvent();
            if (randomEvent) {
                addEventToInbox(randomEvent.description);
            }
        }
    }

    // Function to get a random event based on likelihoods
    function getRandomEvent() {
        // Filter events based on location and season
        const filteredEvents = events.filter(event => {
            const locationCondition = event.likelihood.location === 'Any' || event.likelihood.location === currentLocation;
            const seasonCondition = event.likelihood.season.includes('Any') || event.likelihood.season.includes(seasons[seasonCounter]);
            return locationCondition && seasonCondition;
        });

        // Randomly select an event from the filtered list
        const randomIndex = Math.floor(Math.random() * filteredEvents.length);
        return filteredEvents[randomIndex];
    }

    // Function to handle button clicks
    function handleButtonClick(buttonLabel, content) {
        // Update the screen container content based on the button clicked
        updateScreenContainerContent(buttonLabel, content);
        // Show/hide the inbox based on the button clicked
    }

    // Function to create the game container
    function createGameContainer() {
        const container = document.createElement('div');
        container.id = 'game-container';
        body.appendChild(container);
        return container;
    }

    // Function to create the screen container
    function createScreenContainer() {
        const container = document.createElement('div');
        container.id = 'screen-container';
        gameContainer.appendChild(container);
        return container;
    }

    // Function to update the content of the screen container
    function updateScreenContainerContent(screenLabel, content) {
        screenContainer.innerHTML = `<p>${screenLabel}: ${content}</p>`;
    }

    // Function to create the main display
    function createMainDisplay() {
        const mainDisplay = document.createElement('div');
        mainDisplay.id = 'main-display';
        gameContainer.appendChild(mainDisplay);
        return mainDisplay;
    }

    // Function to create the inbox container
    function createInboxContainer() {
        const container = document.createElement('div');
        container.id = 'inbox-container';
        gameContainer.appendChild(container);

        // Create the inbox list
        const inboxList = document.createElement('ul');
        inboxList.id = 'inbox';
        container.appendChild(inboxList);

        return container;
    }

    // Function to create a button
    function createButton(label, id) {
        const button = document.createElement('button');
        button.textContent = label;
        button.id = id;
        button.style.cursor = 'pointer';
        gameContainer.appendChild(button);
        return button;
    }

    // Function to update the main display content
    function updateMainDisplay(content) {
        showMainDisplay();
        mainDisplay.textContent = content;
    }

    // Function to add an event to the inbox
    function addEventToInbox(event) {
        const inbox = document.getElementById('inbox');
        const eventItem = document.createElement('li');
        eventItem.textContent = event;
        inbox.appendChild(eventItem);
    }

    // Function to show the main display
    function showMainDisplay() {
        mainDisplay.style.display = 'block';
        screenContainer.style.display = 'none';
    }

    function followPath(direction) {
        chosenDirection = direction;
        updateMainDisplay(`Day ${dayCounter}: Path chosen - ${chosenDirection}.`);
    }

    function calculateNewPosition(currentPosition, direction) {
        // Clone the current position to avoid modifying the original object
        const newPosition = { ...currentPosition };
    
        // Update the position based on the direction
        switch (direction) {
            case 'north':
                newPosition.row -= 1;
                break;
            case 'south':
                newPosition.row += 1;
                break;
            case 'west':
                newPosition.col -= 1;
                break;
            case 'east':
                newPosition.col += 1;
                break;
            default:
                // Handle invalid direction (optional)
                break;
        }
    
        return newPosition;
    }

    function isValidPosition(position) {
        // Check if the new position is within the boundaries of the grid
        // and if the player can traverse to the specified location
        return (
            position.row >= 0 &&
            position.row < gridMap.length &&
            position.col >= 0 &&
            position.col < gridMap[0].length &&
            canTraverse(gridMap[position.row][position.col])
        );
    }

    function canTraverse(location) {
        // Implement logic to check if the player can traverse the specified location
        // (e.g., certain locations are impassable or require special conditions)
        return true;
    }

    function displayMapInfo() {
        const currentLocation = gridMap[playerPosition.row][playerPosition.col];
        updateMainDisplay(`Current Location: ${currentLocation}`);
        // Display information about the current cell and possible paths
    }

    function displayMapPage() {
        console.log("Showing Map Page");

        // Show map only on the map page
        mapCanvas.style.display = 'block';
        body.classList.add('map-page');

        // Hide direction buttons when not on the map page
        const directionButtons = document.querySelectorAll('.direction-button');
        directionButtons.forEach(button => {
            button.style.display = 'block';
        });

        // Hide inbox
        inboxContainer.style.display = 'none';
    }

    function createMapCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'map-canvas';
        canvas.width = 400; // Set the desired width
        canvas.height = 400; // Set the desired height
        gameContainer.appendChild(canvas);
        return canvas;
    }

    function updateMapDisplay() {
        // Clear the map canvas
        mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        // Draw the grid
        drawGrid();
        // Draw the player position
        drawPlayerPosition();
    }

    // Function to draw the grid
    function drawGrid() {
        const cellSize = mapCanvas.width / gridMap.length;

        // Draw vertical lines
        for (let i = 1; i < gridMap.length; i++) {
            const x = i * cellSize;
            mapContext.beginPath();
            mapContext.moveTo(x, 0);
            mapContext.lineTo(x, mapCanvas.height);
            mapContext.stroke();
        }

        // Draw horizontal lines
        for (let j = 1; j < gridMap[0].length; j++) {
            const y = j * cellSize;
            mapContext.beginPath();
            mapContext.moveTo(0, y);
            mapContext.lineTo(mapCanvas.width, y);
            mapContext.stroke();
        }
    }

    // Function to draw the player position
    function drawPlayerPosition() {
        const cellSize = mapCanvas.width / gridMap.length;
        const playerX = playerPosition.col * cellSize + cellSize / 2;
        const playerY = playerPosition.row * cellSize + cellSize / 2;

        // Draw a dot for the player
        mapContext.beginPath();
        mapContext.arc(playerX, playerY, 5, 0, 2 * Math.PI);
        mapContext.fillStyle = 'red';
        mapContext.fill();
        mapContext.stroke();
    }

    function displayMembersPage() {
        console.log("Showing Members Page");

        // Hide direction buttons when not on the map page
        const directionButtons = document.querySelectorAll('.direction-button');
        directionButtons.forEach(button => {
            button.style.display = 'none';
        });
        body.classList.remove('map-page');

        // Hide inbox
        const inboxContainer = document.getElementById('inbox-container');
        mapCanvas.style.display = 'none';
        inboxContainer.style.display = 'none';
    }

    function displayHomePage() {
        console.log("Showing Home Page");

        // Hide direction buttons when not on the map page
        const directionButtons = document.querySelectorAll('.direction-button');
        directionButtons.forEach(button => {
            button.style.display = 'none';
        });
        body.classList.remove('map-page');

        // Display inbox
        const inboxContainer = document.getElementById('inbox-container');
        inboxContainer.style.display = 'block';
        mapCanvas.style.display = 'none';

        // Add any additional inbox-related functionality here
    }

    function displayCaravanPage() {
        console.log("Showing Caravan Page");

        // Hide direction buttons when not on the map page
        const directionButtons = document.querySelectorAll('.direction-button');
        directionButtons.forEach(button => {
            button.style.display = 'none';
        });
        body.classList.remove('map-page');

        // Hide inbox
        const inboxContainer = document.getElementById('inbox-container');
        inboxContainer.style.display = 'none';
        mapCanvas.style.display = 'none';
    }
    
    function createDirectionButtons() {
        const directions = ['North', 'East', 'South', 'West'];

        directions.forEach(direction => {
            const button = createButton(direction, `${direction.toLowerCase()}-button direction-button`);
            console.log(`${direction.toLowerCase()}-button`);
            button.addEventListener('click', function() {
                followPath(direction.toLowerCase());
            });
        });
    }

    // Initial update of the map display
    updateMapDisplay();
    mapCanvas.style.display = 'none'; // Hide the map initially
});
