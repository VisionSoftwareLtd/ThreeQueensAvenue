import { Player } from './player.js';
import * as MessageTypeConstants from './messageTypeConstants.js';

export class PlayerManager {
  private players: Player[];

  private static instance: PlayerManager;
  private constructor() {
    this.players = [];
  }

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  addPlayer(player: Player): boolean {
    this.removePlayer(player.getRemoteAddress());
    if (!this.findPlayer(player.getRemoteAddress())) {
      console.log(`Adding player from remote address:${player.getRemoteAddress()}`)
      this.players.push(player);
      return true;
    } else {
      console.log(`Player from ${player.getRemoteAddress()} already logged in`);
      return false;
    }
  }

  removePlayer(remoteAddress: string) {
    const playerFound = this.findPlayer(remoteAddress);
    if (playerFound === undefined)
      return;
    playerFound.getWebSocketClient().send(`{ "${MessageTypeConstants.INFO}" : "Closing connection for ${playerFound.getName()} from ${playerFound.getRemoteAddress()}" }`)
    playerFound.getWebSocketClient().close();
    const index = this.players.indexOf(playerFound);
    if (index == -1)
      return;
    this.players.splice(index, 1);
  }

  getPlayers() {
    return this.players;
  }

  findPlayer(remoteAddress: string): Player {
    return this.players.find(player => player.getRemoteAddress() == remoteAddress);
  }

  updateAllPlayers(message: string) {
    console.log(`Sending message to ${this.players.length} players:\n${message}`)
    this.players.forEach(player => {
      player.getWebSocketClient().send(message);
    });
  }
}