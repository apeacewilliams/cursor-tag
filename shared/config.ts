// ============================================
// Game Configuration
// ============================================

export const GAME_CONFIG = {
  // Arena dimensions
  ARENA_WIDTH: 800,
  ARENA_HEIGHT: 500,

  // Player settings
  PLAYER_RADIUS: 18,
  TAG_RADIUS: 36, // Combined radius for collision (PLAYER_RADIUS * 2)
  TAG_IMMUNITY_MS: 500, // Brief immunity after being tagged

  // Timing
  TICK_RATE: 30, // Server ticks per second
  TICK_INTERVAL: 1000 / 30, // ~33ms
  ROUND_DURATION: 120, // Seconds per round
  COUNTDOWN_SECONDS: 3,

  // Network
  CLIENT_SEND_RATE: 30, // Client input sends per second
  CLIENT_SEND_INTERVAL: 1000 / 30, // ~33ms

  // Room settings
  ROOM_CODE_LENGTH: 4,
  MAX_PLAYERS: 2,
} as const;

// ============================================
// Derived Constants
// ============================================

export const COLLISION_DISTANCE_SQUARED =
  GAME_CONFIG.TAG_RADIUS * GAME_CONFIG.TAG_RADIUS;
