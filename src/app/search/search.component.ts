import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [CommonModule, SearchResultsComponent, FormsModule, HttpClientModule],
})

@Injectable()
export class SearchComponent {
  searchInput : string = "";

  results : any = {};
  queryResult: any = {};

  baseUrl = 'http://192.168.178.57:8082/api/search?query=';
  joinSuffix = '&join=';

  constructor(private http: HttpClient) {
  }

  onSearchChange(event: Event) {
    this.search(this.searchInput);
  }

  async query(searchInput: string, join?: string) {
    let query = `${this.baseUrl}${searchInput}`
    if (join != null) {
      query += this.joinSuffix + join;
    }
    console.log("q", query);
    this.http.get(query);

    const data = await fetch(query);
    return await data.json() ?? [];
  }

  async search(term : string) {

    console.log(`Searching for ${term}`);
    let results = await this.query(this.searchInput, "annotation")
    let explanations = await this.query(this.searchInput);

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