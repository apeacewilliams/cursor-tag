import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./RoomManager.js";

import { GAME_CONFIG } from "@cursor-tag/shared/config.js";
import {
  CLIENT_MESSAGES,
  ClientMessage,
  SERVER_MESSAGES,
} from "@cursor-tag/shared/types.js";

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: Number(PORT) });
const roomManager = new RoomManager();

const socketToRoom = new Map<WebSocket, string>();

console.log(`🎮 Cursor Tag server running on ws://localhost:${PORT}`);
console.log(`   Tick rate: ${GAME_CONFIG.TICK_RATE}hz`);
console.log(`   Arena: ${GAME_CONFIG.ARENA_WIDTH}x${GAME_CONFIG.ARENA_HEIGHT}`);

wss.on("connection", (socket: WebSocket) => {
  const playerId = crypto.randomUUID();
  console.log(`Client connected: ${playerId}`);

  socket.on("message", (data) => {
    const text = data.toString();

    let message: ClientMessage;
    try {
      message = JSON.parse(text);
    } catch (error) {
      console.warn("Invalid JSON received:", error);
      return;
    }

    if (message.type === CLIENT_MESSAGES.JOIN) {
      let roomCode = message.payload.roomCode;

      if (!roomCode) {
        roomCode = roomManager.createRoom().roomCode;
      }

      const room = roomManager.joinRoom(
        roomCode,
        playerId,
        socket,
        message.payload.name,
      );

      if (!room) {
        socket.send(
          JSON.stringify({
            type: SERVER_MESSAGES.ERROR,
            payload: { message: "Room not found or full" },
          }),
        );
        return;
      }

      socket.send(
        JSON.stringify({
          type: SERVER_MESSAGES.INIT,
          payload: {
            playerId,
            roomCode,
            arenaWidth: GAME_CONFIG.ARENA_WIDTH,
            arenaHeight: GAME_CONFIG.ARENA_HEIGHT,
            players: room.getAllPlayers(),
            whoIsIt: room.getWhoIsIt(),
            status: room.getStatus(),
          },
        }),
      );
      socketToRoom.set(socket, roomCode);

      if (room.getAllPlayers().length > 1) {
        room.broadcast({
          type: SERVER_MESSAGES.PLAYER_JOINED,
          payload: {
            player: room.getPlayer(playerId),
          },
        });
      }
      // Note: countdown is started automatically in room.addPlayer() when room becomes full
    }

    if (message.type === CLIENT_MESSAGES.INPUT) {
      const roomCode = socketToRoom.get(socket);
      if (!roomCode) return;

      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      // Only process input when game is actively playing
      if (room.getStatus() === "playing") {
        room.updatePlayerPosition(
          playerId,
          message.payload.x,
          message.payload.y,
        );
      }
    }

    if (message.type === CLIENT_MESSAGES.REMATCH) {
      const roomCode = socketToRoom.get(socket);
      if (!roomCode) return;

      const room = roomManager.getRoom(roomCode);

      if (room && room.getStatus() === "ended") {
        room.resetGame();
      }
    }
  });

  socket.on("close", () => {
    console.log(`Client disconnected: ${playerId}`);
    const disconnectedPlayerRoom = socketToRoom.get(socket);

    if (!disconnectedPlayerRoom) {
      return;
    }
    const room = roomManager.getRoom(disconnectedPlayerRoom);

    // removePlayer() handles stopping countdown/game loop and resetting status
    room?.removePlayer(playerId);

    room?.broadcast({
      type: SERVER_MESSAGES.PLAYER_LEFT,
      payload: {
        playerId,
      },
    });

    socketToRoom.delete(socket);

    if (room) {
      roomManager.cleanupEmptyRooms();
    }
  });
});
