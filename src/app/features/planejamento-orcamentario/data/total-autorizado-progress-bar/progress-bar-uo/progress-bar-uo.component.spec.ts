import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBarUoComponent } from './progress-bar-uo.component';

describe('ProgressBarUoComponent', () => {
  let component: ProgressBarUoComponent;
  let fixture: ComponentFixture<ProgressBarUoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressBarUoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressBarUoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
