import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReportsComponent } from './production-reports.component';

describe('ProductionReportsComponent', () => {
  let component: ProductionReportsComponent;
  let fixture: ComponentFixture<ProductionReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
