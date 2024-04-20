import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagListComponent } from '../tag-list/tag-list.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-annotate',
  // Remove standalone property
  exports: [TagListComponent],
  imports: [CommonModule, FormsModule],
  templateUrl: './annotate.component.html',
  // Change styleUrl to styleUrls
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent {

  fileInput: string = "";
  annotations: any[] = []; // Define type explicitly assuming annotations is an array

  baseUrl = 'http://akswnc7.informatik.uni-leipzig.de:19899/api/search?id=';

  async query(term: string) {
    let query = `${this.baseUrl}${term}`
    try {
      const data = await fetch(query);
      return await data.json() ?? [];
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  onSelectAnnotation(event: any) {
    // Utilize the annotation variable if needed
    console.log('Selected annotation:', event.tag);
  }

  onFileChange(event: Event) {
    // Handle file input change appropriately
    console.log('File input changed:', event);
  }

  async search(input: string) {
    var result = await this.query(input);

    const noResult = result == null || result.docs == null || result.docs.length === 0;
    if (noResult) {
      this.annotations = [];
      return;
    }

    const doc = result.docs[0];
    if (doc.annotation == null) {
      this.annotations = [];
      return;
    }

    this.annotations = doc.annotation;
  }
}
