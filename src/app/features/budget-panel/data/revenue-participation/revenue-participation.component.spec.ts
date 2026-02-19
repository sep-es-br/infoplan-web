import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueParticipationComponent } from './revenue-participation.component';

describe('RevenueParticipationComponent', () => {
  let component: RevenueParticipationComponent;
  let fixture: ComponentFixture<RevenueParticipationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueParticipationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueParticipationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
