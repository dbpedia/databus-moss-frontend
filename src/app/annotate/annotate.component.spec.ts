import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotateComponent } from './annotate.component';

describe('AnnotateComponent', () => {
  let component: AnnotateComponent;
  let fixture: ComponentFixture<AnnotateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
