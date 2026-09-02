// script.js


// ----------------------------
// GAME STATE
// ----------------------------

const players = {
    1: {
        score: 0,
        input: "",
        setupComplete: false,
        selectedNumber: null,
        history: []
    },

    2: {
        score: 0,
        input: "",
        setupComplete: false,
        selectedNumber: null,
        history: []
    }
};

let gameStarted = false;
let gameOver = false;


// ----------------------------
// ELEMENTS
// ----------------------------

const winnerScreen = document.getElementById("winnerScreen");
const winnerTopText = document.getElementById("winnerTopText");
const winnerBottomText = document.getElementById("winnerBottomText");
const newGameButton = document.getElementById("newGameButton");


// ----------------------------
// HELPER FUNCTIONS
// ----------------------------

function getScoreElement(player) {
    return document.getElementById(`player${player}Score`);
}

function getStatusElement(player) {
    return document.getElementById(`player${player}Status`);
}

function getNumberButtons(player) {
    return document.querySelectorAll(
        `.number-button[data-player="${player}"]`
    );
}


// ----------------------------
// DISPLAY
// ----------------------------

function updateDisplay(player) {

    const data = players[player];
    const scoreElement = getScoreElement(player);
    const statusElement = getStatusElement(player);


    // SETUP MODE
    if (!data.setupComplete) {

        scoreElement.textContent =
            data.input === "" ? "0" : data.input;

        statusElement.textContent = "Enter starting score";

        clearSelectedButtons(player);

        return;
    }


    // WAITING FOR OTHER PLAYER
    if (!gameStarted) {

        scoreElement.textContent = data.score;
        statusElement.textContent = "Ready";

        return;
    }


    // GAME MODE
    scoreElement.textContent = data.score;

    if (data.selectedNumber !== null) {

        statusElement.textContent =
            `Selected: -${data.selectedNumber}`;

    } else {

        statusElement.textContent =
            "Select points to subtract";
    }
}


// ----------------------------
// NUMBER BUTTONS
// ----------------------------

document.querySelectorAll(".number-button").forEach(button => {

    button.addEventListener("click", () => {

        if (gameOver) return;

        const player = button.dataset.player;
        const number = button.dataset.number;

        const data = players[player];


        // SETUP MODE
        if (!data.setupComplete) {

            // Prevent excessively long starting values
            if (data.input.length >= 7) return;

            data.input += number;

            updateDisplay(player);

            return;
        }


        // WAIT UNTIL BOTH PLAYERS READY
        if (!gameStarted) return;


        // GAME MODE
        data.selectedNumber = Number(number);

        highlightSelectedButton(
            player,
            Number(number)
        );

        updateDisplay(player);
    });
});


// ----------------------------
// ENTER BUTTONS
// ----------------------------

document.querySelectorAll(".enter-button").forEach(button => {

    button.addEventListener("click", () => {

        if (gameOver) return;

        const player = button.dataset.player;
        const data = players[player];


        // SET STARTING SCORE
        if (!data.setupComplete) {

            if (data.input === "") return;

            const startingScore = Number(data.input);

            if (startingScore <= 0) return;

            data.score = startingScore;
            data.setupComplete = true;

            updateDisplay(player);

            checkIfGameCanStart();

            return;
        }


        // GAME MODE
        if (!gameStarted) return;

        if (data.selectedNumber === null) return;


        // Store old score for undo
        data.history.push(data.score);


        // Subtract selected score
        data.score -= data.selectedNumber;


        // Clear selection
        data.selectedNumber = null;

        clearSelectedButtons(player);

        updateDisplay(player);


        // Check win
        if (data.score <= 0) {

            showWinner(player);
        }
    });
});


// ----------------------------
// BACK BUTTON
// ----------------------------

document.querySelectorAll(".back-button").forEach(button => {

    button.addEventListener("click", () => {

        if (gameOver) return;

        const player = button.dataset.player;

        handleBack(player);
    });
});


// ----------------------------
// BACK / UNDO
// ----------------------------

function handleBack(player) {

    const data = players[player];


    // SETUP MODE
    // Delete the last digit entered
    if (!data.setupComplete) {

        data.input = data.input.slice(0, -1);

        updateDisplay(player);

        return;
    }


    if (!gameStarted) return;


    // If a number is currently selected but
    // hasn't been submitted yet, cancel it
    if (data.selectedNumber !== null) {

        data.selectedNumber = null;

        clearSelectedButtons(player);

        updateDisplay(player);

        return;
    }


    // Otherwise undo the most recent submitted score
    if (data.history.length > 0) {

        const previousScore = data.history.pop();

        data.score = previousScore;

        clearSelectedButtons(player);

        updateDisplay(player);

        flashStatus(player, "Last entry undone");
    }
}

// ----------------------------
// BUTTON HIGHLIGHT
// ----------------------------

function highlightSelectedButton(player, number) {

    clearSelectedButtons(player);

    const button = document.querySelector(
        `.number-button[data-player="${player}"][data-number="${number}"]`
    );

    if (button) {
        button.classList.add("selected");
    }
}


function clearSelectedButtons(player) {

    getNumberButtons(player).forEach(button => {
        button.classList.remove("selected");
    });
}


// ----------------------------
// GAME START
// ----------------------------

function checkIfGameCanStart() {

    if (
        players[1].setupComplete &&
        players[2].setupComplete
    ) {

        gameStarted = true;

        updateDisplay(1);
        updateDisplay(2);
    }
}


// ----------------------------
// WINNER
// ----------------------------

function showWinner(player) {

    gameOver = true;

    const winnerText = `Player ${player} Wins!`;

    winnerTopText.textContent = winnerText;
    winnerBottomText.textContent = winnerText;

    winnerScreen.classList.remove("hidden");
}


// ----------------------------
// NEW GAME
// ----------------------------

newGameButton.addEventListener("click", () => {

    resetPlayer(1);
    resetPlayer(2);

    gameStarted = false;
    gameOver = false;

    winnerScreen.classList.add("hidden");

    updateDisplay(1);
    updateDisplay(2);
});


function resetPlayer(player) {

    players[player].score = 0;
    players[player].input = "";
    players[player].setupComplete = false;
    players[player].selectedNumber = null;
    players[player].history = [];

    clearSelectedButtons(player);
}


// ----------------------------
// TEMPORARY STATUS MESSAGE
// ----------------------------

function flashStatus(player, message) {

    const status = getStatusElement(player);

    status.textContent = message;

    setTimeout(() => {

        if (!gameOver) {
            updateDisplay(player);
        }

    }, 1000);
}


// ----------------------------
// INITIAL DISPLAY
// ----------------------------

updateDisplay(1);
updateDisplay(2);
