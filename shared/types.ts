// ============================================
// Player & Game State
// ============================================

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
}

export interface GameState {
  players: Player[];
  whoIsIt: string;
  timeRemaining: number;
  status: 'waiting' | 'countdown' | 'playing' | 'ended';
}

export interface RoomInfo {
  roomCode: string;
  arenaWidth: number;
  arenaHeight: number;
}

// ============================================
// Client → Server Messages
// ============================================

export type ClientMessage =
  | { type: 'join'; payload: JoinPayload }
  | { type: 'input'; payload: InputPayload }
  | { type: 'rematch'; payload: Record<string, never> };

export interface JoinPayload {
  name?: string;
  roomCode?: string; // If provided, join existing room; otherwise create new
}

export interface InputPayload {
  x: number;
  y: number;
}

// ============================================
// Server → Client Messages
// ============================================

export type ServerMessage =
  | { type: 'init'; payload: InitPayload }
  | { type: 'state'; payload: StatePayload }
  | { type: 'tag'; payload: TagPayload }
  | { type: 'player_joined'; payload: PlayerJoinedPayload }
  | { type: 'player_left'; payload: PlayerLeftPayload }
  | { type: 'countdown'; payload: CountdownPayload }
  | { type: 'game_over'; payload: GameOverPayload }
  | { type: 'error'; payload: ErrorPayload };

export interface InitPayload {
  playerId: string;
  roomCode: string;
  arenaWidth: number;
  arenaHeight: number;
  players: Player[];
  whoIsIt: string | null;
  status: GameState['status'];
}

export interface StatePayload {
  players: Player[];
  whoIsIt: string;
  timeRemaining: number;
}

export interface TagPayload {
  tagger: string;
  tagged: string;
  newScores: Record<string, number>;
}

export interface PlayerJoinedPayload {
  player: Player;
}

export interface PlayerLeftPayload {
  playerId: string;
}

export interface CountdownPayload {
  count: number; // 3, 2, 1, 0 (0 = start)
}

export interface GameOverPayload {
  winner: string;
  finalScores: Record<string, number>;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// ============================================
// Message Type Constants
// ============================================

export const CLIENT_MESSAGES = {
  JOIN: 'join',
  INPUT: 'input',
  REMATCH: 'rematch',
} as const;

export const SERVER_MESSAGES = {
  INIT: 'init',
  STATE: 'state',
  TAG: 'tag',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  COUNTDOWN: 'countdown',
  GAME_OVER: 'game_over',
  ERROR: 'error',
} as const;
