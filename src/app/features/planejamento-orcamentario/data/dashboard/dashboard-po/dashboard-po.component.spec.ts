import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPoComponent } from './dashboard-po.component';

describe('DashboardPoComponent', () => {
  let component: DashboardPoComponent;
  let fixture: ComponentFixture<DashboardPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
