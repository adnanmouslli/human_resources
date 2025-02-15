import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListJobTitlesComponent } from './list-job-titles.component';

describe('ListJobTitlesComponent', () => {
  let component: ListJobTitlesComponent;
  let fixture: ComponentFixture<ListJobTitlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListJobTitlesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListJobTitlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
