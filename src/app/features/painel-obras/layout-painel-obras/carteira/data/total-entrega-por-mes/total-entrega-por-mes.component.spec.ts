import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEntregaPorMesComponent } from './total-entrega-por-mes.component';

describe('TotalEntregaPorMesComponent', () => {
  let component: TotalEntregaPorMesComponent;
  let fixture: ComponentFixture<TotalEntregaPorMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEntregaPorMesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalEntregaPorMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
