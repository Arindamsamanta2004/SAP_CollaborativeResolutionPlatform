/**
 * WebSocket Simulation Service
 * 
 * This service simulates WebSocket functionality for real-time updates
 * without requiring an actual WebSocket server connection.
 */

type MessageHandler = (message: any) => void;
type ConnectionHandler = () => void;

export class WebSocketService {
  private connected: boolean = false;
  private messageHandlers: MessageHandler[] = [];
  private connectHandlers: ConnectionHandler[] = [];
  private disconnectHandlers: ConnectionHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000; // Start with 2 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private simulatedLatency: number = 100; // Simulated network latency in ms
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    // Try to use BroadcastChannel API for cross-tab communication if available
    try {
      this.broadcastChannel = new BroadcastChannel('sap_crp_websocket_simulation');
      this.broadcastChannel.onmessage = (event) => {
        this.notifyMessageHandlers(event.data);
      };
    } catch (error) {
      console.warn('BroadcastChannel API not supported. Cross-tab real-time updates will not work.');
    }
  }

  /**
   * Connect to the simulated WebSocket
   */
  public connect(): void {
    if (this.connected) return;
    
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectHandlers();
      
      // Simulate occasional random updates for demo purposes
      this.startRandomUpdates();
    }, 500);
  }

  /**
   * Disconnect from the simulated WebSocket
   */
  public disconnect(): void {
    if (!this.connected) return;
    
    this.connected = false;
    this.stopRandomUpdates();
    this.notifyDisconnectHandlers();
  }

  /**
   * Attempt to reconnect to the simulated WebSocket
   */
  public reconnect(): void {
    if (this.connected) this.disconnect();
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${timeout}ms...`);
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, timeout);
  }

  /**
   * Send a message through the simulated WebSocket
   */
  public send(message: any): void {
    if (!this.connected) {
      console.warn('Cannot send message: WebSocket is not connected');
      return;
    }
    
    // Simulate network latency
    setTimeout(() => {
      // Broadcast to other tabs if BroadcastChannel is available
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message);
      }
      
      // Also notify local handlers (simulate echo from server)
      this.notifyMessageHandlers(message);
    }, this.simulatedLatency);
  }

  /**
   * Register a handler for incoming messages
   */
  public onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Register a handler for connection events
   */
  public onConnect(handler: ConnectionHandler): void {
    this.connectHandlers.push(handler);
  }

  /**
   * Register a handler for disconnection events
   */
  public onDisconnect(handler: ConnectionHandler): void {
    this.disconnectHandlers.push(handler);
  }

  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Set the simulated network latency
   */
  public setLatency(latency: number): void {
    this.simulatedLatency = latency;
  }

  /**
   * Notify all message handlers of a new message
   */
  private notifyMessageHandlers(message: any): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Notify all connect handlers
   */
  private notifyConnectHandlers(): void {
    this.connectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in connect handler:', error);
      }
    });
  }

  /**
   * Notify all disconnect handlers
   */
  private notifyDisconnectHandlers(): void {
    this.disconnectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in disconnect handler:', error);
      }
    });
  }

  // Random update generators for demo purposes
  private randomUpdateTimer: NodeJS.Timeout | null = null;

  /**
   * Start generating random updates for demo purposes
   */
  private startRandomUpdates(): void {
    // Generate a random update every 30-60 seconds
    this.randomUpdateTimer = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of random update
        this.generateRandomUpdate();
      }
    }, 30000 + Math.random() * 30000);
  }

  /**
   * Stop generating random updates
   */
  private stopRandomUpdates(): void {
    if (this.randomUpdateTimer) {
      clearInterval(this.randomUpdateTimer);
      this.randomUpdateTimer = null;
    }
  }

  /**
   * Generate a random update for demo purposes
   */
  private generateRandomUpdate(): void {
    const updateTypes = ['ENGINEER_UPDATE'];
    const type = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    let data: any = {};
    
    switch (type) {
      case 'ENGINEER_UPDATE':
        // Random engineer ID between 1-8
        const engineerId = `eng-00${Math.floor(Math.random() * 8) + 1}`;
        // Random availability change
        const availabilityOptions = ['Available', 'Busy', 'Offline'];
        const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
        // Random workload change
        const workloadChange = Math.floor(Math.random() * 21) - 10; // -10 to +10
        
        data = {
          id: engineerId,
          availability,
          workloadChange
        };
        break;
    }
    
    this.notifyMessageHandlers({ type, data });
  }
}