import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagListComponent } from '../tag-list/tag-list.component';

@Component({
  selector: 'app-annotate',
  standalone: true,
  imports: [CommonModule, TagListComponent],
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.scss'
})
export class AnnotateComponent {

  onSelectAnnotation(event : any) {

  }
}
