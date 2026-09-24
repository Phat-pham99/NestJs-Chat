<div align="center">

# 💬 NestJS Chat

**A real-time chat application built with NestJS and Socket.IO**

Real-time messaging · Join/leave events · Image sharing · Zero-setup client UI

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-first-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

</div>

---

## ✨ Features

- ⚡ **Real-time messaging** — instant, low-latency chat over WebSockets
- 👋 **Join / leave notifications** — the server broadcasts when a user connects or disconnects
- 🖼️ **Image sharing** — upload an image and broadcast it to every connected client
- 🧑‍🤝‍🧑 **Per-client identities** — every connection gets a name that follows their messages
- 📦 **Built-in client** — a static web UI is served straight from the NestJS app, no separate frontend needed
- 🔒 **CORS enabled** — ready to talk to any client, while you can tighten origin rules in production

## 🧱 Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| **Runtime**| Node.js / Bun                            |
| **Backend**| NestJS (WebSockets, REST)               |
| **Realtime**| Socket.IO (platform-socket.io)          |
| **Static**  | @nestjs/serve-static                     |
| **Language**| TypeScript                              |

## 📁 Project Structure

```
src/
├── main.ts                     # App bootstrap, CORS, port (default 3000)
├── app.module.ts              # Root module wiring
├── common/
│   ├── enums/
│   │   └── message-type.enum.ts  # message/join/leave/image event types
│   └── interfaces/
│       └── index.ts              # message payload interface
├── chat/
│   ├── chat.gateway.ts        # Socket.IO gateway — the realtime engine
│   ├── chat.controller.ts
│   └── chat.module.ts
└── images/
    ├── images.controller.ts   # POST /images/upload (multipart)
    ├── images.service.ts
    └── images.module.ts

client/                        # Static web UI served at /
├── index.html
├── index.js                   # Socket.IO client logic
└── index.css
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **18+** or [Bun](https://bun.sh)
- A package manager: `bun`, `npm`, or `yarn`

### Install

```bash
# with Bun (recommended)
bun install

# or with npm / yarn
npm install
yarn install
```

### Run (development)

```bash
bun run start:dev
# or: npm run start:dev  /  yarn start:dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Run (production)

```bash
# build then start
bun run build
bun run start:prod
```

## ⚙️ How It Works

1. The NestJS app boots on **port 3000** (or `$PORT`).
2. The **ChatGateway** opens a Socket.IO connection and tracks clients in an in-memory map.
3. Clients can `set_name`, send `message`, and the server forwards everything to all clients.
4. Uploading an image through `POST /images/upload` triggers the gateway to broadcast it as an `image` event.
5. The built-in web client in `client/` is served automatically at the root URL.

## 🔌 Events

| Event       | Direction          | Payload                              |
| ----------- | ------------------ | ------------------------------------ |
| `set_name`  | client → server    | `string` (user name)                 |
| `message`   | client ↔ server    | `{ name, message }`                  |
| `image`     | server → client    | `{ name, type: 'image', message }`   |
| `connect` / `disconnect` | auto      | join / leave broadcasts              |

## 🌍 REST Endpoints

| Method | URL               | Description                          |
| ------ | ----------------- | ------------------------------------ |
| `POST` | `/images/upload`  | Upload an image, broadcast to all    |

## 🧪 Scripts

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `bun run start:dev`  | Run with hot-reload             |
| `bun run start:prod` | Run the compiled production build |
| `bun run build`      | Compile the project             |
| `bun run lint`       | Lint and auto-fix               |
| `bun run format`     | Prettier format the code        |
| `bun run test`       | Run unit tests                  |
| `bun run test:cov`   | Run tests with coverage         |
| `bun run test:e2e`   | Run end-to-end tests            |

## 🗂️ Docker

Run the app in a container:

```bash
docker build -t nestjs-chat .
docker run -p 3000:3000 nestjs-chat
```

## 📄 License

Distributed under the [UNLICENSED](./LICENSE) license. See `package.json` for details.

---

<div align="center">
  <sub>Built with ❤️ using NestJS, Socket.IO & TypeScript</sub>
</div>
