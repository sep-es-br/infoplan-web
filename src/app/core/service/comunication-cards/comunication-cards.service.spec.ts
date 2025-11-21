import { TestBed } from '@angular/core/testing';

import { ComunicationCardsService } from '../comunication-cards/comunication-cards.service';

describe('ComunicationCardsService', () => {
  let service: ComunicationCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComunicationCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
