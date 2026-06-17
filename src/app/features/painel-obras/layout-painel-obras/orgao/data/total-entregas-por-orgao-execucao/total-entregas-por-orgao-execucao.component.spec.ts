import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEntregasPorOrgaoExecucaoComponent } from './total-entregas-por-orgao-execucao.component';

describe('TotalEntregasPorOrgaoExecucaoComponent', () => {
  let component: TotalEntregasPorOrgaoExecucaoComponent;
  let fixture: ComponentFixture<TotalEntregasPorOrgaoExecucaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEntregasPorOrgaoExecucaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalEntregasPorOrgaoExecucaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
