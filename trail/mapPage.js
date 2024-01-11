function displayMapPage() {
    console.log("Showing Map Page");

    // Call the function to create direction buttons
    createDirectionButtons();

    // Hide inbox
    const inboxContainer = document.getElementById('inbox-container');
    inboxContainer.style.display = 'none';
}

function createDirectionButtons() {
    const directions = ['Up', 'Down', 'Left', 'Right'];

    directions.forEach(direction => {
        const button = createButton(`${direction.toLowerCase()}-button`, direction,);
        button.addEventListener('click', function() {
            followPath(direction.toLowerCase());
        });
    });
}
