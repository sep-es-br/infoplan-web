import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativeComponent } from './comparative.component';

describe('ComparativeComponent', () => {
  let component: ComparativeComponent;
  let fixture: ComponentFixture<ComparativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
