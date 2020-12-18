import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Message } from './model/message';
import { Player } from './model/player';

import * as MessageConstants from './constants/messageTypeConstants.js';
import { LocationPointer } from './model/location-pointer';
import { ApiService } from './api-service.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private subject = new Subject();

  private players: Player[] = [];
  self: Player;

  constructor() {
  }

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

  getPlayerByName(username: string): Player {
    return this.players.find(player => player.name === username);
  }

  updatePlayerLocation(apiService: ApiService, locationPointer: LocationPointer) {
    if (this.self) {
      this.self.location = locationPointer.filename;
      apiService.updatePlayerLocation(this.self);
    } else {
      console.log('Self not defined when updating player location');
    }
  }
}
