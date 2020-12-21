import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api-service.service';
import { LocationPointer } from '../model/location-pointer';
import { PlayerService } from '../player.service';

import * as UrlConstants from '../constants/urlConstants.js';
import * as MessageConstants from '../constants/messageTypeConstants.js';
import { Player } from '../model/player';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-explore',
  templateUrl: './game-explore.component.html',
  styleUrls: ['./game-explore.component.css']
})
export class GameExploreComponent implements OnInit {

  private static LOCATION_PREFIXES = ['Single', 'Pan', 'Point'];

  img: string = `${UrlConstants.IMAGES_ROOT}/SingleFrontDoor.jpg`;
  players: Player[];
  subscription: Subscription;

  constructor(private apiService: ApiService, private playerService: PlayerService, private router: Router) {
    this.players = [];
  }

  ngOnInit(): void {
    if (!this.apiService.isConnected()) {
      this.router.navigateByUrl(UrlConstants.LOGIN);
      return;
    }
    const that = this;
    this.playerService.subscribe((data) => {
      if (data.type == MessageConstants.ALL_PLAYERS_UPDATED) {
        that.updateAllPlayers(data.message);
      }
    });
  }

  updateAllPlayers(playerDetails: Player[]) {
    this.players = playerDetails;
  }

  getAllPlayers(): string[] {
    return this.players.map(player => player.name).sort();
  }

  getCurrentLocation(): string {
    return this.playerService.self.location;
  }

  showCurrentLocation(): string {
    const currentLocation:string = this.getCurrentLocation().replace('.jpg','');
    for (const prefix of GameExploreComponent.LOCATION_PREFIXES) {
      if (currentLocation.startsWith(prefix))
        return currentLocation.substring(prefix.length);
    }
    return currentLocation;
  }

  getPlayersAtCurrentLocation(): string[] {
    return this.players.filter(player => player.location == this.getCurrentLocation()).map(player => player.name).sort();
  }

  showPlayersAtCurrentLocation(): string {
    return `${this.getPlayersAtCurrentLocation().join(", ")}`;
  }

  @ViewChild('panImageViewer') panImageViewer;
  onLocationClicked(locationPointer: LocationPointer) {
    if (this.apiService.isConnected()) {
      this.playerService.updatePlayerLocation(this.apiService, locationPointer);
      this.panImageViewer.updateImage(`${UrlConstants.IMAGES_ROOT}/${locationPointer.filename}`, locationPointer.newBgPosX);
    } else {
      this.attemptReconnectAndMove(locationPointer);
    }
  }

  attemptReconnectAndMove(locationPointer: LocationPointer) {
    if (this.playerService.self?.name) {
      const username = this.playerService.self?.name;
      console.log(`Attempting reconnection as ${username}`);
      var that = this;
      this.subscription = this.apiService.subscribe((data) => {
        var jsonData = JSON.parse(data);
        if (jsonData.status === 'Connected') {
          that.apiService.sendName(username);
        } else if (jsonData.status === 'UsernameAccepted') {
          console.log(`Username accepted: ${username}`);
          that.playerService.self = that.playerService.getPlayerByName(username);
          that.apiService.updatePlayerLocation(that.playerService.self);
          that.subscription.unsubscribe();
          that.playerService.updatePlayerLocation(that.apiService, locationPointer);
          that.panImageViewer.updateImage(`${UrlConstants.IMAGES_ROOT}/${locationPointer.filename}`, locationPointer.newBgPosX);
         }
      });
      this.apiService.login();
    } else {
      throw Error("Couldn't reconnect");
    }
  }

  getWindowHeight() {
    return window.innerHeight;
  }

  isAtFrontDoor() {
    return this.getCurrentLocation() === 'SingleFrontDoor.jpg';
  }
}
