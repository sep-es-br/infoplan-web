import { TestBed } from '@angular/core/testing';

import { OrganizacaoGuardGuard } from './organizacao-guard.guard';

describe('OrganizacaoGuardGuard', () => {
  let guard: OrganizacaoGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OrganizacaoGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
