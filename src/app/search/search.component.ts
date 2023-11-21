import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SearchResultsComponent, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})

export class SearchComponent {
  searchInput : string = "";

 

  onSearchChange(event: Event) {
    this.search(this.searchInput);
  }

  search(term : string) {
    console.log(`Searching for ${term}`);
  }
}