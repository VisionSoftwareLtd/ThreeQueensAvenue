import * as GameNames from './gameNameConstants.js';

export class Player {
  static DEFAULT_NAME: string = 'Unknown player';

  private webSocketClient: WebSocket;
  private name: string;
  private location: string;
  private gameBeingPlayed: string;
  private remoteAddress: string;

  constructor(remoteAddress: string, webSocketClient : WebSocket) {
    this.remoteAddress = remoteAddress;
    this.webSocketClient = webSocketClient;
    this.name = Player.DEFAULT_NAME;
    this.gameBeingPlayed = GameNames.GAME_LOBBY;
    this.location = 'Lobby';
  }

  getName() {
    return this.name;
  }

  setName(username: string) {
    this.name = username;
  }

  getGameBeingPlayed() {
    return this.gameBeingPlayed;
  }

  getRemoteAddress() {
    return this.remoteAddress;
  }

  setLocation(location: string) {
    this.location = location;
  }

  getLocation() {
    return this.location;
  }

  getWebSocketClient() {
    return this.webSocketClient;
  }
}