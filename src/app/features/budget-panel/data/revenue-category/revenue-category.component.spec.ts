import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueCategoryComponent } from './revenue-category.component';

describe('RevenueCategoryComponent', () => {
  let component: RevenueCategoryComponent;
  let fixture: ComponentFixture<RevenueCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
