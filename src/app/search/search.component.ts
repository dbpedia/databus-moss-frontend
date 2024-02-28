import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { FormsModule } from '@angular/forms';
import { TagListComponent } from '../tag-list/tag-list.component';


@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [CommonModule, SearchResultsComponent, TagListComponent, FormsModule],
})

@Injectable()
export class SearchComponent {
  searchInput : string = "";

  results : any = {};
  queryResult: any = {};

  baseUrl = 'http://localhost:2003/api/search' + '?query=';
  joinSuffix = '&join=';



  onSelectAnnotation(event : any) {
    this.searchInput = `&id=${event.tag.id[0]}`;
    this.search(this.searchInput);
  }

  onSearchChange(event: Event) {
    this.search(this.searchInput);
  }

  async query(searchInput: string, join?: string) {
    let query = `${this.baseUrl}${searchInput}`
    if (join != null) {
      query += this.joinSuffix + join;
    }

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

      if(result.modType != undefined) {
       result.modName = SearchComponent.uriToName(result.modType[0]);
      }

      for(var explanation of explanations.docs) {
        for(var annotationUri of result.annotation) {
          if(annotationUri == explanation.id) {
           
            explanation.idName = SearchComponent.uriToName(explanation.id[0]);
          
            result.explanations.push(explanation);
          }
        }
      }
    }

    this.results = results;
  } 

  static uriToName(uri : string) {
    if (uri == null) {
      return null;
    }

    var result = uri.substr(uri.lastIndexOf('/') + 1);
    result = result.substr(result.lastIndexOf('#') + 1);

    if (result.includes('.')) {
      result = result.substr(0, result.lastIndexOf('.'));
    }

    return result;
  }
}