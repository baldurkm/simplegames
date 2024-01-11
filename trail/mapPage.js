function displayMapPage() {
    console.log("Showing Map Page");

    // Call the function to create direction buttons
    createDirectionButtons();

    // Hide inbox
    const inboxContainer = document.getElementById('inbox-container');
    inboxContainer.style.display = 'none';
}

function createDirectionButtons() {
    const directions = ['North', 'East', 'South', 'West'];

    directions.forEach(direction => {
        const button = createButton(direction, `${direction.toLowerCase()}-button`);
        button.addEventListener('click', function() {
            followPath(direction.toLowerCase());
        });
    });
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
