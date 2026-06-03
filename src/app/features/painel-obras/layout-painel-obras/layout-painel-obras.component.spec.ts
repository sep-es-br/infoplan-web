import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPainelObrasComponent } from './layout-painel-obras.component';

describe('LayoutPainelObrasComponent', () => {
  let component: LayoutPainelObrasComponent;
  let fixture: ComponentFixture<LayoutPainelObrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutPainelObrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutPainelObrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
