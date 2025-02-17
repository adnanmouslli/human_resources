import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursProfessionsComponent } from './hours-professions.component';

describe('HoursProfessionsComponent', () => {
  let component: HoursProfessionsComponent;
  let fixture: ComponentFixture<HoursProfessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursProfessionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HoursProfessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
