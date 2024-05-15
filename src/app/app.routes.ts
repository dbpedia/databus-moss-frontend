import { RouterModule, UrlMatcher, UrlMatchResult, Routes, Route, UrlSegmentGroup, UrlSegment } from '@angular/router';
import { SearchComponent } from './search/search.component';
import AnnotateComponent from './annotate/annotate.component';
import { AboutComponent } from './about/about.component';
import { ViewerComponent } from './viewer/viewer.component';

const customMatcher: UrlMatcher = (
    segments: UrlSegment[],
    group: UrlSegmentGroup,
    route: Route
  ): UrlMatchResult => {

    if(segments.length == 0) {
        return null as any;
    }

    const acceptHeader = window.navigator.userAgent;
    if (!acceptHeader.includes('text/html')) {
      return null as any; 
    }

    const firstSegment = segments[0];

    if (firstSegment.path === "g") {
      const uri = segments.join('/');
      const idSegment: UrlSegment = new UrlSegment(uri, { id: uri });
      return ({ consumed: segments, posParams: { id: idSegment } });
    }
    
    return null as any;
  };
  
export const routes: Routes =  [
    { path: 'search', component: SearchComponent },
    { path: 'annotate', component: AnnotateComponent },
    { path: 'about', component: AboutComponent },
    { matcher: customMatcher, component: ViewerComponent },
    { path: '**', component: SearchComponent }
];

