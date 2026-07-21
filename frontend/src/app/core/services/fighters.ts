import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';  
export interface Fighter {
  id: number;
  name: string;
  nickname: string | null;
  country: string;
  age: number;
  height: number;
  weight: number;
  weightClass: string;
  reach: number;
  stance: string | null;
  fightingStyle: string | null;
  image: string | null;
  bio: string | null;

  wins: number;
  losses: number;
  draws: number;
  koWins: number;
  submissionWins: number;
  decisionWins: number;
  currentWinStreak: number;

  strikingAccuracy: number;
  strikingDefense: number;
  significantStrikesPerMinute: number;
  significantStrikesAbsorbedPerMinute: number;

  takedownAccuracy: number;
  takedownDefense: number;
  takedownsPer15: number;
  submissionAverage: number;

  ranking: number;
  champion: boolean;
  interimChampion: boolean;
}

export interface FighterPayload {
  name: string;
  country: string;
  age: number;
  height: number;
  weight: number;
  weightClass: string;

  nickname?: string;
  reach?: number;
  stance?: string;
  fightingStyle?: string;
  image?: string;
  bio?: string;

  wins?: number;
  losses?: number;
  draws?: number;
  koWins?: number;
  submissionWins?: number;
  decisionWins?: number;
  currentWinStreak?: number;

  strikingAccuracy?: number;
  strikingDefense?: number;
  significantStrikesPerMinute?: number;
  significantStrikesAbsorbedPerMinute?: number;

  takedownAccuracy?: number;
  takedownDefense?: number;
  takedownsPer15?: number;
  submissionAverage?: number;

  ranking?: number;
  champion?: boolean;
  interimChampion?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FightersService {
  private readonly apiUrl = 'http://localhost:3000/fighters';

  constructor(
    private readonly http: HttpClient
  ) {}

  getAll(search = ''): Observable<Fighter[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<Fighter[]>(this.apiUrl, {
      params
    });
  }

  getOne(id: number): Observable<Fighter> {
    return this.http.get<Fighter>(
      `${this.apiUrl}/${id}`
    );
  }
  getById(id: number) {
  return this.http.get<Fighter>(
    `${this.apiUrl}/${id}`
  );
}

  create(payload: FighterPayload): Observable<Fighter> {
    return this.http.post<Fighter>(
      this.apiUrl,
      payload
    );
  }

  update(
    id: number,
    payload: Partial<FighterPayload>
  ): Observable<Fighter> {
    return this.http.patch<Fighter>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  delete(id: number): Observable<Fighter> {
    return this.http.delete<Fighter>(
      `${this.apiUrl}/${id}`
    );
  }
}