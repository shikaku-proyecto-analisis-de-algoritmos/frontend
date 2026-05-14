import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  registrar(): void {

    console.log('Usuario:', this.usuario);
    console.log('Correo:', this.correo);
    console.log('Contraseña:', this.password);

    alert('Registro exitoso');
    this.router.navigate(['/grid']);
  }

}