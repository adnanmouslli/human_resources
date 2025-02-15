import { TestBed } from '@angular/core/testing';

import { ColumnFilterService } from './column-filter.service';

describe('ColumnFilterService', () => {
  let service: ColumnFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
