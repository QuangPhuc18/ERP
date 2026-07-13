import * as signalR from "@microsoft/signalr";

class SignalRService {  
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;

  public startConnection(token: string) {
    if (this.connection) return; // Prevent multiple connections

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5121/appHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .then(() => {
        this.isConnected = true;
        console.log("🟢 [SignalR] Đã kết nối thành công tới Server Realtime!");
      })
      .catch((err) => {
        console.error("🔴 [SignalR] Lỗi kết nối:", err);
      });

    this.connection.onreconnecting((error) => {
      console.warn("🟡 [SignalR] Đang thử kết nối lại...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("🟢 [SignalR] Đã kết nối lại thành công. ID:", connectionId);
    });
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.isConnected = false;
      console.log("⚪ [SignalR] Đã ngắt kết nối.");
    }
  }

  public on(eventName: string, callback: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.on(eventName, callback);
    }
  }

  public off(eventName: string, callback?: (...args: any[]) => void) {
    if (this.connection) {
      if (callback) {
        this.connection.off(eventName, callback);
      } else {
        this.connection.off(eventName);
      }
    }
  }
}

const signalRService = new SignalRService();
export default signalRService;
