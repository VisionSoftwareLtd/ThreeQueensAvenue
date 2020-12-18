import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { environment } from './../environments/environment';
import { PlayerService } from './player.service';

import * as MessageTypeConstants from './constants/messageTypeConstants.js';
import { Player } from './model/player';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private static API_URL: string = environment.production ? 'ws://three-queens-avenue.herokuapp.com/:8080' : 'ws://localhost:8081';

  private subject = new Subject();
  private webSocket: WebSocket;
  private connected: boolean;
  
  constructor(private playerService: PlayerService) {
    this.connected = false;
  }

  login(): void {
    console.log('Login request');
    this.webSocket = new WebSocket(ApiService.API_URL);
    const that = this;
    this.webSocket.onopen = function() {
      console.log('Connected');
      that.connected = true;
      that.subject.next(`{ "${MessageTypeConstants.STATUS}" : "Connected" }`);
    }
    this.webSocket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      console.log("Message received: " + JSON.stringify(data));
      that.processMessage(data);
    }
    this.webSocket.onclose = function() {
      console.log('Connection closed');
      that.connected = false;
      that.subject.next(`{ "${MessageTypeConstants.STATUS}" : "Disconnected" }`);
    }
  }

  processMessage(data: any) {
    if (data.status) {
      this.subject.next(`{ "${MessageTypeConstants.STATUS}" : "${data.status}" }`);
    } else if (data.error) {
      alert(data.error);
    } else if (data.allPlayerDetails) {
      this.playerService.allPlayerDetailsUpdated(data.allPlayerDetails);
    }
  }

  isConnected() {
    return this.connected;
  }

  logout() {
    this.webSocket.close();
  }

  subscribe(subscribeFunction: any) : Subscription {
    return this.subject.subscribe(subscribeFunction);
  }

  sendIfConnected(message: string) {
    if (this.connected) {
      this.webSocket.send(message);
    } else {
      throw new Error('Not connected.');
    }
  }

  sendName(username: string) {
    this.sendIfConnected(`{ "${MessageTypeConstants.USERNAME}" : "${username}" }`);
  }

  updatePlayerLocation(player: Player) {
    this.sendIfConnected(`{ "${MessageTypeConstants.PLAYER_LOCATION_UPDATED}" : {"player":"${player.name}","location":"${player.location}"} }`);
  }
}
