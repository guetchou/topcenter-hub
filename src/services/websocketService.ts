import { v4 as uuidv4 } from "uuid";

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private clientId: string = uuidv4();

  constructor(url: string) {
    this.url = url;
  }

  public connect(_notify?: boolean): Promise<boolean> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve(true);
          }
        }, 100);
      });
    }

    this.isConnecting = true;

    return new Promise((resolve) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log("WebSocket Connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          this.send({
            type: "register",
            clientId: this.clientId,
            timestamp: Date.now(),
          });

          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket Message:", data);

            if (data.type && this.messageHandlers.has(data.type)) {
              const handlers = this.messageHandlers.get(data.type);
              handlers?.forEach((handler) => handler(data));
            }

            if (this.messageHandlers.has("*")) {
              const handlers = this.messageHandlers.get("*");
              handlers?.forEach((handler) => handler(data));
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.socket.onclose = () => {
          console.log("WebSocket Disconnected");
          this.isConnecting = false;

          if (this.reconnectTimeout !== null) {
            clearTimeout(this.reconnectTimeout);
          }

          const delay = Math.min(30000, Math.pow(1.5, this.reconnectAttempts) * 1000);
          this.reconnectAttempts++;

          this.reconnectTimeout = window.setTimeout(() => this.connect(), delay);
          resolve(false);
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          this.isConnecting = false;
          resolve(false);
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  public send(message: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        const fullMessage = {
          ...message,
          clientId: this.clientId,
        };

        this.socket.send(JSON.stringify(fullMessage));
        return true;
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
        return false;
      }
    }

    console.warn("WebSocket not connected. Attempting to connect...");
    this.connect().then((connected) => {
      if (connected) {
        this.send(message);
      }
    });
    return false;
  }

  public close(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public on(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    this.messageHandlers.get(messageType)?.add(handler);

    return () => {
      this.messageHandlers.get(messageType)?.delete(handler);
      if (this.messageHandlers.get(messageType)?.size === 0) {
        this.messageHandlers.delete(messageType);
      }
    };
  }

  public getClientId(): string {
    return this.clientId;
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService("wss://echo.websocket.org");
