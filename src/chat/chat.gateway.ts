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
import { getCorsOptions } from '../config/cors';

const MAX_NAME_LENGTH = 32;
const MAX_MESSAGE_LENGTH = 2000;

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

function normalizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (
    normalizedValue.length === 0 ||
    normalizedValue.length > maxLength ||
    hasControlCharacter(normalizedValue)
  ) {
    return undefined;
  }

  return normalizedValue;
}

function getMessage(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return normalizeText(
    (value as { message?: unknown }).message,
    MAX_MESSAGE_LENGTH,
  );
}

@WebSocketGateway({
  cors: getCorsOptions(),
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;
  private clients: Map<string, { name: string }> = new Map();
  // -------------------------------------------------------------------------
  handleConnection(client: Socket) {
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
        data: file,
      },
    });
  }

  // -------------------------------------------------------------------------
  @SubscribeMessage('set_name')
  handleSetName(
    @ConnectedSocket() client: Socket,
    @MessageBody() name: unknown,
  ): void {
    const validName = normalizeText(name, MAX_NAME_LENGTH);
    const clientData = this.clients.get(client.id);

    if (validName && clientData) {
      clientData.name = validName;
      this.clients.set(client.id, clientData);
      client.broadcast.emit('message', {
        name: 'Server',
        type: MessageTypeEnum.JOIN,
        message: `${clientData?.name} joined the chat`,
      });
      this.logger.log(`Client ${client.id} setting name to: ${validName}`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ): void {
    const message = getMessage(data);

    if (!message) {
      return;
    }

    const clientData = this.clients.get(client.id);
    const clientName = clientData?.name || 'Anonymous';
    console.log(`${clientName}: ${message}`);
    this.server.emit('message', {
      // name: coloredName, // Send colored name
      name: clientName, // Send uncolored name
      message,
    });
  }
}
