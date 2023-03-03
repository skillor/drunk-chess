import { TestBed } from '@angular/core/testing';

import { StockfishService } from './stockfish.service';

describe('StockfishService', () => {
  let service: StockfishService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockfishService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
