import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgChartOppositeComponent } from './org-chart-opposite.component';

describe('OrgChartOppositeComponent', () => {
  let component: OrgChartOppositeComponent;
  let fixture: ComponentFixture<OrgChartOppositeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgChartOppositeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgChartOppositeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
