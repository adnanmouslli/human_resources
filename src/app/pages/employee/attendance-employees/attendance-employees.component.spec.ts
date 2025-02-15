import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceEmployeesComponent } from './attendance-employees.component';

describe('AttendanceEmployeesComponent', () => {
  let component: AttendanceEmployeesComponent;
  let fixture: ComponentFixture<AttendanceEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceEmployeesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttendanceEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
