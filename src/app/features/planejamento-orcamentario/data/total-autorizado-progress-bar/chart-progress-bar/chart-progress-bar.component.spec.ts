import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartProgressBarComponent } from './chart-progress-bar.component';

describe('ChartProgressBarComponent', () => {
  let component: ChartProgressBarComponent;
  let fixture: ComponentFixture<ChartProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartProgressBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
