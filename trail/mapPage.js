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
