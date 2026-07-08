import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutBudgetPanel } from './layout-budget-panel';

describe('LayoutBudgetPanel', () => {
  let component: LayoutBudgetPanel;
  let fixture: ComponentFixture<LayoutBudgetPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutBudgetPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutBudgetPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
