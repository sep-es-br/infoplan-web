import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationBudgetPanel } from './navigation-budget-panel';

describe('NavigationBudgetPanel', () => {
  let component: NavigationBudgetPanel;
  let fixture: ComponentFixture<NavigationBudgetPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationBudgetPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationBudgetPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
