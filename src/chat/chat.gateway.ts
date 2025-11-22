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
import chalk from 'chalk';

import { MessageTypeEnum } from '../common/enums/message-type.enum';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for your frontend URL in production
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private clients: Map<string, { name: string; color: string }> = new Map(); // socket.id => { name, color }
  private availableColors: string[] = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
  ];
  private assignedColors: Set<string> = new Set();
  handleConnection(client: Socket, ...args: any[]) {
    this.assignUniqueColor(client);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const clientData = this.clients.get(client.id);
    this.server.emit('message', {
      // name: coloredName, // Send colored name
      name: 'Server', // Send uncolored name
      type: MessageTypeEnum.LEAVE,
      message: `${clientData?.name} left the chat`,
    });
    console.log(`Client disconnected: ${clientData?.name}`);
  }

  private assignUniqueColor(client: Socket): void {
    if (this.availableColors.length === 0) {
      console.warn('No more unique colors available!');
      this.clients.set(client.id, { name: 'Anonymous', color: 'gray' }); // Default color
      return;
    }

    let color: string;
    do {
      color = this.availableColors[
        Math.floor(Math.random() * this.availableColors.length)
      ];
    } while (this.assignedColors.has(color)); // Ensure uniqueness

    this.assignedColors.add(color);
    this.clients.set(client.id, { name: 'Anonymous', color: color });

    console.log(`Assigned color ${color} to client ${client.id}`);
  }

  @SubscribeMessage('set_name')
  handleSetName(@ConnectedSocket() client: Socket, @MessageBody() name: string): void {
    const clientData = this.clients.get(client.id);
    if (clientData) {
      clientData.name = name;
      this.clients.set(client.id, clientData);
      this.server.emit('message', {
        // name: coloredName, // Send colored name
        name: 'Server', // Send uncolored name
        type: MessageTypeEnum.JOIN,
        message: `${clientData?.name} joined the chat`,
      });
      console.log(`Client ${client.id} setting name to: ${name}`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { message: string }, @ConnectedSocket() client: Socket): void {
    const clientData: {
      name: string;
      color: string;
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
