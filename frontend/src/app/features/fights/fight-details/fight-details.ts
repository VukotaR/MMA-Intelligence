import {
    ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  Subject,
  takeUntil,
} from 'rxjs';

import {
  Fight,
  FightFighter,
} from '../../../core/models/fight.model';

import { FightsService } from '../../../core/services/fights.service';

@Component({
  selector: 'app-fight-details',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './fight-details.html',
  styleUrl: './fight-details.css',
})
export class FightDetails implements OnInit, OnDestroy {
  fight: Fight | null = null;

  loading = true;
  errorMessage = '';
  youtubeEmbedUrl: SafeResourceUrl | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fightsService: FightsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const id = Number(params.get('id'));

       if (!id || Number.isNaN(id)) {
  this.loading = false;
  this.errorMessage = 'Invalid fight ID.';

  this.cdr.detectChanges();
  return;
}

        this.loadFight(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFight(id: number): void {
  this.loading = true;
  this.errorMessage = '';

  this.fightsService
    .getById(id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (fight) => {
  this.fight = fight;

  this.youtubeEmbedUrl =
    this.createYoutubeEmbedUrl(
      fight.youtubeUrl,
    );

  this.loading = false;
  this.cdr.detectChanges();
},

      error: (error) => {
        console.error(
          'Failed to load fight:',
          error,
        );

        this.fight = null;
        this.loading = false;

        if (error?.status === 404) {
          this.errorMessage =
            'Fight was not found.';
        } else {
          this.errorMessage =
            'Unable to load fight details.';
        }

        this.cdr.detectChanges();
      },
    });
}

  goBack(): void {
    if (this.fight?.event?.id) {
      this.router.navigate([
        '/events',
        this.fight.event.id,
      ]);

      return;
    }

    this.router.navigate(['/events']);
  }

  openFighter(
    fighter: FightFighter | null | undefined,
  ): void {
    if (!fighter?.id) {
      return;
    }

    this.router.navigate([
      '/fighters',
      fighter.id,
    ]);
  }

  getFighterName(
    fighter: FightFighter | null | undefined,
  ): string {
    return fighter?.name?.trim() || 'Unknown fighter';
  }

  getFighterInitials(
    fighter: FightFighter | null | undefined,
  ): string {
    const name = this.getFighterName(fighter);

    if (name === 'Unknown fighter') {
      return 'UF';
    }

    const parts = name
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  getFighterRecord(
    fighter: FightFighter | null | undefined,
  ): string {
    if (!fighter) {
      return '0-0-0';
    }

    return `${fighter.wins ?? 0}-${
      fighter.losses ?? 0
    }-${fighter.draws ?? 0}`;
  }

  getFighterImage(
    fighter: FightFighter | null | undefined,
  ): string | null {
    const image = fighter?.image?.trim();

    return image || null;
  }

  hasFighterImage(
    fighter: FightFighter | null | undefined,
  ): boolean {
    return Boolean(this.getFighterImage(fighter));
  }

  isWinner(
    fighter: FightFighter | null | undefined,
  ): boolean {
    if (!this.fight?.winner?.id || !fighter?.id) {
      return false;
    }

    return this.fight.winner.id === fighter.id;
  }

  isCompleted(): boolean {
    return (
      this.normalizeValue(this.fight?.status) ===
      'COMPLETED'
    );
  }

  hasResult(): boolean {
    return Boolean(
      this.isCompleted() &&
        (
          this.fight?.winner ||
          this.fight?.method ||
          this.fight?.finishedRound ||
          this.fight?.finishedTime
        ),
    );
  }

  hasAnalysis(): boolean {
    return Boolean(
      this.fight?.analysisSummary?.trim(),
    );
  }

  hasYoutubeVideo(): boolean {
    return Boolean(
      this.fight?.youtubeUrl?.trim(),
    );
  }
  private createYoutubeEmbedUrl(
  url: string | null | undefined,
): SafeResourceUrl | null {
  const videoId =
    this.extractYoutubeVideoId(url);

  if (!videoId) {
    return null;
  }

  const embedUrl =
    `https://www.youtube.com/embed/${videoId}`;

  return this.sanitizer
    .bypassSecurityTrustResourceUrl(
      embedUrl,
    );
}

private extractYoutubeVideoId(
  url: string | null | undefined,
): string | null {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    const hostname = parsedUrl.hostname
      .replace(/^www\./, '')
      .toLowerCase();

    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      videoId = parsedUrl.pathname
        .split('/')
        .filter(Boolean)[0] ?? null;
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com'
    ) {
      if (
        parsedUrl.pathname === '/watch'
      ) {
        videoId =
          parsedUrl.searchParams.get('v');
      }

      if (
        parsedUrl.pathname.startsWith(
          '/embed/',
        )
      ) {
        videoId = parsedUrl.pathname
          .split('/')
          .filter(Boolean)[1] ?? null;
      }

      if (
        parsedUrl.pathname.startsWith(
          '/shorts/',
        )
      ) {
        videoId = parsedUrl.pathname
          .split('/')
          .filter(Boolean)[1] ?? null;
      }

      if (
        parsedUrl.pathname.startsWith(
          '/live/',
        )
      ) {
        videoId = parsedUrl.pathname
          .split('/')
          .filter(Boolean)[1] ?? null;
      }
    }

    if (
      videoId &&
      /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    ) {
      return videoId;
    }

    return null;
  } catch {
    return null;
  }
}

  openYoutubeVideo(): void {
    const url = this.fight?.youtubeUrl?.trim();

    if (!url) {
      return;
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    );
  }

  getEventName(): string {
    return (
      this.fight?.event?.name?.trim() ||
      'MMA Event'
    );
  }

  getEventDate(): string {
    const date = this.fight?.event?.date;

    if (!date) {
      return 'Date TBA';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(parsedDate);
  }

  getEventLocation(): string {
    const venue =
      this.fight?.event?.venue?.trim();

    const location =
      this.fight?.event?.location?.trim();

    return (
      [venue, location]
        .filter(Boolean)
        .join(', ') || 'Location TBA'
    );
  }

  getWeightClassLabel(): string {
    return this.formatEnum(
      this.fight?.weightClass,
    );
  }

  getCardPositionLabel(): string {
    return this.formatEnum(
      this.fight?.cardPosition,
    );
  }

  getFightStatusLabel(): string {
    return this.formatEnum(
      this.fight?.status,
    );
  }

  getAnalysisStatusLabel(): string {
    return this.formatEnum(
      this.fight?.analysisStatus,
    );
  }

  getMethodLabel(): string {
    return this.formatEnum(
      this.fight?.method,
    );
  }

  getScheduledRoundsLabel(): string {
    const rounds =
      this.fight?.scheduledRounds ?? 0;

    return `${rounds} ${
      rounds === 1 ? 'round' : 'rounds'
    }`;
  }

  getFinishLabel(): string {
    if (!this.hasResult()) {
      return 'Result pending';
    }

    const round =
      this.fight?.finishedRound;

    const time =
      this.fight?.finishedTime?.trim();

    if (round && time) {
      return `Round ${round} · ${time}`;
    }

    if (round) {
      return `Round ${round}`;
    }

    if (time) {
      return time;
    }

    return 'Finish time unavailable';
  }

  getChampionLabel(
    fighter: FightFighter | null | undefined,
  ): string | null {
    if (!fighter) {
      return null;
    }

    if (fighter.champion) {
      return 'Champion';
    }

    if (fighter.interimChampion) {
      return 'Interim Champion';
    }

    if (
      fighter.ranking !== undefined &&
      fighter.ranking !== null &&
      fighter.ranking > 0
    ) {
      return `#${fighter.ranking} Contender`;
    }

    return null;
  }

  getTaleValue(
    fighter: FightFighter | null | undefined,
    field:
      | 'age'
      | 'height'
      | 'reach'
      | 'weight'
      | 'stance'
      | 'fightingStyle',
  ): string {
    if (!fighter) {
      return '—';
    }

    switch (field) {
      case 'age':
        return fighter.age
          ? `${fighter.age}`
          : '—';

      case 'height':
        return fighter.height
          ? `${fighter.height} cm`
          : '—';

      case 'reach':
        return fighter.reach
          ? `${fighter.reach} cm`
          : '—';

      case 'weight':
        return fighter.weight
          ? `${fighter.weight} kg`
          : '—';

      case 'stance':
        return (
          fighter.stance?.trim() ||
          'Unknown'
        );

      case 'fightingStyle':
        return (
          fighter.fightingStyle?.trim() ||
          'Unknown'
        );

      default:
        return '—';
    }
  }

  getPercentage(
    value: number | null | undefined,
  ): number {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, Number(value)),
    );
  }

  getStatValue(
    value: number | null | undefined,
    suffix = '',
    decimals = 0,
  ): string {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return `0${suffix}`;
    }

    return `${Number(value).toFixed(
      decimals,
    )}${suffix}`;
  }

  private formatEnum(
    value: string | null | undefined,
  ): string {
    if (!value) {
      return 'Unknown';
    }

    return value
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(' ');
  }

  private normalizeValue(
    value: string | null | undefined,
  ): string {
    return value
      ?.trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase() || '';
  }
}