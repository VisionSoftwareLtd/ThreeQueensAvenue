import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PlayerListComponent } from './player-list/player-list.component';
import * as UrlConstants from './urlConstants.js';

const routes: Routes = [
  { path: '', redirectTo: UrlConstants.LOGIN, pathMatch: 'full' },
  { path: UrlConstants.LOGIN, component: LoginComponent },
  { path: UrlConstants.LOBBY, component: PlayerListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
