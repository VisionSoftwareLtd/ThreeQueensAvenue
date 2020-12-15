import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api-service.service';
import * as UrlConstants from '../urlConstants.js';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {

  players: string[];
  imageName: string;

  constructor(private apiService: ApiService, private router: Router) {
    this.players = [];
    this.imageName = 'P1010118.JPG';
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
}
