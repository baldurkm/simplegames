document.addEventListener('DOMContentLoaded', function() {
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

    let dayCounter = 0; // display days on the road

        // Fetch events from events.json
        fetch('events.json')
        .then(response => response.json())
        .then(data => {
            // Store events in a variable for later use
            const events = data;
            })
            .catch(error => console.error('Error fetching events:', error));

    continueButton.addEventListener('click', function() {
        handleContinueButtonClick();
    });

    homeButton.addEventListener('click', function() {
        displayHomePage();
    });

    caravanButton.addEventListener('click', function() {
        displayCaravanPage();
    });

    membersButton.addEventListener('click', function() {
        displayMembersPage();
    });

    mapButton.addEventListener('click', function() {
        displayMapPage();
    });

    mainMenuButton.addEventListener('click', function() {
        handleButtonClick('Main Menu');
    });

    function handleContinueButtonClick() {
        // Add logic for continuing to the next day
        handleButtonClick('Continue', `Day ${dayCounter}: Your caravan moves forward.`);
        dayCounter++;
        // Simulate an event for demonstration purposes
        addEventToInbox('Weather change: Rain is expected tomorrow.');
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


});
