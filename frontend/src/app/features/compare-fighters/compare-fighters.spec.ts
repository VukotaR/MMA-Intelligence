import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareFighters } from './compare-fighters';

describe('CompareFighters', () => {
  let component: CompareFighters;
  let fixture: ComponentFixture<CompareFighters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareFighters],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareFighters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
