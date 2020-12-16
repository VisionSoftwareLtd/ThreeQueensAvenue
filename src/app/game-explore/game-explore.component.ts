import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api-service.service';
import { LocationPointer } from '../model/location-pointer';
import * as UrlConstants from '../urlConstants.js';

@Component({
  selector: 'app-game-explore',
  templateUrl: './game-explore.component.html',
  styleUrls: ['./game-explore.component.css']
})
export class GameExploreComponent implements OnInit {

  img: string = `${UrlConstants.IMAGES_ROOT}/P1010119.JPG`;
  players: string[];

  constructor(private apiService: ApiService, private router: Router) {
    this.players = [];
  }

  ngOnInit(): void {
    if (!this.apiService.isConnected()) {
      this.router.navigateByUrl(UrlConstants.LOGIN);
      return;
    }
    const that = this;
    this.apiService.subscribe((data) => {
      console.log(`API Service sent data: ${JSON.stringify(data)}`);
      var jsonData = JSON.parse(data);
      if (jsonData.playerNames) {
        that.players = jsonData.playerNames;
      }
    });
  }

  getPlayers(): string[] {
    return this.players;
  }

  onLocationClicked(locationPointer: LocationPointer) {
    this.img = `${UrlConstants.IMAGES_ROOT}${locationPointer.filename}`;
  }
}
