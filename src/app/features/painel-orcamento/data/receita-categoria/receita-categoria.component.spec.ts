import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaCategoriaComponent } from './receita-categoria.component';

describe('ReceitaCategoriaComponent', () => {
  let component: ReceitaCategoriaComponent;
  let fixture: ComponentFixture<ReceitaCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaCategoriaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
