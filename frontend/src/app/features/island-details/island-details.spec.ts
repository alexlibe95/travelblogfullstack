import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { IslandDetails } from './island-details';

describe('IslandDetails', () => {
  let component: IslandDetails;
  let fixture: ComponentFixture<IslandDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IslandDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IslandDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
