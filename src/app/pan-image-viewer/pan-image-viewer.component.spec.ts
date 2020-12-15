import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanImageViewerComponent } from './pan-image-viewer.component';

describe('PanImageViewerComponent', () => {
  let component: PanImageViewerComponent;
  let fixture: ComponentFixture<PanImageViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanImageViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PanImageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
