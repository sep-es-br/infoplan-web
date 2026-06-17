import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteiraComponent } from './carteira.component';

describe('CarteiraComponent', () => {
  let component: CarteiraComponent;
  let fixture: ComponentFixture<CarteiraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarteiraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
