import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { TagListComponent } from '../tag-list/tag-list.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-annotate',
  standalone: true,
  imports: [CommonModule, TagListComponent, FormsModule, NgFor],
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.scss'
})
export class AnnotateComponent {

  fileInput : string = "";
  annotations : any;

  baseUrl = 'http://akswnc7.informatik.uni-leipzig.de:19899/api/search?id=';

  async query(term: string) {
    let query = `${this.baseUrl}${term}`
    const data = await fetch(query);
    return await data.json() ?? [];
  }


  onSelectAnnotation(event : any) {
    var annotation = event.tag;


  }

  onFileChange(event : Event) {
    this.search(this.fileInput);
  }

  async search(input : string) {
    var result = await this.query(input);

    if(result == null || result.docs == null || result.docs.length == 0) {
      this.annotations = [];
      return;
    }

    var doc = result.docs[0];

    if(doc.annotation == null) {
      this.annotations = [];
      return;
    }

    this.annotations = doc.annotation;

   
  }
}
