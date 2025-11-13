    import {
      WebSocketGateway,
      SubscribeMessage,
      MessageBody,
      WebSocketServer,
      OnGatewayConnection,
      OnGatewayDisconnect,
    } from '@nestjs/websockets';
    import { Server, Socket } from 'socket.io';

    @WebSocketGateway({
      cors: {
        origin: '*', // Adjust for your frontend URL in production
      },
    })
    export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
      @WebSocketServer()
      server: Server;

      handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
      }

      handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
      }

      @SubscribeMessage('message')
      handleMessage(@MessageBody() data: string): void {
        console.log(`Received message: ${data}`);
        this.server.emit('message', `Server received: ${data}`); // Echo back to all clients
      }
    }
