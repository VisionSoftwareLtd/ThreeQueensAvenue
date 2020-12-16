import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameExploreComponent } from './game-explore.component';

describe('GameExploreComponent', () => {
  let component: GameExploreComponent;
  let fixture: ComponentFixture<GameExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameExploreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
