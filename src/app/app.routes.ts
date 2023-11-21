import { Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { AnnotateComponent } from './annotate/annotate.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes =  [
    { path: 'search', component: SearchComponent },
    { path: 'annotate', component: AnnotateComponent },
    { path: 'about', component: AboutComponent },
    { path: '**', component: SearchComponent }
];

