import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyTagNavComponent } from './sticky-tag-nav.component';

describe('StickyTagNavComponent', () => {
  let component: StickyTagNavComponent;
  let fixture: ComponentFixture<StickyTagNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StickyTagNavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyTagNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
