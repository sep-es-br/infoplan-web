import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantidadeMaiorPrevistaComponent } from './quantidade-maior-prevista.component';

describe('QuantidadeMaiorPrevistaComponent', () => {
  let component: QuantidadeMaiorPrevistaComponent;
  let fixture: ComponentFixture<QuantidadeMaiorPrevistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantidadeMaiorPrevistaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantidadeMaiorPrevistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
