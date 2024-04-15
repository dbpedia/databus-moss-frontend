import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotateRdfTabComponent } from './annotate-rdf-tab.component';

describe('AnnotateRdfTabComponent', () => {
  let component: AnnotateRdfTabComponent;
  let fixture: ComponentFixture<AnnotateRdfTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotateRdfTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotateRdfTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
