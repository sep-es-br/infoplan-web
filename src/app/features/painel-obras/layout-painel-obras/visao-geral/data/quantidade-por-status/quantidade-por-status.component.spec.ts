import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantidadePorStatusComponent } from './quantidade-por-status.component';

describe('QuantidadePorStatusComponent', () => {
  let component: QuantidadePorStatusComponent;
  let fixture: ComponentFixture<QuantidadePorStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantidadePorStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantidadePorStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
