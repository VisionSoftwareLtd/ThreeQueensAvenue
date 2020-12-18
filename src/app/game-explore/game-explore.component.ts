import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api-service.service';
import { LocationPointer } from '../model/location-pointer';
import { PlayerService } from '../player.service';

import * as UrlConstants from '../constants/urlConstants.js';
import * as MessageConstants from '../constants/messageConstants.js';
import { Player } from '../model/player';

@Component({
  selector: 'app-game-explore',
  templateUrl: './game-explore.component.html',
  styleUrls: ['./game-explore.component.css']
})
export class GameExploreComponent implements OnInit {

  img: string = `${UrlConstants.IMAGES_ROOT}/SingleFrontDoor.jpg`;
  players: string[];

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
    this.players = playerDetails.map((player => player.name));
  }

  getPlayers(): string[] {
    return this.players;
  }

  @ViewChild('panImageViewer') panImageViewer;
  onLocationClicked(locationPointer: LocationPointer) {
    this.panImageViewer.updateImage(`${UrlConstants.IMAGES_ROOT}/${locationPointer.filename}`, locationPointer.newBgPosX);
  }

  getWindowHeight() {
    return window.innerHeight;
  }
}
