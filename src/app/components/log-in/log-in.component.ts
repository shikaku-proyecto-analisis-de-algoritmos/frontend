import { Component } from '@angular/core';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {
  correo: string = '';
  password: string = '';

  iniciarSesion(): void {
    console.log('Correo:', this.correo);
    console.log('Contraseña:', this.password);
    // Aquí conectas con tu AuthService
  }
}