import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumeroEntregasPorMunicipioStatusComponent } from './numero-entregas-por-municipio-status.component';

describe('NumeroEntregasPorMunicipioStatusComponent', () => {
  let component: NumeroEntregasPorMunicipioStatusComponent;
  let fixture: ComponentFixture<NumeroEntregasPorMunicipioStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumeroEntregasPorMunicipioStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumeroEntregasPorMunicipioStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
