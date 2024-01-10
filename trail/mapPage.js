function displayMapPage()
{
    console.log("Showing Map Page");

        function createDirectionButtons() {
        const directions = ['Up', 'Down', 'Left', 'Right'];
    
        directions.forEach(direction => {
            const button = createButton(direction, `${direction.toLowerCase()}-button`);
            button.addEventListener('click', function() {
                followPath(direction.toLowerCase());
            });
        });
    }

        // Hide inbox
        const inboxContainer = document.getElementById('inbox-container');
        inboxContainer.style.display = 'none';
    
}
