const serverUrl = 'http://localhost:3000'
const socket = io(serverUrl);
let clientName = "";

const chatContainer = document.getElementById("chat-container");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send-btn");
const nameOverlay = document.getElementById("name-overlay");
const nameInput = document.getElementById("name-input");
const nameBtn = document.getElementById("name-btn");

async function upload() {
  const fileInput = document.getElementById('fileInput');

  if (fileInput.files.length === 0) {
    alert("Please select a file first");
    return;
  }
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  try {
    const response = await fetch(`${serverUrl}/images/upload`, {
      method: 'POST',
      body: formData,
      // IMPORTANT: Do NOT manually set 'Content-Type' header.
      // The browser will automatically set it with the correct "boundary".
    });

    const result = await response.json();
    fileInput.value = "";
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

function displaySelfMessage(message, chatContainer){
  const div = document.createElement("div");
  div.innerHTML = `<strong>Me:</strong> ${message}`;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Set name and join chat
nameBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) return;
  clientName = name;
  socket.emit("set_name", clientName);
  nameOverlay.style.display = "none";
});

// Sending message
sendBtn.addEventListener("click", () => {
  const message = msgInput.value.trim();
  if (!message) return;
  socket.emit("message", { message });
  msgInput.value = "";
  displaySelfMessage(message, chatContainer);
});

// Send on Enter key
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// Display incoming messages
socket.on("message", (data) => {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${data.name}:</strong> ${data.message}`;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on("disconnect", () => {
  const div = document.createElement("div");
  div.style.color = "red";
  div.textContent = "Disconnected from server";
  chatContainer.appendChild(div);
});

socket.on("image", (data) => {
  // console.log('image - data', data);
  // 1. Create the Blob from the incoming binary data
  // Using data.buffer if 'data' is a typed array, otherwise just [data]
  const blob = new Blob([data.buffer || data.message.data.buffer], { type: "image/jpeg" });
  const imageUrl = URL.createObjectURL(blob);

  // 2. Efficiently create the elements
  const div = document.createElement("div");
  div.className = "chat-image-message"; // Useful for CSS styling

  const img = document.createElement("img");
  img.src = imageUrl;
  img.width = 500;
  img.height = 600;
  img.style.display = "block"; // Prevents bottom whitespace

  // 3. Handle Memory Management
  // IMPORTANT: Only revoke AFTER the image is fully visible
  img.onload = () => {
    URL.revokeObjectURL(imageUrl);
  };
  div.appendChild(img);
  chatContainer.appendChild(div);
  // 4. Auto-scroll to bottom (optional but standard for chat)
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});