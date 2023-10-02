//triggered after all css, script, files etc are loaded completely
window.onload =  function () {
    // Get references to the game container and other elements
    const gameContainer = document.getElementsByClassName('game-container')[0];

    // Simulate the game by animating the floating div
    function showGame() {
        // Add your animation logic here
        //i have used  CSS animations of 5 sec

        // After the animation is complete (use a timeout or event listener), show other elements
        setTimeout(() => {
            // Show other HTML elements
            gameContainer.style.display = 'block';
        }, 2000); // Adjust the delay as needed
    }

    // Start the game simulation when the page is fully loaded
    showGame();
};
//triggered after basic html str is loaded
document.addEventListener("DOMContentLoaded", function(){
    const gameContainer = document.getElementsByClassName('game-container')[0];
    gameContainer.style.display = 'none';
});



