import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Message } from './model/message';
import { Player } from './model/player';

import * as MessageConstants from './constants/messageConstants.js';
import { ThrowStmt } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private subject = new Subject();

  private players: Player[] = [];

  constructor() { }

  allPlayerDetailsUpdated(allPlayerDetails: any) {
    this.players = allPlayerDetails.map(playerData => {
      return {
        name: playerData.name,
        location: playerData.location,
        gameBeingPlayed: playerData.gameBeingPlayed
      }
    });
    const message: Message = {
      type: MessageConstants.ALL_PLAYERS_UPDATED,
      message: this.players
    }
    this.subject.next(message);
  }

  subscribe(subscribeFunction: any) : Subscription {
    return this.subject.subscribe(subscribeFunction);
  }

  getPlayersAtLocation(filename: string): Player[] {
    return this.players.filter(player => player.location === filename);
  }
}
