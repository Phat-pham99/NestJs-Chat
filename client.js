// client.js
import io from 'socket.io-client';
import readline from 'readline';
import terminalImage from 'terminal-image';

const socket = io('http://localhost:3000'); // Replace with your server URL

let clientName = ''; // Store the chosen client name

socket.on('connect', () => {
  console.log('Connected to server!');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter your desired name', (name) => {
    clientName = name.trim();
    socket.emit('set_name', clientName);
    console.log(`Your chosen name is: ${clientName}`);
    startMessaging(rl);
  });
});

function startMessaging(rl) {
  const promptInput = () => {
    rl.question('', (message) => {
      socket.emit('message', { message: message }); // Send only the message
      promptInput();
    });
  };
  promptInput();
}

socket.on('message', (data) => {
  console.log(`${data.name}: ${data.message}`); // Display colored name with message
});

socket.on('image', async (data) => {
  try {
    console.log(await terminalImage.buffer(data.message.data.buffer, { width: '100%' }));
  } catch (error) {
    console.error('Error displaying image:', error);
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.log(`connect_error due to ${err.message}`);
});
