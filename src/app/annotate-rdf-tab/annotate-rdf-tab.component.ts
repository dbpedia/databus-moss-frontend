import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-annotate-rdf-tab',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './annotate-rdf-tab.component.html',
  styleUrl: './annotate-rdf-tab.component.scss'
})
export class AnnotateRdfTabComponent {
  modTypeInput : string = "";
  modMetadataInput : string ="";
}
