import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioService } from 'src/app/shared/audio/audio.service';
import { GameService } from 'src/app/shared/game/game.service';
import { StockfishService } from 'src/app/shared/stockfish/stockfish.service';

import { PlayComponent } from './play.component';


describe('PlayComponent', () => {
  let component: PlayComponent;
  let fixture: ComponentFixture<PlayComponent>;

  beforeEach(async () => {
    const jQuerySpy = (...args: any) => {
      return jQuerySpy;
    };
    jQuerySpy.find = jQuerySpy;
    jQuerySpy.hover = jQuerySpy;
    await TestBed.configureTestingModule({
      declarations: [ PlayComponent ],
      providers: [
        { provide: 'Chessboard', useValue: () => ({}) },
        { provide: '$', useValue: jQuerySpy},
        GameService,
        StockfishService,
        AudioService,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
