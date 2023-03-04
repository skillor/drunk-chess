import { TestBed } from '@angular/core/testing';
import { AudioService } from '../audio/audio.service';
import { StockfishService } from '../stockfish/stockfish.service';

import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        StockfishService,
        AudioService,
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
