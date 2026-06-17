import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityTuUoComponent } from './availability-tu-uo.component';

describe('AvailabilityTuUoComponent', () => {
  let component: AvailabilityTuUoComponent;
  let fixture: ComponentFixture<AvailabilityTuUoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailabilityTuUoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AvailabilityTuUoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
