import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaTransferenciaComponent } from './receita-transferencia.component';

describe('ReceitaTransferenciaComponent', () => {
  let component: ReceitaTransferenciaComponent;
  let fixture: ComponentFixture<ReceitaTransferenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaTransferenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaTransferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
