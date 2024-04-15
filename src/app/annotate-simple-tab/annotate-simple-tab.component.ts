import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { TagListComponent } from '../tag-list/tag-list.component';
import { FormsModule } from '@angular/forms';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-annotate-simple-tab',
  standalone: true,
  imports: [
    CommonModule, 
    TagListComponent, 
    FormsModule, 
    NgFor,
    DynamicFormComponent,
    HttpClientModule
  ],
  templateUrl: './annotate-simple-tab.component.html',
  styleUrl: './annotate-simple-tab.component.scss'
})
export class AnnotateSimpleTabComponent {
  fileInput : string = "";
  annotations : any;
  schema: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSchema();
  }

  loadSchema() {
    this.http.get('assets/metadata-form-schema.json').subscribe({
      next: (schema: any) => {
        this.schema = schema;
      },
      error: (error) => {
        console.error('Error loading schema:', error);
      }
    });
  }

  onSelectAnnotation(event : any) {
    var annotation = event.tag;


  }

  handleSubmit(event: any) {

  }

}
