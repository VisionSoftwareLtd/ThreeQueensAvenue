import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api-service.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {

  players: string[];

  constructor(private apiService: ApiService) {
    this.players = [];
  }

  ngOnInit(): void {
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
