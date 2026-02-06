import { Network } from "./network";
import { Input } from "./input";
import { Renderer } from "./canvas";
import {
  Player,
  ServerMessage,
  CLIENT_MESSAGES,
} from "@cursor-tag/shared/types";

let players: Player[] = [];
let whoIsIt: string = "";
let localPlayerId: string = "";
let timeRemaining: number = 0;
let gameStatus: "waiting" | "countdown" | "playing" | "ended" = "waiting";
let countdownValue: number = 0;
let winner: string | null = null;

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const network = new Network();
const input = new Input(network, canvas);
const renderer = new Renderer(canvas);

const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");

function getWebSocketURL(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname;
  const port = 3001;
  return `${protocol}//${host}:${port}`;
}

function updateUI() {
  // Get all screens
  const waitingScreen = document.getElementById("waiting-screen");
  const countdownOverlay = document.getElementById("countdown-overlay");
  const gameOverScreen = document.getElementById("game-over-screen");
  const disconnectScreen = document.getElementById("disconnect-screen");

  // Hide all first
  waitingScreen?.classList.remove("visible");
  countdownOverlay?.classList.remove("visible");
  gameOverScreen?.classList.remove("visible");
  disconnectScreen?.classList.remove("visible");

  // Show the appropriate one based on gameStatus
  if (gameStatus === "waiting") {
    waitingScreen?.classList.add("visible");
  } else if (gameStatus === "countdown") {
    countdownOverlay?.classList.add("visible");
    const countdownNum = document.getElementById("countdown-number");
    if (countdownNum) countdownNum.textContent = String(countdownValue);
  } else if (gameStatus === "ended") {
    gameOverScreen?.classList.add("visible");
    const winnerText = document.getElementById("winner-text");
    if (winnerText && winner) {
      if (winner === "draw") {
        winnerText.textContent = "It's a Draw!";
      } else if (winner === localPlayerId) {
        winnerText.textContent = "You Win!";
      } else {
        winnerText.textContent = "You Lose!";
      }
    }
  }
}

function gameLoop() {
  renderer.render(players, whoIsIt, localPlayerId, timeRemaining);
  requestAnimationFrame(gameLoop);
  updateUI();
}

// rematch button
document.getElementById("rematch-btn")?.addEventListener("click", () => {
  network.send({ type: CLIENT_MESSAGES.REMATCH, payload: {} });
});

async function renderGame() {
  await network.connect(getWebSocketURL());

  network.send({
    type: CLIENT_MESSAGES.JOIN,
    payload: { roomCode: roomCode || undefined },
  });
}

network.onMessage((message: ServerMessage) => {
  if (message.type === "init") {
    localPlayerId = message.payload.playerId;

    players = message.payload.players;
    whoIsIt = message.payload.whoIsIt || "";
    gameStatus = message.payload.status;

    console.log(`Room code: ${message.payload.roomCode}`);

    const roomCodeDisplay = document.getElementById("room-code-display");
    if (roomCodeDisplay) {
      roomCodeDisplay.textContent = message.payload.roomCode;
    }

    input.start();
  }

  if (message.type === "state") {
    players = message.payload.players;
    whoIsIt = message.payload.whoIsIt || "";
    timeRemaining = message.payload.timeRemaining;
  }

  if (message.type === "countdown") {
    gameStatus = "countdown";
    countdownValue = message.payload.count;
  }

  if (message.type === "tag") {
    whoIsIt = message.payload.tagged;
    // add flash for visuasl tag
  }

  if (message.type === "game_over") {
    gameStatus = "ended";
    winner = message.payload.winner;
  }
  if (message.type === "player_left") {
    gameStatus = "waiting";
  }
});

gameLoop();
renderGame();
