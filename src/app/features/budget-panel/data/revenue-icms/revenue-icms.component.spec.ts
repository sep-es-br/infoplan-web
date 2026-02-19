import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueIcmsComponent } from './revenue-icms.component';

describe('RevenueIcmsComponent', () => {
  let component: RevenueIcmsComponent;
  let fixture: ComponentFixture<RevenueIcmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueIcmsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueIcmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
