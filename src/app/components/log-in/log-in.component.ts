import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoginRequest } from '../../models/auth.model';

declare const google: any;

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleLoginBtn', { static: false }) googleLoginBtn?: ElementRef<HTMLDivElement>;

  usuario: string = '';
  password: string = '';
  errorMessage = '';
  successMessage = '';
  isLoadingGoogle = false;
  private googleButtonRendered = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    this.initGoogleAuth();
  }

  ngOnDestroy(): void {
    this.googleButtonRendered = false;
  }

  iniciarSesion(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const credentials: LoginRequest = {
      username: this.usuario,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.successMessage = 'Sesion iniciada correctamente.';
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = error?.error?.detail || 'No se pudo iniciar sesion.';
      }
    });
  }

  private initGoogleAuth(): void {
    const clientId = this.getGoogleClientId();
    if (!clientId || typeof google === 'undefined' || this.googleButtonRendered || !this.googleLoginBtn?.nativeElement) {
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => this.handleGoogleCredential(response?.credential)
    });

    google.accounts.id.renderButton(this.googleLoginBtn.nativeElement, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: 360
    });

    this.googleButtonRendered = true;
  }

  private handleGoogleCredential(credential: string): void {
    if (!credential) {
      this.errorMessage = 'No se pudo obtener la credencial de Google.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoadingGoogle = true;

    this.authService.loginWithGoogle({ credential }).subscribe({
      next: () => {
        this.isLoadingGoogle = false;
        this.successMessage = 'Sesion iniciada correctamente.';
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoadingGoogle = false;
        this.errorMessage = error?.error?.detail || 'No se pudo iniciar sesion con Google.';
      }
    });
  }

  private getGoogleClientId(): string {
    const metaTag = document.querySelector('meta[name="google-signin-client_id"]');
    return metaTag?.getAttribute('content') || '';
  }
}
