import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantidadeMaiorEntregaComponent } from './quantidade-maior-entrega.component';

describe('QuantidadeMaiorEntregaComponent', () => {
  let component: QuantidadeMaiorEntregaComponent;
  let fixture: ComponentFixture<QuantidadeMaiorEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantidadeMaiorEntregaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantidadeMaiorEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
