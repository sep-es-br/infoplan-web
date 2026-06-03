import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhamentoEntregasStatusSelecionadoComponent } from './detalhamento-entregas-status-selecionado.component';

describe('DetalhamentoEntregasStatusSelecionadoComponent', () => {
  let component: DetalhamentoEntregasStatusSelecionadoComponent;
  let fixture: ComponentFixture<DetalhamentoEntregasStatusSelecionadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalhamentoEntregasStatusSelecionadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalhamentoEntregasStatusSelecionadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
