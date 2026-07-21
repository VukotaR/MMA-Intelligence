import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Club } from '../models/club.model';

export interface ClubPayload {
  name: string;
  city: string;
  country: string;
  logo?: string | null;
  description?: string | null;
  coachId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClubsService {
  private readonly apiUrl =
    'http://localhost:3000/clubs';

  constructor(
    private readonly http: HttpClient
  ) {}

  getAll(search?: string): Observable<Club[]> {
    if (search?.trim()) {
      return this.http.get<Club[]>(
        `${this.apiUrl}?search=${encodeURIComponent(
          search.trim()
        )}`
      );
    }

    return this.http.get<Club[]>(this.apiUrl);
  }

  getById(id: number): Observable<Club> {
    return this.http.get<Club>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    payload: ClubPayload
  ): Observable<Club> {
    return this.http.post<Club>(
      this.apiUrl,
      payload
    );
  }

  update(
    id: number,
    payload: Partial<ClubPayload>
  ): Observable<Club> {
    return this.http.patch<Club>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  addFighter(
    clubId: number,
    fighterId: number
  ): Observable<Club> {
    return this.http.post<Club>(
      `${this.apiUrl}/${clubId}/fighters/${fighterId}`,
      {}
    );
  }

  removeFighter(
    clubId: number,
    fighterId: number
  ): Observable<Club> {
    return this.http.delete<Club>(
      `${this.apiUrl}/${clubId}/fighters/${fighterId}`
    );
  }
}