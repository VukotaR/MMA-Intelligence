import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventFighter {
  id: number;
  name: string;
  image?: string | null;
  nickname?: string | null;
  country?: string | null;
  wins?: number;
  losses?: number;
  draws?: number;
}

export interface EventFight {
  id: number;

  status: string;
  cardPosition: string;
  cardOrder?: number;

  weightClass: string;
  scheduledRounds: number;
  titleFight: boolean;

  redCorner: EventFighter;
  blueCorner: EventFighter;
  winner?: EventFighter | null;

  method?: string | null;
  methodDetails?: string | null;

  finishedRound?: number | null;
  finishedTime?: string | null;

  youtubeUrl?: string | null;

  analysisStatus?: string | null;
  analysisSummary?: string | null;
}

export interface EventOrganization {
  id: number;
  name: string;
  abbreviation?: string | null;
}

export interface MmaEvent {
  id: number;
  name: string;
  description?: string | null;

  date?: string | null;
  eventDate?: string | null;
  startDate?: string | null;

  venue?: string | null;
  arena?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;

  poster?: string | null;
  posterUrl?: string | null;
  imageUrl?: string | null;

  status: string;

  organization?: EventOrganization | null;
  fights?: EventFight[];
}

export interface SaveEventRequest {
  name: string;
  date: string;
  city: string;
  country: string;
  venue?: string;
  poster?: string;
  description?: string;
  status: string;
  organizationId: number;
}

export interface SaveFightRequest {
  eventId: number;

  redCornerId: number;
  blueCornerId: number;

  winnerId?: number;

  weightClass: string;
  status?: string;
  cardPosition?: string;

  method?: string;
  methodDetails?: string;

  scheduledRounds?: number;
  finishedRound?: number;
  finishedTime?: string;

  titleFight?: boolean;
  youtubeUrl?: string;

  analysisStatus?: string;
  analysisSummary?: string;

  cardOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly apiUrl =
    'http://localhost:3000/events';

  private readonly organizationsUrl =
    'http://localhost:3000/organizations';

  private readonly fightsUrl =
    'http://localhost:3000/fights';

  private readonly fightersUrl =
    'http://localhost:3000/fighters';

  constructor(
    private readonly http: HttpClient
  ) {}

  // EVENTS

  getAll(): Observable<MmaEvent[]> {
    return this.http.get<MmaEvent[]>(
      this.apiUrl
    );
  }

  getById(id: number): Observable<MmaEvent> {
    return this.http.get<MmaEvent>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: SaveEventRequest
  ): Observable<MmaEvent> {
    return this.http.post<MmaEvent>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: Partial<SaveEventRequest>
  ): Observable<MmaEvent> {
    return this.http.patch<MmaEvent>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  getOrganizations():
    Observable<EventOrganization[]> {
    return this.http.get<EventOrganization[]>(
      this.organizationsUrl
    );
  }

  // FIGHTS

  getFightsByEvent(
    eventId: number
  ): Observable<EventFight[]> {
    return this.http.get<EventFight[]>(
      `${this.fightsUrl}/event/${eventId}`
    );
  }

  getFightById(
    fightId: number
  ): Observable<EventFight> {
    return this.http.get<EventFight>(
      `${this.fightsUrl}/${fightId}`
    );
  }

  createFight(
    request: SaveFightRequest
  ): Observable<EventFight> {
    return this.http.post<EventFight>(
      this.fightsUrl,
      request
    );
  }

  updateFight(
    fightId: number,
    request: Partial<SaveFightRequest>
  ): Observable<EventFight> {
    return this.http.patch<EventFight>(
      `${this.fightsUrl}/${fightId}`,
      request
    );
  }

  deleteFight(
    fightId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.fightsUrl}/${fightId}`
    );
  }

  // FIGHTERS

  getFighters(): Observable<EventFighter[]> {
    return this.http.get<EventFighter[]>(
      this.fightersUrl
    );
  }
}