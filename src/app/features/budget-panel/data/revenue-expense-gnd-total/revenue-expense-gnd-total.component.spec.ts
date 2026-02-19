import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueExpenseGndTotalComponent } from './revenue-expense-gnd-total.component';

describe('RevenueExpenseGndTotalComponent', () => {
  let component: RevenueExpenseGndTotalComponent;
  let fixture: ComponentFixture<RevenueExpenseGndTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueExpenseGndTotalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueExpenseGndTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
