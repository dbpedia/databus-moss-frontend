import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotateSimpleTabComponent } from './annotate-simple-tab.component';

describe('AnnotateSimpleTabComponent', () => {
  let component: AnnotateSimpleTabComponent;
  let fixture: ComponentFixture<AnnotateSimpleTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotateSimpleTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotateSimpleTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
