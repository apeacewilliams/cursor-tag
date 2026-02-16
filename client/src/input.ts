import { Network } from "./network";
import { CLIENT_MESSAGES } from "@cursor-tag/shared/types.js";
import { GAME_CONFIG } from "@cursor-tag/shared/config.js";

export class Input {
  private x: number = 0;
  private y: number = 0;
  private sendInterval: number | null = null;

  constructor(
    private network: Network,
    private canvas: HTMLCanvasElement,
    private mouseHandler: ((event: MouseEvent) => void) | null = null,
  ) {}

  start(): void {
    this.stop();
    this.mouseHandler = (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.x = event.clientX - rect.left;
      this.y = event.clientY - rect.top;
    };

    this.canvas.addEventListener("mousemove", this.mouseHandler);

    this.sendInterval = window.setInterval(() => {
      this.network.send({
        type: CLIENT_MESSAGES.INPUT,
        payload: {
          x: this.x,
          y: this.y,
        },
      });
    }, GAME_CONFIG.CLIENT_SEND_INTERVAL);
  }

  stop(): void {
    if (this.mouseHandler) {
      this.canvas.removeEventListener("mousemove", this.mouseHandler);
      this.mouseHandler = null;
    }

    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }
  }
}
