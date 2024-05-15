import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/internal/Observable';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { log } from 'console';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class ViewerComponent {
  id: string;
  baseUrl = 'http://localhost:8080/';
  data : any;

  constructor(private activatedRoute: ActivatedRoute) {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.query(this.id);
  }

  async query(searchInput: string) {
    let query = `${this.baseUrl}${searchInput}`;

    console.log(query);
    
    const data = await fetch(query);
    this.data = await data.json() ?? {};
  }
}
