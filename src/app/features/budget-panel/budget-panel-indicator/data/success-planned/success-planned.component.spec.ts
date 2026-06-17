import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPlannedComponent } from './success-planned.component';

describe('SuccessPlannedComponent', () => {
  let component: SuccessPlannedComponent;
  let fixture: ComponentFixture<SuccessPlannedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessPlannedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessPlannedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
