import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { TabComponent } from './tab.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'tabs',
  standalone: true,
  imports: [ NgFor ],
  styles: `
    ul {
      list-style-type: none;
      display: flex;
      margin: 0;
      padding: 0;
    }

    li {
      padding: 1em;
      cursor: pointer;
      margin-right: 4px;
      background-color: #dbdbdb;
    }
  `,
  template:`
    <ul class="nav nav-pills nav-fill">
      <li class="nav-item" *ngFor="let tab of tabs" (click)="selectTab(tab)">
        <a class="nav-link" tabindex [class.active]="tab.active">{{tab.title}}</a>
      </li>
    </ul>
    <ng-content></ng-content>
  `
})
export class TabsComponent implements AfterContentInit {

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    let activeTabs = this.tabs.filter((tab)=>tab.active);

    // if there is no active tab set, activate the first
    if(activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: TabComponent){
    // deactivate all tabs
    this.tabs.toArray().forEach(tab => tab.active = false);

    // activate the tab the user has clicked on.
    tab.active = true;
  }
}