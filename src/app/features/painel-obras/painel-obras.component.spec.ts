import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelObrasComponent } from './painel-obras.component';

describe('PainelObrasComponent', () => {
  let component: PainelObrasComponent;
  let fixture: ComponentFixture<PainelObrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainelObrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelObrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
