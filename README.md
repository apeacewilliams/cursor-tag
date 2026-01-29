# Cursor Tag

A real-time multiplayer browser game where two players compete in a game of tag using their cursors.

## Tech Stack

- **Server:** Node.js, WebSockets (ws), TypeScript
- **Client:** Vanilla TypeScript, Canvas API, Vite
- **Shared:** TypeScript types and game configuration

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies (workspaces)
npm install
```

### Development

Run both server and client:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Server (ws://localhost:3001)
npm run dev:server

# Terminal 2 - Client (http://localhost:5173)
npm run dev:client
```

### How to Play

1. Open the client in your browser
2. Share the room link with a friend
3. One player is "it" (red) and chases the other (blue)
4. When tagged, roles swap
5. Each tag scores a point for the tagger
6. Highest score when time runs out wins

## Project Structure

```
cursor-tag/
├── client/           # Browser client
│   ├── src/
│   │   ├── main.ts         # Entry point
│   │   └── style.css       # Styles
│   ├── index.html
│   └── vite.config.ts
│
├── server/           # WebSocket server
│   └── index.ts            # Entry point
│
├── shared/           # Shared code
│   ├── types.ts            # Message & state types
│   ├── config.ts           # Game configuration
│   └── index.ts
│
└── package.json      # Workspace root
```

## Architecture

- **Server-authoritative:** Server is the source of truth for all game state
- **30hz tick rate:** Server broadcasts state 30 times per second
- **Client interpolation:** Client smooths movement between server updates
- **Room-based:** Each game runs in an isolated room with a shareable code
