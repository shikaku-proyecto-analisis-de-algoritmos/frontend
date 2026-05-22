import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; // Importa el nuevo servicio
import { RegisterRequest } from '../../models/auth.model'; // Importa la interfaz de registro

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  usuario: string = '';
  correo: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) {} // Inyecta AuthService

  registrar(): void {
    console.log('Usuario:', this.usuario);
    console.log('Correo:', this.correo);
    console.log('Contraseña:', this.password);

    const userData: RegisterRequest = {
      username: this.usuario,
      password: this.password,
      // Si tu backend espera el correo, asegúrate de añadirlo a RegisterRequest en auth.model.ts
      // email: this.correo 
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso en el backend:', response);
        alert('Registro exitoso');
        this.router.navigate(['/login']); // Redirige después del registro exitoso a la página de login
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        alert('Error al registrar usuario: ' + (error.error.message || 'Inténtalo de nuevo.'));
      }
    });
  }
}