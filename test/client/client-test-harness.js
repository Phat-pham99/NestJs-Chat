const fs = require('node:fs');
const path = require('node:path');
const { TextDecoder, TextEncoder } = require('node:util');

global.TextDecoder ??= TextDecoder;
global.TextEncoder ??= TextEncoder;

const { JSDOM } = require('jsdom');

const clientDirectory = path.resolve(__dirname, '../../client');

function createSocket() {
  const emitted = [];
  const listeners = new Map();

  return {
    emitted,
    on(event, listener) {
      listeners.set(event, listener);
      return this;
    },
    emit(event, ...args) {
      emitted.push({ event, args });
      return this;
    },
    trigger(event, ...args) {
      const listener = listeners.get(event);

      if (listener) {
        listener(...args);
      }
    },
  };
}

function loadClient(options = {}) {
  const html = fs.readFileSync(path.join(clientDirectory, 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(clientDirectory, 'index.js'), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: options.url || 'http://localhost:3000',
  });
  const socket = createSocket();

  dom.window.io = jest.fn(() => socket);
  dom.window.fetch = jest.fn();
  dom.window.alert = jest.fn();
  dom.window.URL.createObjectURL = jest.fn(() => 'blob:mock-image');
  dom.window.URL.revokeObjectURL = jest.fn();
  dom.window.eval(script);

  return {
    document: dom.window.document,
    fetch: dom.window.fetch,
    socket,
    window: dom.window,
  };
}

module.exports = { createSocket, loadClient };
