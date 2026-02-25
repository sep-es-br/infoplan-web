import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueOriginComponent } from './revenue-origin.component';

describe('RevenueOriginComponent', () => {
  let component: RevenueOriginComponent;
  let fixture: ComponentFixture<RevenueOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueOriginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
