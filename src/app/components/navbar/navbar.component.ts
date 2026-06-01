import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  showInfoLinks = true;
  username: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.showInfoLinks = this.isLandingRoute(this.router.url);
    this.authService.user$.subscribe(username => {
      this.username = username;
    });

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
