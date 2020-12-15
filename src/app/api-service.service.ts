import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // private static API_URL: string = 'ws://localhost:8080';
  private static API_URL: string = environment.production ? 'ws://three-queens-avenue.herokuapp.com/:8080' : 'ws://localhost:8081';

  private subject = new Subject();
  private webSocket: WebSocket;
  private connected: boolean;
  
  constructor() {
    this.connected = false;
  }

  login() {
    this.webSocket = new WebSocket(ApiService.API_URL);
    const that = this;
    this.webSocket.onopen = function() {
      console.log('Connected');
      that.connected = true;
      that.subject.next(`{ "status" : "Connected" }`);
    }
    this.webSocket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      console.log("Message: " + JSON.stringify(data));
      that.subject.next(JSON.stringify(data));
    }
    this.webSocket.onclose = function() {
      console.log('Connection closed');
      that.connected = false;
      that.subject.next(`{ "status" : "Disconnected" }`);
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
