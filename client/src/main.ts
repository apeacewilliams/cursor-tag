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

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const network = new Network();
const input = new Input(network, canvas);
const renderer = new Renderer(canvas);

const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");

function gameLoop() {
  renderer.render(players, whoIsIt, localPlayerId, timeRemaining);
  requestAnimationFrame(gameLoop);
}

async function renderGame() {
  await network.connect("ws://localhost:3001");

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
    console.log(`Room code: ${message.payload.roomCode}`);
    input.start();
  }

  if (message.type === "state") {
    players = message.payload.players;
    whoIsIt = message.payload.whoIsIt || "";
    timeRemaining = message.payload.timeRemaining;
  }
});

gameLoop();
renderGame();
