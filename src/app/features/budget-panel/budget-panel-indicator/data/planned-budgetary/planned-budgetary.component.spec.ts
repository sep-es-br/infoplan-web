import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedBudgetaryComponent } from './planned-budgetary.component';

describe('PlannedBudgetaryComponent', () => {
  let component: PlannedBudgetaryComponent;
  let fixture: ComponentFixture<PlannedBudgetaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannedBudgetaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannedBudgetaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
