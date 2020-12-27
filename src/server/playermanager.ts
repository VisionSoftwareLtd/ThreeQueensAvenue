import { Player } from './player.js';
import * as MessageTypeConstants from '../app/constants/messageTypeConstants.js';

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
    this.removePlayer(player.remoteAddress);
    if (!this.findPlayer(player.remoteAddress)) {
      console.log(`Adding player from remote address:${player.remoteAddress}`)
      this.players.push(player);
      return true;
    } else {
      console.log(`Player from ${player.remoteAddress} already logged in`);
      return false;
    }
  }

  removePlayer(remoteAddress: string) {
    const playerFound = this.findPlayer(remoteAddress);
    console.log(`Removing player ${playerFound?.name} from ${remoteAddress}`);
    if (playerFound === undefined)
      return;
    playerFound.webSocketClient?.send(`{ "${MessageTypeConstants.INFO}" : "Closing connection for ${playerFound.name} from ${playerFound.remoteAddress}" }`)
    playerFound.webSocketClient?.close();
    const index = this.players.indexOf(playerFound);
    if (index == -1)
      return;
    this.players.splice(index, 1);
  }

  getPlayers() {
    return this.players;
  }

  findPlayer(remoteAddress: string): Player {
    return this.players.find(player => player.remoteAddress == remoteAddress);
  }

  updateAllPlayers(message: string) {
    console.log(`Sending message to ${this.players.length} players:\n${message}`);
    this.players.forEach(player => {
      player.webSocketClient?.send(message);
    });
  }
  
  updateAllPlayerDetails() {
    var playerDetailsMinimised = PlayerManager.getInstance().getPlayers().map(player => {
      return {
        name: player.name,
        location: player.location,
        gameBeingPlayed: player.gameBeingPlayed
      }
    });
    PlayerManager.getInstance().updateAllPlayers(`{ "${MessageTypeConstants.ALL_PLAYER_DETAILS}" : ${JSON.stringify(playerDetailsMinimised)} }`);
  }

  usernameAlreadyExists(username: string): boolean {
    return this.players.find(player => player.name === username) != undefined;
  }

  updatePlayerLocation(playerLocationUpdate: any) {
    const player = this.players.find(player => player.name == playerLocationUpdate.player);
    if (player) {
      console.log(`Player location update: ${playerLocationUpdate.player} moved to ${playerLocationUpdate.location}`);
      player.location = playerLocationUpdate.location;
      this.updateAllPlayerDetails();
    } else {
      console.log(`Couldn't find player: ${playerLocationUpdate.player} when trying to move to ${playerLocationUpdate.location}`);
    }
  }
}