import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { FormsModule } from '@angular/forms';
import { RESULTS } from '../mock-results';
import { EXPLANATIONS } from '../mock-explanations';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SearchResultsComponent, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})

export class SearchComponent {
  searchInput : string = "";

  results : any = {};

  onSearchChange(event: Event) {
    this.search(this.searchInput);
  }

  search(term : string) {
    console.log(`Searching for ${term}`);

    // TODO: async call auf API mit irgendeiner HTTP scheise

    var results = RESULTS;
    var explanations = EXPLANATIONS;

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