import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  baseUrl : string = 'http://localhost:2003/api/search' + '?type=tag&query=';
  annotatedCountSuffix : string = "&annotatedCount="

  @Output() select = new EventEmitter();
  
  @Input() annotatedCount : string = "1,1000000";

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
    let query = `${this.baseUrl}${searchInput}${this.annotatedCountSuffix}${this.annotatedCount}`
    const data = await fetch(query);
    return await data.json() ?? [];
  }

  async search(term : string) {

    let tags = await this.query(term);

    for(let tag of tags.docs) {
      if(tag.annotatedCount == undefined || tag.annotatedCount.length == 0) {
        tag.annotatedCount = 0;
      }
    }

    this.tags = tags;
  }
}
