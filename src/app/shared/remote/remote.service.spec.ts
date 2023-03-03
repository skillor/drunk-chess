import { TestBed } from '@angular/core/testing';

import { RemoteService } from './remote.service';

describe('RemoteService', () => {
  let service: RemoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
