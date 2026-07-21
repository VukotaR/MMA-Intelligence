import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/auth';
  private readonly tokenKey = 'mma_access_token';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.saveToken(response.access_token);
        })
      );
  }
  register(data: RegisterRequest): Observable<RegisterResponse> {
  return this.http.post<RegisterResponse>(
    `${this.apiUrl}/register`,
    data
  );
}

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

getCurrentUser(): JwtPayload | null {
  const token = this.getToken();

  if (!token) {
    console.log('NO TOKEN');
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    console.log('DECODED JWT:', decoded);

    return decoded;
  } catch (error) {
    console.error('JWT DECODE ERROR:', error);
    return null;
  }
}

  getRole(): string | null {
  const role = this.getCurrentUser()?.role;

  return role
    ? role.toUpperCase()
    : null;
}

isAdmin(): boolean {
  return this.getRole() === 'ADMIN';
}

isCoach(): boolean {
  return this.getRole() === 'COACH';
}

isUser(): boolean {
  return this.getRole() === 'USER';
}

  getUserId(): number | null {
    return this.getCurrentUser()?.sub ?? null;
  }


}