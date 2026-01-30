import { WebSocket } from "ws";
import { Room } from "./room";
import { GAME_CONFIG } from "@cursor-tag/shared";

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(): Room {
    const roomCode = this.generateRoomCode();
    const newRoom = new Room(roomCode);

    this.rooms.set(roomCode, newRoom);

    return newRoom;
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  removeRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
  }

  joinRoom(
    roomCode: string,
    playerId: string,
    socket: WebSocket,
    name?: string,
  ): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.isFull()) {
      return null;
    }

    room.addPlayer(playerId, socket, name);
    return room;
  }

  cleanupEmptyRooms(): void {
    this.rooms.forEach((room) => {
      if (room.isEmpty()) {
        this.rooms.delete(room.roomCode);
      }
    });
  }

  private generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes ambiguous characters (0, O, I, 1)
    let code = "";
    for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }
}
