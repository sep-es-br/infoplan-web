import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEntregasFonteRecursoComponent } from './total-entregas-fonte-recurso.component';

describe('TotalEntregasFonteRecursoComponent', () => {
  let component: TotalEntregasFonteRecursoComponent;
  let fixture: ComponentFixture<TotalEntregasFonteRecursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEntregasFonteRecursoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalEntregasFonteRecursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
