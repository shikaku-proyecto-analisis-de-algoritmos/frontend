import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest) {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(res => localStorage.setItem('token', res.access_token))
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}