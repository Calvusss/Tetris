/* CONSTANTES DEL JUEGO */
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const BLOCK_SIZE = 18;
const BLOCK_COLUMN = 14;
const BLOCK_ROW = 30;

const canvas_next = document.getElementById("pieza_next");
const context_next = canvas_next.getContext("2d");
const BLOCK_NEXT_SIZE = 5;

const $bloques = document.querySelector("#bloques");
const $score = document.getElementById("score");
const $calvus = document.getElementById("calvus");

const $startgame = document.getElementById("start_game");
const $pausegame = document.getElementById("pause_game");
const $gameover = document.getElementById("game_over");

const $touch_left = document.querySelector(".touch.left");
const $touch_right = document.querySelector(".touch.right");
const $touch_down = document.querySelector(".touch.down");
const $touch_up = document.querySelector(".touch.up");
const $touch_pause = document.querySelector(".touch.pause");

canvas.width = BLOCK_COLUMN * BLOCK_SIZE;
canvas.height = BLOCK_ROW * BLOCK_SIZE;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

canvas_next.width = BLOCK_NEXT_SIZE * BLOCK_SIZE;
canvas_next.height = BLOCK_NEXT_SIZE * BLOCK_SIZE;
context_next.scale(BLOCK_SIZE, BLOCK_SIZE);

/* VARIABLES DEL JUEGO */
let x = 0;
let y = 0;

let puntuacion = 0;
let game_active = false;

let x_prev = 0;
let y_prev = 0;

let pieza = {
  posicion: { x: null, y: null },
  forma: null,
  width: null,
  height: null,
};

let pieza_next = {
  posicion: { x: null, y: null },
  forma: null,
  width: null,
  height: null,
};

let bolsa_piezas = [];

let time_step = 500; // Velocidad del juego
let dropCounter = 0;
let lastTime = 0;

let board = crearBoard(BLOCK_ROW, BLOCK_COLUMN);
let board_prev = crearBoard(BLOCK_NEXT_SIZE, BLOCK_NEXT_SIZE);

// Diferentes piezas posibles
const FORMA_PIEZAS = {
  J: [
    [0, "J"],
    [0, "J"],
    ["J", "J"],
  ],
  T: [
    ["T", "T", "T"],
    [0, "T", 0],
  ],
  Z: [
    ["Z", "Z", 0],
    [0, "Z", "Z"],
  ],
  S: [
    [0, "S", "S"],
    ["S", "S", 0],
  ],
  O: [
    ["O", "O"],
    ["O", "O"],
  ],
  I: [["I", "I", "I", "I"]],
  L: [
    ["L", 0],
    ["L", 0],
    ["L", "L"],
  ],
};

// Creamos el tablero
function crearBoard(width, height) {
  return Array(width)
    .fill()
    .map(() => Array(height).fill(0));
}

// Llenamos el pool de piezas
function llenarBolsaPiezas() {
  let piezas = Object.keys(FORMA_PIEZAS);
  piezas.sort(() => Math.random() - 0.5);
  return piezas;
}

// Creamos la pieza nueva
function crearPiezaNueva(tipo_pieza, next) {
  const forma_pieza = next
    ? FORMA_PIEZAS[tipo_pieza]
    : FORMA_PIEZAS[bolsa_piezas.pop()];

  if (!bolsa_piezas.length) bolsa_piezas = llenarBolsaPiezas();

  if (!next) {
    x = Math.floor(Math.random() * (BLOCK_COLUMN - forma_pieza[0].length + 1));
    y = 0;
  }

  let pieza_nueva = {
    posicion: {
      x: next ? 0 : x,
      y: next ? 0 : y,
    },
    forma: forma_pieza,
    width: forma_pieza[0].length,
    height: forma_pieza.length,
  };

  return pieza_nueva;
}

// Limpiamos el tablero
function cleanCanvas() {
  // Limpiamos todo el Canvas
  context.clearRect(0, 0, BLOCK_COLUMN, BLOCK_ROW);
  // Limpiamos todo el Canvas
  context_next.clearRect(0, 0, BLOCK_NEXT_SIZE, BLOCK_NEXT_SIZE);
}

// Dibujamos el tablero y las piezas
function draw() {
  // Pintamos todo el tablero
  board.forEach((row, board_y) =>
    row.forEach((value, board_x) => {
      pintarBoard(value, board_x, board_y, context);
    })
  );

  // Pintamos todo el tablero
  board_prev.forEach((row, board_y) =>
    row.forEach((col, board_x) => {
      pintarBoard(col, board_x, board_y, context_next);
    })
  );

  // Pintamos la pieza en movimiento
  pieza.forma?.forEach((row, pieza_y) =>
    row.forEach((value, pieza_x) => {
      if (value != 0) pintarBoard(value, pieza_x + x, pieza_y + y, context);
    })
  );

  // Pintamos la pieza siguiente
  pieza_next.forma?.forEach((row, pieza_y) =>
    row.forEach((value, pieza_x) => {
      if (value != 0)
        pintarBoard(
          value,
          pieza_x + BLOCK_NEXT_SIZE / 2 - pieza_next.width / 2,
          pieza_y + BLOCK_NEXT_SIZE / 2 - pieza_next.height / 2,
          context_next
        );
    })
  );
}

// Comenzar la partida
function start_game() {
  game_active = true;
  puntuacion = 0;
  bolsa_piezas = llenarBolsaPiezas();
  pieza = crearPiezaNueva();
  pieza_next = crearPiezaNueva(bolsa_piezas[bolsa_piezas.length - 1], true);
  board = crearBoard(BLOCK_ROW, BLOCK_COLUMN);
  loop_game();
  $startgame.hidden = true;
  $gameover.hidden = true;
}

// Pausar la partida
function pause_game() {
  game_active = !game_active;
  loop_game();
  $pausegame.hidden = !$pausegame.hidden;
}

// Comprobamos la colisión con los bordes y las piezas
function comprobarColision(dx, dy) {
  return pieza.forma.find((row, pieza_y) => {
    return row.find((value, pieza_x) => {
      return value != 0 && board[y + pieza_y + dy]?.[x + pieza_x + dx] != 0;
    });
  });
}

// Rotamos la pieza si no colisiona.
function rotarPieza() {
  let forma_nueva = [];
  let forma_original = pieza.forma;

  for (let i = 0; i < pieza.width; i++) {
    let row_new = [];
    for (let j = pieza.height - 1; j >= 0; j--) {
      row_new.push(pieza.forma[j][i]);
    }
    forma_nueva.push(row_new);
  }

  pieza.forma = forma_nueva;

  if (comprobarColision(0, 0)) pieza.forma = forma_original;

  pieza.width = pieza.forma[0].length;
  pieza.height = pieza.forma.length;
}

// Solidificamos la imagen y comprobamos el estado del juego
function solidificarPieza(letra) {
  // Comprobamos si el juego se ha finalizado
  if (y == 0) {
    game_active = false;
    $gameover.hidden = false;
  } else {
    // Fijamos la pieza en el board
    pieza.forma.forEach((row, pieza_y) =>
      row.forEach((value, pieza_x) => {
        if (value != 0) board[y + pieza_y][x + pieza_x] = value;
      })
    );

    // Recorremos todo el tablero y eliminamos las filas completas
    board.forEach((row, index) => {
      if (row.find((element) => element == 0) == undefined) {
        board.splice(index, 1);
        board.unshift(Array(BLOCK_COLUMN).fill(0));
        puntuacion++;
        $score.innerHTML = puntuacion;
      }
    });

    // Creamos una nueva pieza
    pieza = crearPiezaNueva(letra);
    pieza_next = crearPiezaNueva(bolsa_piezas[bolsa_piezas.length - 1], true);
  }
}

// Pintamos un bloque del juego
function pintarBloque(color, pieza_x, pieza_y, ctx) {
  ctx.drawImage(
    $bloques,
    color * BLOCK_SIZE,
    0,
    BLOCK_SIZE,
    BLOCK_SIZE,
    pieza_x,
    pieza_y,
    1,
    1
  );
}

// Pintamos el tablero
function pintarBoard(key, board_x, board_y, ctx) {
  let color = 0;
  switch (key) {
    case 0: // Black
      color = -1;
      ctx.fillStyle = "black";
      break;
    case "J": // Blue
      color = 0;
      ctx.fillStyle = "blue";
      break;
    case "T": // Purple
      color = 1;
      ctx.fillStyle = "purple";
      break;
    case "Z": // Red
      color = 2;
      ctx.fillStyle = "red";
      break;
    case "S": // Green
      color = 3;
      ctx.fillStyle = "green";
      break;
    case "O": // Yellow
      color = 4;
      ctx.fillStyle = "yellow";
      break;
    case "I": // Cyan
      color = 5;
      ctx.fillStyle = "cyan";
      break;
    case "L": // Orange
      color = 6;
      ctx.fillStyle = "orange";
      break;
    default: // Default
      color = -2;
      ctx.fillStyle = "gray";
      break;
  }

  ctx.fillRect(board_x, board_y, 1, 1);

  // Pintamos los bloques
  if (color >= 0) pintarBloque(color, board_x, board_y, ctx);
}

// Caida de la pieza
function dropPieza(time, speed) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  if (dropCounter > speed) {
    dropCounter = 0;
    if (!comprobarColision(0, +1)) y++;
    else solidificarPieza();
  }
}

// Lanzamos confeti de manera aleatoria
function lanzarConfetti(num_confetti) {
  for (let i = 0; i < num_confetti; i++)
    confetti({
      particleCount: 200,
      startVelocity: 40,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
    });
}

// Esperamos que presione algún botón o haga click en la pantalla
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
    case "A":
    case "a":
      if (!comprobarColision(-1, 0)) x--;
      break;
    case "ArrowRight":
    case "D":
    case "d":
      if (!comprobarColision(+1, 0)) x++;
      break;
    case "ArrowUp":
    case "W":
    case "w":
      rotarPieza();
      break;
    case "ArrowDown":
    case "S":
    case "s":
      if (!comprobarColision(0, +1)) y++;
      else solidificarPieza();
      break;
    case "Enter":
    case " ":
      if (game_active || !$pausegame.hidden) pause_game();
      break;
    default:
      break;
  }
});

$startgame.addEventListener("click", () => start_game());
$pausegame.addEventListener("click", () => pause_game());
$gameover.addEventListener("click", () => start_game());
$calvus.addEventListener("click", () => lanzarConfetti(5));

$touch_left.addEventListener("click", () =>
  !comprobarColision(-1, 0) ? x-- : null
);

$touch_right.addEventListener("click", () =>
  !comprobarColision(+1, 0) ? x++ : null
);

$touch_down.addEventListener("click", () =>
  !comprobarColision(0, +1) ? y++ : solidificarPieza()
);

$touch_up.addEventListener("click", () => rotarPieza());
$touch_pause.addEventListener("click", () => pause_game());

// Actualizamos el LOOP del juego
function loop_game(time = 0) {
  dropPieza(time, time_step);
  cleanCanvas();
  draw();
  if (game_active) requestAnimationFrame(loop_game);
}

loop_game();
