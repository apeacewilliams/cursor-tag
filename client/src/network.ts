import { ClientMessage, ServerMessage } from "@cursor-tag/shared/types";

type MessageHandler = (message: ServerMessage) => void;

export class Network {
  private socket: WebSocket | null = null;
  private handlers: MessageHandler[] = [];

  connect(url: string): Promise<void> {
    const socket = new WebSocket(url);
    this.socket = socket;
    return new Promise((resolve, reject) => {
      socket.onopen = () => {
        socket.onmessage = (event) => {
          const message: ServerMessage = JSON.parse(event.data);
          this.handlers.forEach((handler) => handler(message));
        };
        resolve();
      };
      socket.onerror = (err) => {
        reject(err);
      };
    });
  }

  send(message: ClientMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
