import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaOrigemComponent } from './receita-origem.component';

describe('ReceitaOrigemComponent', () => {
  let component: ReceitaOrigemComponent;
  let fixture: ComponentFixture<ReceitaOrigemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaOrigemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaOrigemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
