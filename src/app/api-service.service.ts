import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { environment } from './../environments/environment';
import { PlayerService } from './player.service';

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
      that.subject.next(`{ "status" : "Connected" }`);
    }
    this.webSocket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      console.log("Message received: " + JSON.stringify(data));
      that.processMessage(data);
    }
    this.webSocket.onclose = function() {
      console.log('Connection closed');
      that.connected = false;
      that.subject.next(`{ "status" : "Disconnected" }`);
    }
  }

  processMessage(data: any) {
    if (data.allPlayerDetails) {
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

  sendName(username: string) {
    if (this.connected) {
      this.webSocket.send(`{ "username" : "${username}" }`);
    } else {
      throw new Error('Not connected.');
    }
  }
}
