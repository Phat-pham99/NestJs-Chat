const { loadClient } = require('./client-test-harness');

describe('browser client harness', () => {
  it('loads the client and registers Socket.IO handlers', () => {
    const { document, socket, window } = loadClient();

    expect(document.title).toBe('NestJs Chat App');
    expect(window.io).toHaveBeenCalledTimes(1);
    expect(socket.emitted).toEqual([]);
  });

  it('records client emissions and dispatches server events', () => {
    const { document, socket } = loadClient();
    const nameInput = document.getElementById('name-input');
    const nameButton = document.getElementById('name-btn');

    nameInput.value = 'Ada';
    nameButton.click();
    socket.trigger('message', { name: 'Lin', message: 'Hello' });

    expect(socket.emitted).toContainEqual({
      event: 'set_name',
      args: ['Ada'],
    });
    expect(document.getElementById('chat-container').textContent).toContain(
      'Lin: Hello',
    );
  });
});
