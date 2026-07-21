import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Fighter } from './fighters';

export type AnalysisStatus = 'DRAFT' | 'PUBLISHED';

export interface AnalysisCoach {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

export interface Analysis {
  id: number;
  title: string;

  redFighter: Fighter;
  blueFighter: Fighter;
  coach: AnalysisCoach | null;

  summary: string;

  redFighterStrengths: string | null;
  redFighterWeaknesses: string | null;
  blueFighterStrengths: string | null;
  blueFighterWeaknesses: string | null;

  overallStrategy: string;
  strikingStrategy: string | null;
  grapplingStrategy: string | null;
  defensiveStrategy: string | null;

  roundOnePlan: string | null;
  roundTwoPlan: string | null;
  roundThreePlan: string | null;
  championshipRoundsPlan: string | null;

  keyTargets: string | null;
  risksToAvoid: string | null;
  contingencyPlan: string | null;
  coachNotes: string | null;

  status: AnalysisStatus;

  createdAt: string;
  updatedAt: string;
}

export interface AnalysisPayload {
  title: string;

  redFighterId: number;
  blueFighterId: number;
  coachId?: number | null;

  summary: string;

  redFighterStrengths?: string;
  redFighterWeaknesses?: string;
  blueFighterStrengths?: string;
  blueFighterWeaknesses?: string;

  overallStrategy: string;
  strikingStrategy?: string;
  grapplingStrategy?: string;
  defensiveStrategy?: string;

  roundOnePlan?: string;
  roundTwoPlan?: string;
  roundThreePlan?: string;
  championshipRoundsPlan?: string;

  keyTargets?: string;
  risksToAvoid?: string;
  contingencyPlan?: string;
  coachNotes?: string;

  status?: AnalysisStatus;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/analysis';

  create(payload: AnalysisPayload): Observable<Analysis> {
    return this.http.post<Analysis>(
      this.apiUrl,
      payload
    );
  }

  getAll(): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(
      this.apiUrl
    );
  }

  getById(id: number): Observable<Analysis> {
    return this.http.get<Analysis>(
      `${this.apiUrl}/${id}`
    );
  }

  getByMatchup(
    redFighterId: number,
    blueFighterId: number
  ): Observable<Analysis[]> {
    const params = new HttpParams()
      .set('redFighterId', redFighterId)
      .set('blueFighterId', blueFighterId);

    return this.http.get<Analysis[]>(
      `${this.apiUrl}/matchup`,
      { params }
    );
  }

  update(
    id: number,
    payload: Partial<AnalysisPayload>
  ): Observable<Analysis> {
    return this.http.patch<Analysis>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}