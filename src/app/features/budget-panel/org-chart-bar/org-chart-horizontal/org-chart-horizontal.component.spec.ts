import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgChartHorizontalComponent } from './org-chart-horizontal.component';

describe('OrgChartHorizontalComponent', () => {
  let component: OrgChartHorizontalComponent;
  let fixture: ComponentFixture<OrgChartHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgChartHorizontalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgChartHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
