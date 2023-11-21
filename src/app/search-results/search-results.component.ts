import { Component } from '@angular/core';
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
 
  results: any;

  ngOnInit() {

    this.processInput(RESULTS, EXPLANATIONS);

  }

  processInput(results : any, explanations : any) {

    for(var result of results.docs) {
      result.expanded = true;
      result.explanations = [];

      for(var explanation of explanations.docs) {

        for(var annotationUri of result.annotation) {
          if(annotationUri == explanation.id) {
            result.explanations.push(explanation);
          }
        }
      }
    }

    this.results = results;
  }
}
