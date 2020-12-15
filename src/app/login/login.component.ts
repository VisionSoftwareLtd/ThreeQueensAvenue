import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../api-service.service';
import * as UrlConstants from '../urlConstants.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  subscription: Subscription;

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
}
