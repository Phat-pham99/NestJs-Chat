import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';

function createClient(id = 'client-1') {
  const broadcastEmit = jest.fn();

  return {
    broadcastEmit,
    client: {
      id,
      broadcast: { emit: broadcastEmit },
    } as unknown as Socket,
  };
}

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let serverEmit: jest.Mock;

  beforeEach(() => {
    gateway = new ChatGateway();
    serverEmit = jest.fn();
    gateway.server = { emit: serverEmit } as unknown as Server;
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('accepts a trimmed name and uses it for messages', () => {
    const { broadcastEmit, client } = createClient();
    gateway.handleConnection(client);

    gateway.handleSetName(client, '  Ada  ');
    gateway.handleMessage({ message: 'Hello' }, client);

    expect(broadcastEmit).toHaveBeenCalledWith('message', {
      name: 'Server',
      type: 'join',
      message: 'Ada joined the chat',
    });
    expect(serverEmit).toHaveBeenCalledWith('message', {
      name: 'Ada',
      message: 'Hello',
    });
  });

  it.each([null, 42, {}, '', '   ', 'a'.repeat(33), 'bad\nname'])(
    'rejects invalid name %p',
    (name) => {
      const { broadcastEmit, client } = createClient();
      gateway.handleConnection(client);

      gateway.handleSetName(client, name);
      gateway.handleMessage({ message: 'Hello' }, client);

      expect(broadcastEmit).not.toHaveBeenCalled();
      expect(serverEmit).toHaveBeenCalledWith('message', {
        name: 'Anonymous',
        message: 'Hello',
      });
    },
  );

  it('trims and accepts a valid message', () => {
    const { client } = createClient();
    gateway.handleConnection(client);

    gateway.handleMessage({ message: '  Hello room  ' }, client);

    expect(serverEmit).toHaveBeenCalledWith('message', {
      name: 'Anonymous',
      message: 'Hello room',
    });
  });

  it.each([
    null,
    undefined,
    'Hello',
    [],
    {},
    { message: null },
    { message: 42 },
    { message: '' },
    { message: '   ' },
    { message: 'm'.repeat(2001) },
    { message: 'bad\nmessage' },
  ])('rejects invalid message payload %p', (data) => {
    const { client } = createClient();
    gateway.handleConnection(client);

    expect(() => gateway.handleMessage(data, client)).not.toThrow();
    expect(serverEmit).not.toHaveBeenCalled();
  });
});
