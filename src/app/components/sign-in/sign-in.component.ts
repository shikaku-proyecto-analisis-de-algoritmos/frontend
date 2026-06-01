import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; // Importa el nuevo servicio
import { RegisterRequest } from '../../models/auth.model'; // Importa la interfaz de registro

declare const google: any;

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleRegisterBtn', { static: false }) googleRegisterBtn?: ElementRef<HTMLDivElement>;

  usuario: string = '';
  correo: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage = '';
  successMessage = '';
  isLoadingGoogle = false;
  private googleButtonRendered = false;

  constructor(private router: Router, private authService: AuthService) {} // Inyecta AuthService

  ngAfterViewInit(): void {
    this.initGoogleAuth();
  }

  ngOnDestroy(): void {
    this.googleButtonRendered = false;
  }

  registrar(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contrasenas no coinciden.';
      return;
    }

    const userData: RegisterRequest = {
      username: this.usuario,
      password: this.password,
      email: this.correo
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.successMessage = 'Cuenta creada correctamente.';
        this.router.navigate(['/login']); // Redirige después del registro exitoso a la página de login
      },
      error: (error) => {
        this.errorMessage = error?.error?.detail || 'No se pudo registrar la cuenta.';
      }
    });
  }

  private initGoogleAuth(): void {
    const clientId = this.getGoogleClientId();
    if (!clientId || typeof google === 'undefined' || this.googleButtonRendered || !this.googleRegisterBtn?.nativeElement) {
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => this.handleGoogleCredential(response?.credential)
    });

    google.accounts.id.renderButton(this.googleRegisterBtn.nativeElement, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'signup_with',
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
        this.successMessage = 'Cuenta creada correctamente.';
        this.router.navigate(['/nueva-partida']);
      },
      error: (error) => {
        this.isLoadingGoogle = false;
        this.errorMessage = error?.error?.detail || 'No se pudo registrar con Google.';
      }
    });
  }

  private getGoogleClientId(): string {
    const metaTag = document.querySelector('meta[name="google-signin-client_id"]');
    return metaTag?.getAttribute('content') || '';
  }
}