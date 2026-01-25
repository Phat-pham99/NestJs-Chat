import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageTypeEnum } from '../common/enums/message-type.enum';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for your frontend URL in production
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;
  private clients: Map<string, { name: string }> = new Map();
  // -------------------------------------------------------------------------
  handleConnection(client: Socket, ...args: any[]) {
    this.clients.set(client.id, { name: '' });
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Client disconnected: ${JSON.stringify(client)}`);
    this.logger.warn(`Client disconnected: ${client.id}`);
    const clientData = this.clients.get(client.id);
    this.logger.verbose(`Client disconnected: ${JSON.stringify(clientData)}`);
    this.logger.error(`${clientData?.name} left the chat`);
    this.clients.delete(client.id);
    this.server.emit('message', {
      name: 'Server',
      type: MessageTypeEnum.LEAVE,
      message: `${clientData?.name || 'unnamed'} left the chat`,
    });
    this.logger.log(`Client disconnected: ${clientData?.name}`);
  }

  // -------------------------------------------------------------------------
  public sendImage(file: Express.Multer.File): void {
    this.server.emit('image', {
      name: 'Server',
      type: MessageTypeEnum.IMAGE,
      message: {
        data: file
      },
    });
  }

  // -------------------------------------------------------------------------
  @SubscribeMessage('set_name')
  handleSetName(@ConnectedSocket() client: Socket, @MessageBody() name: string): void {
    const clientData = this.clients.get(client.id);
    if (clientData) {
      clientData.name = name;
      this.clients.set(client.id, clientData);
      client.broadcast.emit('message', {
        name: 'Server',
        type: MessageTypeEnum.JOIN,
        message: `${clientData?.name} joined the chat`,
      });
      this.logger.log(`Client ${client.id} setting name to: ${name}`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { message: string }, @ConnectedSocket() client: Socket): void {
    const clientData: {
      name: string;
    } | undefined = this.clients.get(client.id);
    const clientName: string = clientData?.name || 'Anonymous';
    const clientColor: string = clientData?.color || 'gray'; // Default color if not assigned

    const coloredName: string = chalk[clientColor](clientName); // Apply Chalk color

    console.log(`${clientName}: ${data.message}`);
    this.server.emit('message', {
      // name: coloredName, // Send colored name
      name: clientName, // Send uncolored name
      message: data.message,
    });
  }
}
