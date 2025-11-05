import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaParticipacaoComponent } from './receita-participacao.component';

describe('ReceitaParticipacaoComponent', () => {
  let component: ReceitaParticipacaoComponent;
  let fixture: ComponentFixture<ReceitaParticipacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaParticipacaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaParticipacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
