import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaIcmsComponent } from './receita-icms.component';

describe('ReceitaIcmsComponent', () => {
  let component: ReceitaIcmsComponent;
  let fixture: ComponentFixture<ReceitaIcmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceitaIcmsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaIcmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
