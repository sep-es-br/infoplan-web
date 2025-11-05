import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaImpostosComponent } from './receita-impostos.component';

describe('ReceitaImpostosComponent', () => {
  let component: ReceitaImpostosComponent;
  let fixture: ComponentFixture<ReceitaImpostosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaImpostosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaImpostosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
