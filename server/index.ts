import { WebSocketServer } from 'ws';
import { GAME_CONFIG } from '@cursor-tag/shared/config';

const PORT = process.env.PORT || 3001;

const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`🎮 Cursor Tag server running on ws://localhost:${PORT}`);
console.log(`   Tick rate: ${GAME_CONFIG.TICK_RATE}hz`);
console.log(`   Arena: ${GAME_CONFIG.ARENA_WIDTH}x${GAME_CONFIG.ARENA_HEIGHT}`);

wss.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (data) => {
    console.log('Received:', data.toString());
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});
