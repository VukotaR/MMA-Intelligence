import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Fight } from '../models/fight.model';

@Injectable({
  providedIn: 'root',
})
export class FightsService {
  private readonly apiUrl = 'http://localhost:3000/fights';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Fight[]> {
    return this.http.get<Fight[]>(this.apiUrl);
  }

  getById(id: number): Observable<Fight> {
    return this.http.get<Fight>(
      `${this.apiUrl}/${id}`,
    );
  }

  getByEvent(eventId: number): Observable<Fight[]> {
    return this.http.get<Fight[]>(
      `${this.apiUrl}/event/${eventId}`,
    );
  }

  getByFighter(
    fighterId: number,
  ): Observable<Fight[]> {
    return this.http.get<Fight[]>(
      `${this.apiUrl}/fighter/${fighterId}`,
    );
  }
}