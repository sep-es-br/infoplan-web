import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUoComponent } from './dashboard-uo.component';

describe('DashboardUoComponent', () => {
  let component: DashboardUoComponent;
  let fixture: ComponentFixture<DashboardUoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardUoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
