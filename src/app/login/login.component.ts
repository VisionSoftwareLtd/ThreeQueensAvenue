import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../api-service.service';
import { LocationPointer } from '../model/location-pointer';
import { environment } from '../../environments/environment';
import * as UrlConstants from '../constants/urlConstants.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = environment.production ? '' : 'Dave';
  subscription: Subscription;
  img = `${UrlConstants.IMAGES_ROOT}/PanRoad.jpg`;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
  }

  login(): void {
    console.log(`Logging in as ${this.username}`);
    var that = this;
    this.subscription = this.apiService.subscribe((data) => {
      var jsonData = JSON.parse(data);
      if (jsonData.status) {
        if (jsonData.status == 'Connected') {
          that.apiService.sendName(that.username);
          that.router.navigateByUrl(UrlConstants.LOBBY);
        }
      }
    });
    this.apiService.login();
  }

  onLocationClicked(locationPointer: LocationPointer) {
    if (!this.username || this.username.length < 2) {
      window.alert("Please enter a valid username");
      return;
    }
    this.login();
  }
}
