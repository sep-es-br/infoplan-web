import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTotalAnoSigefesComponent } from './grafico-total-ano-sigefes.component';

describe('GraficoTotalAnoSigefesComponent', () => {
  let component: GraficoTotalAnoSigefesComponent;
  let fixture: ComponentFixture<GraficoTotalAnoSigefesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraficoTotalAnoSigefesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTotalAnoSigefesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
