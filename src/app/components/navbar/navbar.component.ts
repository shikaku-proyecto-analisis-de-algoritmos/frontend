import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  showInfoLinks = true;

  constructor(private router: Router) {
    this.showInfoLinks = this.isLandingRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showInfoLinks = this.isLandingRoute(event.urlAfterRedirects);
      });
  }

  private isLandingRoute(url: string): boolean {
    const path = url.split('#')[0].split('?')[0];
    return path === '/';
  }
}
