export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  username?: string;
  avatar_url?: string;
}

export interface AuthUser {
  username: string | null;
  avatarUrl: string | null;
}

export interface Player {
  id: number;
  username: string;
  score: number;
}
