import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEntregasPorMunicipioStatusComponent } from './total-entregas-por-municipio-status.component';

describe('TotalEntregasPorMunicipioStatusComponent', () => {
  let component: TotalEntregasPorMunicipioStatusComponent;
  let fixture: ComponentFixture<TotalEntregasPorMunicipioStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEntregasPorMunicipioStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalEntregasPorMunicipioStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
