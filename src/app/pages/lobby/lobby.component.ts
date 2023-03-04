import { Component, NgZone, OnDestroy, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AudioService } from 'src/app/shared/audio/audio.service';
import { GameController } from 'src/app/shared/game/game.controller';
import { GameService } from 'src/app/shared/game/game.service';
import { PlayerClientController } from 'src/app/shared/game/player-client.controller';
import { PlayerHostController } from 'src/app/shared/game/player-host.controller';
import { WaitClientController } from 'src/app/shared/game/wait-client.controller';
import { WaitHostController } from 'src/app/shared/game/wait-host.controller';
import { RemoteService } from 'src/app/shared/remote/remote.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnDestroy {
  lobbyId?: string;
  sendSettings = false;
  routeSub: Subscription;

  copyHref(): void {
    const input = document.createElement('input');
    input.setAttribute('value', this.getHref());
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  getHref(): string {
    return window.location.href;
  }

  constructor(
    private router: Router,
    route: ActivatedRoute,
    public gameService: GameService,
    public remoteService: RemoteService,
    private audioService: AudioService,
    private zone: NgZone,
  ) {
    this.routeSub = route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (!id) {
        return this.createNewLobby();
      }
      if (!this.remoteService.hasPeer()) {
        try {
          await this.remoteService.connectToPeer(id, {
            // reliable: true,
          });
          this.lobbyId = id;
          this.remoteService.on('settings', (settings, conn, id) => {
            this.gameService.settings = settings;
            this.remoteService.send(conn, 'settings', true, id);
          });
          this.remoteService.on('start', (white) => {
            if (white) {
              this.gameService.gameController = new GameController(
                new PlayerClientController(this.remoteService, this.gameService, this.audioService),
                new WaitClientController(this.remoteService, this.gameService, this.audioService),
                'w',
              );
            } else {
              this.gameService.gameController = new GameController(
                new WaitClientController(this.remoteService, this.gameService, this.audioService),
                new PlayerClientController(this.remoteService, this.gameService, this.audioService),
                'b',
              );
            }
            this.play();
          });
          return;
        } catch {
          return this.createNewLobby(id);
        }
      }
      this.lobbyId = id;
    });
  }

  async createNewLobby(id?: string) {
    const peer = await this.remoteService.getPeer(id);
    this.router.navigate(['lobby', peer.id]);
    this.lobbyId = peer.id;
    this.sendSettings = true;
    this.broadcastSettings();
  }

  async broadcastSettings() {
    while (this.sendSettings) {
      try {
        await this.remoteService.waitForResponse('settings', this.gameService.settings);
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  ngOnDestroy(): void {
    this.sendSettings = false;
    this.routeSub.unsubscribe();
  }

  playVsPeer() {
    const meWhite = Math.random() > 0.5;
    if (meWhite) {
      this.gameService.gameController = new GameController(
        new PlayerHostController(this.remoteService, this.gameService, this.audioService),
        new WaitHostController(this.remoteService, this.gameService, this.audioService),
        'w',
      );
    } else {
      this.gameService.gameController = new GameController(
        new WaitHostController(this.remoteService, this.gameService, this.audioService),
        new PlayerHostController(this.remoteService, this.gameService, this.audioService),
        'b',
      );
    }
    this.remoteService.broadcast('start', !meWhite);
    this.play();
  }

  play() {
    this.gameService.saveSettings();
    this.zone.run(() => this.router.navigate(['play', this.lobbyId]));
  }
}
