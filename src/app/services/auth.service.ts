import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequest, LoginRequest } from '../models/auth.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta esta URL a la de tu backend para el registro de usuarios
  private apiUrl = 'http://localhost:8000/register'; 

  constructor(private http: HttpClient) { }

  register(userData: RegisterRequest): Observable<any> {
    // Aquí se realiza la petición POST al backend
    return this.http.post<any>(this.apiUrl, userData);
  }

  login(credentials: LoginRequest): Observable<any> {
    const loginUrl = `http://localhost:8000/login`;
    return this.http.post<any>(loginUrl, credentials);
  }

}