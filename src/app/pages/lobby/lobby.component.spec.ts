import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioService } from 'src/app/shared/audio/audio.service';
import { GameService } from 'src/app/shared/game/game.service';
import { StockfishService } from 'src/app/shared/stockfish/stockfish.service';
import { RouterTestingModule } from "@angular/router/testing";
import { LobbyComponent } from './lobby.component';
import { RemoteService } from 'src/app/shared/remote/remote.service';

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LobbyComponent ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        GameService,
        StockfishService,
        AudioService,
        RemoteService,
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
