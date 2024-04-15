import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab',
  standalone: true,
  template: `
    <div [hidden]="!active">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input('tabTitle') title: string;
  @Input() active = false;
}