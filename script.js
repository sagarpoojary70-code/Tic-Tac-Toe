
// ========================================
// TIC TAC TOE GAME
// ========================================


// HTML ELEMENTS

const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");

const gameMode = document.getElementById("gameMode");

const difficulty = document.getElementById("difficulty");

const difficultyBox = document.getElementById("difficultyBox");

const newGameBtn = document.getElementById("newGameBtn");

const resetBtn = document.getElementById("resetBtn");

const resultMessage = document.getElementById("resultMessage");

const tournamentMessage = document.getElementById("tournamentMessage");

const winningScore = document.getElementById("winningScore");

const scoreX = document.getElementById("scoreX");

const scoreO = document.getElementById("scoreO");

const drawScore = document.getElementById("drawScore");

const playerOLabel = document.getElementById("playerOLabel");

const remainingX = document.getElementById("remainingX");

const remainingO = document.getElementById("remainingO");


// ========================================
// GAME VARIABLES
// ========================================

let board = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "X";

let gameOver = false;

let tournamentOver = false;

let cpuThinking = false;

let cpuTimer = null;

let scores = {
    X: 0,
    O: 0,
    draw: 0
};


// ========================================
// WINNING COMBINATIONS
// ========================================

const winningCombinations = [

    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]

];


// ========================================
// GAME MODE CHANGE
// ========================================

gameMode.addEventListener("change", () => {

    clearTimeout(cpuTimer);

    scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    difficultyBox.classList.toggle(
        "hidden",
        gameMode.value !== "cpu"
    );

    playerOLabel.textContent =
        gameMode.value === "cpu" ? "CPU (O)" : "Player O";

    updateScoreboard();

    resetGame();

});


// ========================================
// WINNING SCORE CHANGE
// ========================================

winningScore.addEventListener("change", () => {

    updateScoreboard();

    if (
        !tournamentOver &&
        (scores.X >= Number(winningScore.value) ||
         scores.O >= Number(winningScore.value))
    ) {

        finishTournament(
            scores.X >= Number(winningScore.value) ? "X" : "O"
        );

    }

});


// ========================================
// CELL CLICK EVENTS
// ========================================

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        if (
            gameOver ||
            tournamentOver ||
            cpuThinking ||
            cell.textContent !== ""
        ) {
            return;
        }

        const index = Number(cell.dataset.index);

        makeMove(index, currentPlayer);

    });

});


// ========================================
// MAKE A MOVE
// ========================================

function makeMove(index, player) {

    if (
        gameOver ||
        tournamentOver ||
        board[index] !== "" ||
        cpuThinking
    ) {
        return;
    }

    board[index] = player;

    cells[index].textContent = player;

    cells[index].classList.add(
        player === "X" ? "x" : "o"
    );

    cells[index].disabled = true;

    checkGameResult();

}


// ========================================
// CHECK WIN OR DRAW
// ========================================

function checkGameResult() {

    const winningLine = getWinningLine(board);

    // CHECK WINNER

    if (winningLine) {

        gameOver = true;

        winningLine.forEach(index => {

            cells[index].classList.add("winning");

        });

        scores[currentPlayer]++;

        updateScoreboard();

        const winnerName =
            currentPlayer === "X"
                ? "Player X"
                : gameMode.value === "cpu"
                    ? "CPU"
                    : "Player O";

        statusText.textContent = winnerName + " Wins! 🎉";

        resultMessage.textContent =
            winnerName + " wins this round!";

        resultMessage.classList.remove("hidden");

        disableBoard();

        // CHECK TOURNAMENT WINNER

        if (
            scores[currentPlayer] >= Number(winningScore.value)
        ) {

            finishTournament(currentPlayer);

        }

        return;

    }


    // CHECK DRAW

    if (board.every(cell => cell !== "")) {

        gameOver = true;

        scores.draw++;

        updateScoreboard();

        statusText.textContent = "It's a Draw! 🤝";

        resultMessage.textContent =
            "Well Played! Nobody Wins.";

        resultMessage.classList.remove("hidden");

        disableBoard();

        return;

    }


    // SWITCH PLAYER

    currentPlayer =
        currentPlayer === "X" ? "O" : "X";

    updateStatus();

}


// ========================================
// FIND WINNING LINE
// ========================================

function getWinningLine(testBoard) {

    for (const combination of winningCombinations) {

        const [a, b, c] = combination;

        if (
            testBoard[a] &&
            testBoard[a] === testBoard[b] &&
            testBoard[b] === testBoard[c]
        ) {

            return combination;

        }

    }

    return null;

}


// ========================================
// UPDATE STATUS
// ========================================

function updateStatus() {

    if (tournamentOver || gameOver) return;

    if (
        gameMode.value === "cpu" &&
        currentPlayer === "O"
    ) {

        statusText.textContent = "CPU is Thinking... 🤖";

        cpuThinking = true;

        cells.forEach(cell => {
            cell.disabled = true;
        });

        cpuTimer = setTimeout(() => {

            cpuMove();

        }, 600);

    } else {

        cpuThinking = false;

        statusText.textContent =
            "Player " + currentPlayer + "'s Turn";

        cells.forEach((cell, index) => {

            cell.disabled =
                gameOver || board[index] !== "";

        });

    }

}


// ========================================
// CPU MOVE
// ========================================

function cpuMove() {

    if (gameOver || tournamentOver) return;

    let move;

    const level = difficulty.value;

    if (level === "easy") {

        move = getRandomMove(board);

    }

    else if (level === "medium") {

        move = getMediumMove();

    }

    else {

        move = getBestMove();

    }

    cpuThinking = false;

    if (move !== null && move !== undefined) {

        makeMove(move, "O");

    }

}


// ========================================
// EASY LEVEL - RANDOM MOVE
// ========================================

function getRandomMove(testBoard) {

    const availableMoves = [];

    testBoard.forEach((value, index) => {

        if (value === "") {

            availableMoves.push(index);

        }

    });

    if (availableMoves.length === 0) return null;

    const randomIndex = Math.floor(
        Math.random() * availableMoves.length
    );

    return availableMoves[randomIndex];

}


// ========================================
// MEDIUM LEVEL
// ========================================

function getMediumMove() {

    // TRY TO WIN

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            const testBoard = [...board];

            testBoard[i] = "O";

            if (getWinningLine(testBoard)) {

                return i;

            }

        }

    }


    // BLOCK PLAYER X

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            const testBoard = [...board];

            testBoard[i] = "X";

            if (getWinningLine(testBoard)) {

                return i;

            }

        }

    }


    // OTHERWISE RANDOM MOVE

    return getRandomMove(board);

}


// ========================================
// HARD LEVEL - MINIMAX
// ========================================

function getBestMove() {

    let bestScore = -Infinity;

    let bestMove = null;

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            const score = minimax(
                board,
                0,
                false
            );

            board[i] = "";

            if (score > bestScore) {

                bestScore = score;

                bestMove = i;

            }

        }

    }

    return bestMove;

}


// ========================================
// MINIMAX ALGORITHM
// ========================================

function minimax(testBoard, depth, isMaximizing) {

    const winningLine = getWinningLine(testBoard);

    if (winningLine) {

        const winner = testBoard[winningLine[0]];

        if (winner === "O") return 10 - depth;

        if (winner === "X") return depth - 10;

    }

    if (testBoard.every(cell => cell !== "")) {

        return 0;

    }


    // CPU TURN

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {

            if (testBoard[i] === "") {

                testBoard[i] = "O";

                const score = minimax(
                    testBoard,
                    depth + 1,
                    false
                );

                testBoard[i] = "";

                bestScore = Math.max(
                    score,
                    bestScore
                );

            }

        }

        return bestScore;

    }


    // PLAYER TURN

    else {

        let bestScore = Infinity;

        for (let i = 0; i < 9; i++) {

            if (testBoard[i] === "") {

                testBoard[i] = "X";

                const score = minimax(
                    testBoard,
                    depth + 1,
                    true
                );

                testBoard[i] = "";

                bestScore = Math.min(
                    score,
                    bestScore
                );

            }

        }

        return bestScore;

    }

}


// ========================================
// TOURNAMENT WINNER
// ========================================

function finishTournament(winner) {

    tournamentOver = true;

    gameOver = true;

    cpuThinking = false;

    clearTimeout(cpuTimer);

    const winnerName =
        winner === "X"
            ? "Player X"
            : gameMode.value === "cpu"
                ? "CPU"
                : "Player O";

    statusText.textContent = "Tournament Completed! 🏆";

    tournamentMessage.textContent =
        "🏆 " + winnerName + " IS THE CHAMPION! 🏆";

    tournamentMessage.classList.remove("hidden");

    resultMessage.textContent =
        winnerName + " reached " +
        winningScore.value + " wins!";

    resultMessage.classList.remove("hidden");

    disableBoard();

}


// ========================================
// UPDATE SCOREBOARD
// ========================================

function updateScoreboard() {

    scoreX.textContent = scores.X;

    scoreO.textContent = scores.O;

    drawScore.textContent = scores.draw;

    const target = Number(winningScore.value);

    remainingX.textContent =
        Math.max(0, target - scores.X);

    remainingO.textContent =
        Math.max(0, target - scores.O);

}


// ========================================
// DISABLE BOARD
// ========================================

function disableBoard() {

    cells.forEach(cell => {

        cell.disabled = true;

    });

}


// ========================================
// NEW GAME BUTTON
// ========================================

newGameBtn.addEventListener("click", () => {

    if (tournamentOver) return;

    resetGame();

});


// ========================================
// RESET GAME
// ========================================

function resetGame() {

    clearTimeout(cpuTimer);

    board = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameOver = false;

    cpuThinking = false;

    cells.forEach(cell => {

        cell.textContent = "";

        cell.disabled = false;

        cell.className = "cell";

    });

    resultMessage.classList.add("hidden");

    resultMessage.textContent = "";

    tournamentMessage.classList.add("hidden");

    tournamentMessage.textContent = "";

    updateScoreboard();

    updateStatus();

}


// ========================================
// RESET SCORES BUTTON
// ========================================

resetBtn.addEventListener("click", () => {

    scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    tournamentOver = false;

    updateScoreboard();

    resetGame();

});


// ========================================
// INITIALIZE GAME
// ========================================

updateScoreboard();

updateStatus();
