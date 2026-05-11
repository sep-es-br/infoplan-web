import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPanelIndicatorComponent } from './budget-panel-indicator.component';

describe('BudgetPanelIndicatorComponent', () => {
  let component: BudgetPanelIndicatorComponent;
  let fixture: ComponentFixture<BudgetPanelIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BudgetPanelIndicatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPanelIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
