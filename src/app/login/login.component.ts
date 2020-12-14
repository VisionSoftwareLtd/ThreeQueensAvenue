import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../api-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  subscription: Subscription;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
  }

  login(): void {
    console.log(`Logging in as ${this.username}`);
    var that = this;
    this.subscription = this.apiService.subscribe((data) => {
      var jsonData = JSON.parse(data);
      if (jsonData.status) {
        if (jsonData.status == 'Connected') {
          this.apiService.sendName(that.username);
        }
      }
    });
    this.apiService.login();
  }
}
