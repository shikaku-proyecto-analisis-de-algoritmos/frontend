import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = 'http://localhost:8000';
  private tokenKey = 'shikaku.token';
  private usernameKey = 'shikaku.username';
  private authState = new BehaviorSubject<string | null>(this.getUsername());
  user$ = this.authState.asObservable();

  constructor(private http: HttpClient) { }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.api}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.api}/login`, credentials).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    this.authState.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/profile`, { headers: this.authHeaders() });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/profile/stats`, { headers: this.authHeaders() });
  }

  getHistory(): Observable<any> {
    return this.http.get(`${this.api}/profile/history`, { headers: this.authHeaders() });
  }

  private setSession(response: TokenResponse): void {
    localStorage.setItem(this.tokenKey, response.access_token);
    if (response.username) {
      localStorage.setItem(this.usernameKey, response.username);
    }
    this.authState.next(response.username || this.getUsername());
  }
}
