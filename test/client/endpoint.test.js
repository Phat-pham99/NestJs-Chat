const { loadClient } = require('./client-test-harness');

describe('browser endpoint', () => {
  it.each([
    ['http://localhost:3000', 'http://localhost:3000'],
    ['https://chat.example.test', 'https://chat.example.test'],
  ])('connects to the page origin at %s', (url, expectedOrigin) => {
    const { window } = loadClient({ url });

    expect(window.io).toHaveBeenCalledWith(expectedOrigin);
  });

  it('loads the Socket.IO client from the application origin', () => {
    const { document } = loadClient();
    const socketClient = document.querySelector(
      'script[src="/socket.io/socket.io.js"]',
    );

    expect(socketClient).not.toBeNull();
  });

  it('uploads images to the page origin', async () => {
    const { document, fetch, window } = loadClient({
      url: 'https://chat.example.test',
    });
    const fileInput = document.getElementById('fileInput');
    const file = new window.File(['image'], 'image.png', {
      type: 'image/png',
    });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fetch.mockResolvedValue({ json: jest.fn().mockResolvedValue({}) });

    await window.upload();

    expect(fetch).toHaveBeenCalledWith(
      'https://chat.example.test/images/upload',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
