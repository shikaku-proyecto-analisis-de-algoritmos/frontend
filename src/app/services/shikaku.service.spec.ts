import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ShikakuService } from './shikaku.service';

describe('ShikakuService', () => {
  let service: ShikakuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ShikakuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
