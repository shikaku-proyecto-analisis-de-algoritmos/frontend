import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {
  usuario: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    console.log('Usuario:', this.usuario);
    console.log('Contraseña:', this.password);

    const credentials: LoginRequest = {
      username: this.usuario,
      password: this.password
    };

    // Llamamos al servicio para validar contra la base de datos
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso, token:', response.access_token);
        this.router.navigate(['/nueva-partida']);
      },
      error: (error) => {
        alert('Error al iniciar sesión: Credenciales incorrectas');
      }
    });
  }
}
