let board = ['','','','','','','','',''];
let playerTime = 0;
let symbols = ['X', 'O'];
let gameOver = false;

function makeMove(i) {
    if(board[i] == '' && !gameOver) {
        board[i] = symbols[playerTime];
        document.getElementById('cell'+(i+1)).innerText = symbols[playerTime];
        if (isWin()) {
            gameOver = true;
            setTimeout(resetBoard, 1000);
        } else {
            playerTime = playerTime == 0 ? 1 : 0;
            if(playerTime === 1) { // if it's AI's turn
                aiMove()
            }
        }
    }
}

function aiMove() {
    if(!gameOver) {
        let emptyCells = []
        for(let i = 0; i < 9; i++) {
            if(board[i] === '') {
                emptyCells.push(i)
            }
        }
        if(emptyCells.length > 0) {
            let rand = emptyCells[Math.floor(Math.random() * emptyCells.length)]
            setTimeout(() => makeMove(rand), 500) // AI makes a move with a small delay
        }
    }
}

function resetBoard() {
    board = ['','','','','','','','',''];
    playerTime = 0;
    gameOver = false;
    for(let i=1; i<=9; i++) { 
        document.getElementById('cell'+i).innerText = '';
    }
}

function isWin() {
    let winStates = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    for(let i = 0; i < winStates.length; i++) {
        if(board[winStates[i][0]] != '' && board[winStates[i][0]] == board[winStates[i][1]] && board[winStates[i][1]] == board[winStates[i][2]]) {
            return true;
        }
    }

    return false;
}