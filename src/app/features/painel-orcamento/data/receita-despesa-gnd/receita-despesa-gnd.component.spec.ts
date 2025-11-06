import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaDespesaGndComponent } from './receita-despesa-gnd.component';

describe('ReceitaDespesaGndComponent', () => {
  let component: ReceitaDespesaGndComponent;
  let fixture: ComponentFixture<ReceitaDespesaGndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaDespesaGndComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaDespesaGndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
