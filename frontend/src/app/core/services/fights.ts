import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Fighter } from './fighters';

export interface FightEvent {
  id: number;
  name: string;
  date: string;
  city: string;
  country: string;
  venue?: string | null;
}

export interface Fight {
  id: number;

  event: FightEvent;

  redCorner: Fighter;
  blueCorner: Fighter;
  winner?: Fighter | null;

  weightClass: string;
  status: string;
  cardPosition: string;

  method?: string | null;
  methodDetails?: string | null;

  scheduledRounds: number;
  finishedRound?: number | null;
  finishedTime?: string | null;

  titleFight: boolean;

  youtubeUrl?: string | null;

  analysisStatus: string;
  analysisSummary?: string | null;

  cardOrder: number;

  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FightsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/fights';

  getAll(): Observable<Fight[]> {
    return this.http.get<Fight[]>(
      this.apiUrl
    );
  }

  getById(id: number): Observable<Fight> {
    return this.http.get<Fight>(
      `${this.apiUrl}/${id}`
    );
  }

  getByFighter(
    fighterId: number
  ): Observable<Fight[]> {
    return this.http.get<Fight[]>(
      `${this.apiUrl}/fighter/${fighterId}`
    );
  }

  getByEvent(
    eventId: number
  ): Observable<Fight[]> {
    return this.http.get<Fight[]>(
      `${this.apiUrl}/event/${eventId}`
    );
  }
}