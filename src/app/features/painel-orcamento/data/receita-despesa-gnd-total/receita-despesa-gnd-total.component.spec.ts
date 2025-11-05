import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaDespesaGndTotalComponent } from './receita-despesa-gnd-total.component';

describe('ReceitaDespesaGndTotalComponent', () => {
  let component: ReceitaDespesaGndTotalComponent;
  let fixture: ComponentFixture<ReceitaDespesaGndTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaDespesaGndTotalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaDespesaGndTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
