import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgaoComponent } from './orgao.component';

describe('OrgaoComponent', () => {
  let component: OrgaoComponent;
  let fixture: ComponentFixture<OrgaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
