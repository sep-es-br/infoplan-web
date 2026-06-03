import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEntregasPorAnoEStatusComponent } from './total-entregas-por-ano-e-status.component';

describe('TotalEntregasPorAnoEStatusComponent', () => {
  let component: TotalEntregasPorAnoEStatusComponent;
  let fixture: ComponentFixture<TotalEntregasPorAnoEStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEntregasPorAnoEStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalEntregasPorAnoEStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
