import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueTaxesComponent } from './revenue-taxes.component';

describe('RevenueTaxesComponent', () => {
  let component: RevenueTaxesComponent;
  let fixture: ComponentFixture<RevenueTaxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueTaxesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
