const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
let linesCleared = 0;
const arena = createMatrix(12, 20);
const colors = ['0', 'blue', 'yellow', 'purple', 'green', 'red', 'white', 'orange'];

ctx.scale(20, 20);

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        ++linesCleared;  // Add this line
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] === undefined ||
                arena[y + o.y][x + o.x] === undefined ||
                arena[y + o.y][x + o.x] !== 0)
            ) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'I') {
        return [
            [0, 4, 0, 0],
            [0, 4, 0, 0],
            [0, 4, 0, 0],
            [0, 4, 0, 0]
        ];
    } else if (type === 'J') {
        return [
            [0, 5, 0],
            [0, 5, 0],
            [5, 5, 0],
        ];
    } 
 {
        throw new TypeError(`Unhandled piece type: ${type}`);
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);

    // Add text for the line counter
    ctx.fillStyle = 'white';
    ctx.font = '1px Courier';
    ctx.fillText('SCORE: ' + linesCleared, 0.1, 21);

    // Add this for a white border around the playable area
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.05; // Adjust the thickness as needed
    ctx.strokeRect(0, 0, arena[0].length, arena.length);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, 
                             y + offset.y, 
                             1, 1);
            }
        });
    });
}

function merge(arena, player) {
    if (!player || !player.matrix || !player.pos) {
        return; // Exit the function if player or its properties are undefined
    }
    const m = player.matrix;
    const o = player.pos;
    m.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0 && arena[y + o.y] && arena[y + o.y][x + o.x] !== undefined) {
                arena[y + o.y][x + o.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    // Transpose the matrix: turn rows into columns
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    // Swap columns across the vertical middle line
    if(dir > 0) matrix.forEach(row => row.reverse());

    // For counter-clockwise rotation, reverse the order of rows.
    if(dir < 0) matrix.reverse();
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;
  
    draw();
    requestAnimationFrame(update);
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TOLJI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0] ? player.matrix[0].length / 2 | 0 : 0);

    // Let's clear the arena if the top row of it has some elements (game over situation).
    if (arena[0].some(value => value !== 0)) {
        arena.forEach(row => row.fill(0));
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerMove(offset) {
      player.pos.x += offset;
      if (collide(arena, player)) {
            player.pos.x -= offset;
      }
}

function playerHardDrop() {
    // Keep moving the player down until a collision is detected
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    // Undo the last drop as it caused a collision
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
}

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 38) {
        playerRotate(1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    } else if (event.keyCode === 32) {
        playerHardDrop();
    }
});


playerReset();
update();