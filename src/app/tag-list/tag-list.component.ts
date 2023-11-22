import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { TAGS } from '../mock-tags';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss'
})
export class TagListComponent {
  searchInput : string = "";
  tags : any;
  baseUrl : string = 'http://akswnc7.informatik.uni-leipzig.de:19899/api/search?query=';

  @Output() select = new EventEmitter();

  constructor() {
    this.tags = {};
    this.tags.docs = [];
  }

  ngOnInit() {
    this.search("")
  }

  onSearchChange(event : Event) {
    this.search(this.searchInput);
  }

  onTagClicked(tag : any) {
    this.select.emit({ tag: tag });
  }

  async query(searchInput: string) {
    let query = `${this.baseUrl}${searchInput}`
    const data = await fetch(query);
    return await data.json() ?? [];
  }


  async search(term : string) {

    if(term == "") {
      term = "c";
    }

    let tags = await this.query(term);

    for(let tag of tags.docs) {
      if(tag.annotatedCount == undefined || tag.annotatedCount.length == 0) {
        tag.annotatedCount = 0;
      }
    }

    this.tags = tags;
  } 
}
