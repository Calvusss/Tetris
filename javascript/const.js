/* CONSTANTES DEL JUEGO */
const BLOCK_SPRITE_SIZE = 18;
const BLOCK_SIZE = 18;
const BLOCK_COLUMN = 14;
const BLOCK_ROW = 30;
const BLOCK_NEXT_SIZE = 5;
const JOYSTICK_SIZE = 200;

const $bloques = document.querySelector("#bloques");
const $score = document.getElementById("score");
const $calvus = document.getElementById("calvus");

// Elementos táctiles de la pantalla
const $startgame = document.getElementById("start_game");
const $pausegame = document.getElementById("pause_game");
const $gameover = document.getElementById("game_over");

const $key_left = document.querySelector(".key.left");
const $key_right = document.querySelector(".key.right");
const $key_up = document.querySelector(".key.up");
const $key_down = document.querySelector(".key.down");
const $key_fast_drop = document.querySelector(".key.fast_drop");
const $key_pause = document.querySelector(".key.pause");

// Configuración de los canvas
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

canvas.width = BLOCK_COLUMN * BLOCK_SIZE;
canvas.height = BLOCK_ROW * BLOCK_SIZE;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

const canvas_next = document.getElementById("pieza_next");
const context_next = canvas_next.getContext("2d");

canvas_next.width = BLOCK_NEXT_SIZE * BLOCK_SIZE;
canvas_next.height = BLOCK_NEXT_SIZE * BLOCK_SIZE;
context_next.scale(BLOCK_SIZE, BLOCK_SIZE);

// Diferentes piezas posibles
const pieza_vacia = {
  posicion: { x: null, y: null },
  forma: null,
  width: null,
  height: null,
};

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
