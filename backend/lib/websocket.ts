import { WebSocketServer, WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

interface WebSocketMessage {
  type: string;
  data: any;
  rideId?: string;
  userId?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  rideIds: Set<string>;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private rideSubscriptions: Map<string, Set<string>> = new Map(); // rideId -> Set of userIds

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', async (ws: WebSocket, request: any) => {
      try {
        // Extract token from query string or headers
        const url = new URL(request.url, 'http://localhost');
        const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          ws.close(1008, 'Authentication required');
          return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;
        const userId = decoded.id;

        if (!userId) {
          ws.close(1008, 'Invalid token');
          return;
        }

        // Store client connection
        this.clients.set(userId, {
          ws,
          userId,
          rideIds: new Set()
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          data: { userId, message: 'Connected to SmartRides WebSocket' }
        }));

        // Handle incoming messages
        ws.on('message', (data: Buffer) => {
          try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            this.handleMessage(userId, message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Invalid message format' }
            }));
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          this.removeClient(userId);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.removeClient(userId);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  private handleMessage(userId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe_ride':
        this.subscribeToRide(userId, message.rideId!);
        break;
      case 'unsubscribe_ride':
        this.unsubscribeFromRide(userId, message.rideId!);
        break;
      case 'chat_message':
        this.broadcastToRide(message.rideId!, {
          type: 'chat_message',
          data: message.data
        });
        break;
      case 'location_update':
        this.broadcastToRide(message.rideId!, {
          type: 'location_update',
          data: message.data
        });
        break;
      case 'ride_status_update':
        this.broadcastToRide(message.rideId!, {
          type: 'ride_status_update',
          data: message.data
        });
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private subscribeToRide(userId: string, rideId: string) {
    const client = this.clients.get(userId);
    if (client) {
      client.rideIds.add(rideId);
      
      if (!this.rideSubscriptions.has(rideId)) {
        this.rideSubscriptions.set(rideId, new Set());
      }
      this.rideSubscriptions.get(rideId)!.add(userId);

      client.ws.send(JSON.stringify({
        type: 'subscribed',
        data: { rideId, message: 'Subscribed to ride updates' }
      }));
    }
  }

  private unsubscribeFromRide(userId: string, rideId: string) {
    const client = this.clients.get(userId);
    if (client) {
      client.rideIds.delete(rideId);
      
      const rideSubs = this.rideSubscriptions.get(rideId);
      if (rideSubs) {
        rideSubs.delete(userId);
        if (rideSubs.size === 0) {
          this.rideSubscriptions.delete(rideId);
        }
      }

      client.ws.send(JSON.stringify({
        type: 'unsubscribed',
        data: { rideId, message: 'Unsubscribed from ride updates' }
      }));
    }
  }

  private removeClient(userId: string) {
    const client = this.clients.get(userId);
    if (client) {
      // Unsubscribe from all rides
      client.rideIds.forEach(rideId => {
        const rideSubs = this.rideSubscriptions.get(rideId);
        if (rideSubs) {
          rideSubs.delete(userId);
          if (rideSubs.size === 0) {
            this.rideSubscriptions.delete(rideId);
          }
        }
      });
      
      this.clients.delete(userId);
    }
  }

  // Public methods for broadcasting
  public broadcastToRide(rideId: string, message: WebSocketMessage) {
    const subscribers = this.rideSubscriptions.get(rideId);
    if (subscribers) {
      subscribers.forEach(userId => {
        const client = this.clients.get(userId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      });
    }
  }

  public broadcastToUser(userId: string, message: WebSocketMessage) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  public broadcastToAll(message: WebSocketMessage) {
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getRideSubscribersCount(rideId: string): number {
    return this.rideSubscriptions.get(rideId)?.size || 0;
  }
}

export default WebSocketManager; 