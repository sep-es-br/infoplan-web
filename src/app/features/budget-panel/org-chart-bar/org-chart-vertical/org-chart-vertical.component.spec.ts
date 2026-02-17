import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgChartVerticalComponent } from './org-chart-vertical.component';

describe('OrgChartVerticalComponent', () => {
  let component: OrgChartVerticalComponent;
  let fixture: ComponentFixture<OrgChartVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgChartVerticalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgChartVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
