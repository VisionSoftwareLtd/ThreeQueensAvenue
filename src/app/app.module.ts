import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { GameExploreComponent } from './game-explore/game-explore.component';
import { AppRoutingModule } from './app-routing.module';
import { PanImageViewerComponent } from './pan-image-viewer/pan-image-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GameExploreComponent,
    PanImageViewerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
