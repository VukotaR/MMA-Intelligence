import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl =
    'http://localhost:3000/users';

  constructor(
    private readonly http: HttpClient
  ) {}

  getCoaches(): Observable<Coach[]> {
    return this.http.get<Coach[]>(
      `${this.apiUrl}/coaches`
    );
  }
}