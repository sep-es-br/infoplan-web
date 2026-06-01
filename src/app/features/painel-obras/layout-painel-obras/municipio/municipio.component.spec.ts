import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipioComponent } from './municipio.component';

describe('MunicipioComponent', () => {
  let component: MunicipioComponent;
  let fixture: ComponentFixture<MunicipioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MunicipioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
