import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEntregasPorOrgaoComponent } from './total-entregas-por-orgao.component';

describe('TotalEntregasPorOrgaoComponent', () => {
  let component: TotalEntregasPorOrgaoComponent;
  let fixture: ComponentFixture<TotalEntregasPorOrgaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEntregasPorOrgaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalEntregasPorOrgaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
