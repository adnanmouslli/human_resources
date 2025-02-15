import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionPiecesComponent } from './production-pieces.component';

describe('ProductionPiecesComponent', () => {
  let component: ProductionPiecesComponent;
  let fixture: ComponentFixture<ProductionPiecesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionPiecesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionPiecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
