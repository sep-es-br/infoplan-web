import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelOrcamentoComponent } from './painel-orcamento.component';

describe('PainelOrcamentoComponent', () => {
  let component: PainelOrcamentoComponent;
  let fixture: ComponentFixture<PainelOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainelOrcamentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
