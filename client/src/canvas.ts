import { GAME_CONFIG } from "@cursor-tag/shared/config";
import { Player } from "@cursor-tag/shared/types";

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    canvas.width = GAME_CONFIG.ARENA_WIDTH;
    canvas.height = GAME_CONFIG.ARENA_HEIGHT;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPlayer(player: Player, isIt: boolean, isLocal: boolean): void {
    this.ctx.beginPath();
    this.ctx.arc(player.x, player.y, GAME_CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = isLocal ? "#3b82f6" : "#ef4444";
    this.ctx.fill();

    if (isLocal) {
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }
  }

  drawUI(
    timeRemaining: number,
    players: Player[],
    whoIsIt: string,
    localPlayerId: string,
  ): void {
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = "16px monospace";
    this.ctx.fillStyle = "#fff";

    let scoreX = this.canvas.width - 150;
    const scoreY = 30;

    // timer
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    this.ctx.textAlign = "center";
    this.ctx.fillText(timeText, this.canvas.width / 2, 30);

    players.forEach((player) => {
      this.ctx.beginPath();
      this.ctx.arc(scoreX, scoreY, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = localPlayerId === player.id ? "#3b82f6" : "#ef4444";
      this.ctx.fill();

      this.ctx.fillStyle = "#fff";
      this.ctx.fillText(
        `${player.id === localPlayerId ? "You" : "Opponent"} ${player.score}`,
        player.id === localPlayerId ? scoreX + 40 : scoreX + 80,
        scoreY + 5,
      );

      scoreX += 120;
    });
  }

  render(
    players: Player[],
    whoIsIt: string,
    localPlayerId: string,
    timeRemaining: number,
  ): void {
    this.clear();
    players.forEach((player) => {
      this.drawPlayer(
        player,
        player.id === whoIsIt,
        player.id === localPlayerId,
      );
    });

    this.drawUI(timeRemaining, players, whoIsIt, localPlayerId);
  }
}
