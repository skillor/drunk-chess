import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PlayComponent } from './pages/play/play.component';
import { GameService } from './shared/game/game.service';
import { StockfishService } from './shared/stockfish/stockfish.service';
import { FormsModule } from '@angular/forms';
import { RemoteService } from './shared/remote/remote.service';
import { LobbyComponent } from './pages/lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayComponent,
    LobbyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    GameService,
    StockfishService,
    RemoteService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
