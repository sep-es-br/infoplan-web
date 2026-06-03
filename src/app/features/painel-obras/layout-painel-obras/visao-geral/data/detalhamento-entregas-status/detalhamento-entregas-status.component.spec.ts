import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhamentoEntregasStatusComponent } from './detalhamento-entregas-status.component';

describe('DetalhamentoEntregasStatusComponent', () => {
  let component: DetalhamentoEntregasStatusComponent;
  let fixture: ComponentFixture<DetalhamentoEntregasStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalhamentoEntregasStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalhamentoEntregasStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
