import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueExpenseGndComponent } from './revenue-expense-gnd.component';

describe('RevenueExpenseGndComponent', () => {
  let component: RevenueExpenseGndComponent;
  let fixture: ComponentFixture<RevenueExpenseGndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueExpenseGndComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueExpenseGndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
