import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevMonitorComponent } from './dev-monitor.component';

describe('DevMonitorComponent', () => {
  let component: DevMonitorComponent;
  let fixture: ComponentFixture<DevMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevMonitorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
