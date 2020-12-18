import * as GameNames from './gameNameConstants.js';

export interface Player {
  webSocketClient?: WebSocket;
  remoteAddress?: string;
  name: string;
  location: string;
  gameBeingPlayed: string;
}

export const DEFAULT_PLAYER: Player = {
  name: 'New player',
  location: 'PanHall.jpg',
  gameBeingPlayed: GameNames.GAME_EXPLORING
}