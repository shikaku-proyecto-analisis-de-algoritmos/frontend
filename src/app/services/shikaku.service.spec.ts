import { TestBed } from '@angular/core/testing';

import { ShikakuService } from './shikaku.service';

describe('ShikakuService', () => {
  let service: ShikakuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShikakuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
