import {
  COLLISION_DISTANCE_SQUARED,
  GAME_CONFIG,
  GameState,
  Player,
  SERVER_MESSAGES,
} from "@cursor-tag/shared";
import { WebSocket } from "ws";

export class Room {
  readonly roomCode: string;
  private players: Map<string, Player> = new Map();
  private sockets: Map<string, WebSocket> = new Map();
  private whoIsIt: string | null = null;
  private status: GameState["status"] = "waiting";
  private timeRemaining: number = GAME_CONFIG.ROUND_DURATION;
  private lastTagTime: number = 0;
  private checkCollision(player1: Player, player2: Player): boolean {
    const distanceSquared =
      (player2.x - player1.x) ** 2 + (player2.y - player1.y) ** 2;

    return distanceSquared < COLLISION_DISTANCE_SQUARED;
  }

  constructor(roomCode: string) {
    this.roomCode = roomCode;
  }

  addPlayer(id: string, socket: WebSocket, name?: string): Player {
    const player: Player = {
      id,
      name: name || `Player ${this.players.size + 1}`,
      x: this.getSpawnX(),
      y: this.getSpawnY(),
      score: 0,
    };

    this.players.set(id, player);
    this.sockets.set(id, socket);

    // First player to join becomes "it"
    if (this.players.size === 1) {
      this.whoIsIt = id;
    }

    return player;
  }

  private getSpawnX(): number {
    // First player spawns left side, second spawns right
    return this.players.size === 0
      ? GAME_CONFIG.ARENA_WIDTH * 0.25
      : GAME_CONFIG.ARENA_WIDTH * 0.75;
  }

  private getSpawnY(): number {
    return GAME_CONFIG.ARENA_HEIGHT / 2;
  }

  removePlayer(id: string): void {
    this.players.delete(id);
    this.sockets.delete(id);

    if (this.whoIsIt === id) {
      if (this.players.size > 0) {
        const remainingPlayer = this.players.values().next().value as Player;
        this.whoIsIt = remainingPlayer.id;
      } else {
        this.whoIsIt = null;
      }
    }
  }

  broadcast(message: object): void {
    this.sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    });
  }

  isFull(): boolean {
    return this.players.size === 2;
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  updatePlayerPosition(id: string, x: number, y: number): void {
    const player = this.players.get(id);
    if (!player) {
      return;
    }

    player.x = Math.max(0, Math.min(x, GAME_CONFIG.ARENA_WIDTH));
    player.y = Math.max(0, Math.min(y, GAME_CONFIG.ARENA_HEIGHT));
  }

  getWhoIsIt(): string | null {
    return this.whoIsIt;
  }

  getStatus(): GameState["status"] {
    return this.status;
  }

  private gameLoopInterval: NodeJS.Timeout | null = null;

  startGameLoop(): void {
    this.gameLoopInterval = setInterval(() => {
      this.tick();
    }, 1000 / GAME_CONFIG.TICK_RATE);
  }

  stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  private tick(): void {
    if (this.players.size === 2 && this.whoIsIt) {
      this.timeRemaining -= 1 / GAME_CONFIG.TICK_RATE;

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.status = "ended";

        const finalScores: Record<string, number> = {};
        this.players.forEach((player) => {
          finalScores[player.id] = player.score;
        });

        const players = Array.from(this.players.values());

        const winner =
          players[0].score === players[1].score
            ? "draw"
            : players[0].score > players[1].score
              ? players[0].id
              : players[1].id;

        this.stopGameLoop();

        this.broadcast({
          type: SERVER_MESSAGES.GAME_OVER,
          payload: {
            winner,
            finalScores,
          },
        });

        return;
      }
      const tagger = this.players.get(this.whoIsIt);
      const tagged = this.getAllPlayers().find((p) => p.id !== this.whoIsIt);

      const immunityOver =
        Date.now() - this.lastTagTime > GAME_CONFIG.TAG_IMMUNITY_MS;

      if (
        immunityOver &&
        tagger &&
        tagged &&
        this.checkCollision(tagger, tagged)
      ) {
        tagger.score += 1;
        this.whoIsIt = tagged.id;

        this.lastTagTime = Date.now();

        this.broadcast({
          type: SERVER_MESSAGES.TAG,
          payload: {
            tagger: tagger.id,
            tagged: tagged.id,
            newScores: {
              [tagger.id]: tagger.score,
              [tagged.id]: tagged.score,
            },
          },
        });
      }
    }

    this.broadcast({
      type: SERVER_MESSAGES.STATE,
      payload: {
        players: this.getAllPlayers(),
        whoIsIt: this.whoIsIt!,
        timeRemaining: this.timeRemaining,
      },
    });
  }
}
