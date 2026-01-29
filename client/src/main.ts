import { GAME_CONFIG } from "@cursor-tag/shared/config";

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Set canvas size
canvas.width = GAME_CONFIG.ARENA_WIDTH;
canvas.height = GAME_CONFIG.ARENA_HEIGHT;

// Draw placeholder
ctx.fillStyle = '#12121a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#333';
ctx.font = '16px Inter, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Connecting...', canvas.width / 2, canvas.height / 2);

console.log('🎮 Cursor Tag client loaded');
console.log(`   Arena: ${GAME_CONFIG.ARENA_WIDTH}x${GAME_CONFIG.ARENA_HEIGHT}`);
