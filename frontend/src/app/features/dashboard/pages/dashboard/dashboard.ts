import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  Subject,
  catchError,
  finalize,
  forkJoin,
  of,
  takeUntil
} from 'rxjs';

import { AuthService } from '../../../../core/services/auth';
import {
  Fighter,
  FightersService
} from '../../../../core/services/fighters';
import {
  EventsService,
  MmaEvent
} from '../../../../core/services/events';
import {
  Fight,
  FightsService
} from '../../../../core/services/fights';
import {
  Analysis,
  AnalysisService
} from '../../../../core/services/analysis';

interface DashboardStatistics {
  fighters: number;
  fights: number;
  events: number;
  organizations: number;
  analyses: number;
  publishedAnalyses: number;
  draftAnalyses: number;
  upcomingEvents: number;
  completedEvents: number;
  scheduledFights: number;
  completedFights: number;
}

interface ActivityMonth {
  label: string;
  count: number;
  height: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly destroySubject =
    new Subject<void>();

  sidebarOpen = false;

  statistics: DashboardStatistics = {
    fighters: 0,
    fights: 0,
    events: 0,
    organizations: 0,
    analyses: 0,
    publishedAnalyses: 0,
    draftAnalyses: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    scheduledFights: 0,
    completedFights: 0
  };

  activityMonths: ActivityMonth[] = [];

  recentEvents: MmaEvent[] = [];
  recentAnalyses: Analysis[] = [];

  statisticsLoading = false;
  statisticsError = '';

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router,
    private readonly fightersService: FightersService,
    private readonly eventsService: EventsService,
    private readonly fightsService: FightsService,
    private readonly analysisService: AnalysisService,
     private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStatistics();
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userEmail(): string {
    return this.currentUser?.email ?? 'Unknown user';
  }

  get userRole(): string {
    return this.currentUser?.role ?? 'USER';
  }

  get roleLabel(): string {
    switch (this.userRole) {
      case 'ADMIN':
        return 'Administrator';

      case 'COACH':
        return 'Coach';

      default:
        return 'User';
    }
  }

  get userInitial(): string {
    return this.userEmail
      .charAt(0)
      .toUpperCase();
  }

  get welcomeTitle(): string {
    if (this.authService.isAdmin()) {
      return 'Welcome back, Administrator.';
    }

    if (this.authService.isCoach()) {
      return 'Welcome back, Coach.';
    }

    return 'Welcome to MMA Intelligence.';
  }

  get welcomeDescription(): string {
    if (this.authService.isAdmin()) {
      return (
        'Manage fighters, clubs, organizations, events and platform data ' +
        'from one central dashboard.'
      );
    }

    if (this.authService.isCoach()) {
      return (
        'Manage your club, review your fighters and prepare analyses ' +
        'for upcoming matchups.'
      );
    }

    return (
      'Explore fighters, upcoming events, MMA clubs and detailed ' +
      'fight comparisons.'
    );
  }

  loadDashboardStatistics(): void {
    this.statisticsLoading = true;
    this.statisticsError = '';

    const canLoadAnalyses =
      this.authService.isAdmin() ||
      this.authService.isCoach();

    forkJoin({
      fighters: this.fightersService
        .getAll()
        .pipe(
          catchError((error: unknown) => {
            console.error(
              'Dashboard fighters error:',
              error
            );

            return of([] as Fighter[]);
          })
        ),

      events: this.eventsService
        .getAll()
        .pipe(
          catchError((error: unknown) => {
            console.error(
              'Dashboard events error:',
              error
            );

            return of([] as MmaEvent[]);
          })
        ),

      fights: this.fightsService
        .getAll()
        .pipe(
          catchError((error: unknown) => {
            console.error(
              'Dashboard fights error:',
              error
            );

            return of([] as Fight[]);
          })
        ),

      organizations: this.eventsService
        .getOrganizations()
        .pipe(
          catchError((error: unknown) => {
            console.error(
              'Dashboard organizations error:',
              error
            );

            return of([]);
          })
        ),

      analyses: canLoadAnalyses
        ? this.analysisService
            .getAll()
            .pipe(
              catchError((error: unknown) => {
                console.error(
                  'Dashboard analyses error:',
                  error
                );

                return of([] as Analysis[]);
              })
            )
        : of([] as Analysis[])
    })
      .pipe(
        finalize(() => {
          this.statisticsLoading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroySubject)
      )
      .subscribe({
        next: ({
          fighters,
          events,
          fights,
          organizations,
          analyses
        }) => {
          this.statistics = {
            fighters: fighters.length,
            fights: fights.length,
            events: events.length,
            organizations: organizations.length,

            analyses: analyses.length,

            publishedAnalyses:
              analyses.filter(
                analysis =>
                  analysis.status === 'PUBLISHED'
              ).length,

            draftAnalyses:
              analyses.filter(
                analysis =>
                  analysis.status === 'DRAFT'
              ).length,

            upcomingEvents:
              events.filter(event =>
                this.isUpcomingEvent(event)
              ).length,

            completedEvents:
              events.filter(event =>
                this.isCompletedStatus(event.status)
              ).length,

            scheduledFights:
              fights.filter(fight =>
                this.isScheduledStatus(fight.status)
              ).length,

            completedFights:
              fights.filter(fight =>
                this.isCompletedStatus(fight.status)
              ).length
          };

          this.recentEvents = [...events]
            .sort(
              (first, second) =>
                this.getEventTimestamp(second) -
                this.getEventTimestamp(first)
            )
            .slice(0, 4);

          this.recentAnalyses = [...analyses]
            .sort(
              (first, second) =>
                new Date(second.updatedAt).getTime() -
                new Date(first.updatedAt).getTime()
            )
            .slice(0, 4);

          this.activityMonths =
            this.createActivityMonths(events);
            this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Dashboard loading error:',
            error
          );

          this.statisticsError =
            'Dashboard statistics could not be loaded.';

             this.statisticsLoading = false;
  this.cdr.detectChanges();
        }
      });
  }

  getEventDate(event: MmaEvent): string | null {
    return (
      event.date ??
      event.eventDate ??
      event.startDate ??
      null
    );
  }

  getEventLocation(event: MmaEvent): string {
    const values = [
      event.venue ?? event.arena,
      event.city,
      event.country
    ].filter(Boolean);

    return values.join(', ') || 'Location unavailable';
  }

  getEventStatusLabel(status: string): string {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        character => character.toUpperCase()
      );
  }

  getCoachName(analysis: Analysis): string {
    if (!analysis.coach) {
      return 'Unassigned coach';
    }

    const fullName = [
      analysis.coach.firstName,
      analysis.coach.lastName
    ]
      .filter(Boolean)
      .join(' ');

    return fullName || analysis.coach.email;
  }

  trackActivityMonth(
    index: number,
    month: ActivityMonth
  ): string {
    return month.label;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private isUpcomingEvent(event: MmaEvent): boolean {
    const eventDate = this.getEventDate(event);

    if (!eventDate) {
      return this.isScheduledStatus(event.status);
    }

    const timestamp = new Date(eventDate).getTime();

    return (
      !Number.isNaN(timestamp) &&
      timestamp >= Date.now() &&
      !this.isCompletedStatus(event.status)
    );
  }

  private isCompletedStatus(
    status: string | null | undefined
  ): boolean {
    const normalizedStatus =
      status?.toUpperCase() ?? '';

    return [
      'COMPLETED',
      'FINISHED',
      'CLOSED'
    ].includes(normalizedStatus);
  }

  private isScheduledStatus(
    status: string | null | undefined
  ): boolean {
    const normalizedStatus =
      status?.toUpperCase() ?? '';

    return [
      'SCHEDULED',
      'UPCOMING',
      'PLANNED'
    ].includes(normalizedStatus);
  }

  private getEventTimestamp(
    event: MmaEvent
  ): number {
    const eventDate = this.getEventDate(event);

    if (!eventDate) {
      return 0;
    }

    const timestamp = new Date(eventDate).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  private createActivityMonths(
    events: MmaEvent[]
  ): ActivityMonth[] {
    const currentDate = new Date();

    const months = Array.from(
      { length: 8 },
      (_, index) => {
        const monthDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 7 + index,
          1
        );

        const count = events.filter(event => {
          const eventDateValue =
            this.getEventDate(event);

          if (!eventDateValue) {
            return false;
          }

          const eventDate =
            new Date(eventDateValue);

          return (
            eventDate.getFullYear() ===
              monthDate.getFullYear() &&
            eventDate.getMonth() ===
              monthDate.getMonth()
          );
        }).length;

        return {
          label: monthDate.toLocaleDateString(
            'en-US',
            {
              month: 'short'
            }
          ),
          count,
          height: 0
        };
      }
    );

    const maximumCount = Math.max(
      ...months.map(month => month.count),
      1
    );

    return months.map(month => ({
      ...month,
      height:
        month.count === 0
          ? 5
          : Math.max(
              15,
              Math.round(
                (month.count / maximumCount) * 100
              )
            )
    }));
  }
}