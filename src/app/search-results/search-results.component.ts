import { Component, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RESULTS } from '../mock-results';
import { EXPLANATIONS } from '../mock-explanations';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',

})


export class SearchResultsComponent {
 
  @Input() results : any;

  ngOnInit() {

    this.results = {};
    this.results.docs = [];

  }

  processInput() {

    
  }
}
