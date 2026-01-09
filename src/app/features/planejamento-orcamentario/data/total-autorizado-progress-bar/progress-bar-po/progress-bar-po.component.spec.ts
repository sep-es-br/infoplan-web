import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBarPoComponent } from './progress-bar-po.component';

describe('ProgressBarPoComponent', () => {
  let component: ProgressBarPoComponent;
  let fixture: ComponentFixture<ProgressBarPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressBarPoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressBarPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
