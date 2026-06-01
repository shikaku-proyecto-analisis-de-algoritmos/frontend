import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthUser, GoogleAuthRequest, LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = 'https://backend-production-bc86.up.railway.app';
  private tokenKey = 'shikaku.token';
  private usernameKey = 'shikaku.username';
  private avatarKey = 'shikaku.avatar_url';
  private authState = new BehaviorSubject<AuthUser>(this.getUser());
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

  loginWithGoogle(payload: GoogleAuthRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.api}/auth/google`, payload).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.avatarKey);
    this.authState.next({ username: null, avatarUrl: null });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  getAvatarUrl(): string | null {
    return localStorage.getItem(this.avatarKey);
  }

  getUser(): AuthUser {
    return {
      username: this.getUsername(),
      avatarUrl: this.getAvatarUrl()
    };
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
    if (response.avatar_url) {
      localStorage.setItem(this.avatarKey, response.avatar_url);
    } else {
      localStorage.removeItem(this.avatarKey);
    }
    this.authState.next({
      username: response.username || this.getUsername(),
      avatarUrl: response.avatar_url || this.getAvatarUrl()
    });
  }
}
