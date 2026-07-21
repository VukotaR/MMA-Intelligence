import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Subject,
  finalize,
  takeUntil
} from 'rxjs';

import {
  Fighter,
  FightersService
} from '../../../../core/services/fighters';

import {
  Fight,
  FightsService
} from '../../../../core/services/fights';

@Component({
  selector: 'app-fighter-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fighter-details.html',
  styleUrl: './fighter-details.css'
})
export class FighterDetails implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly fightersService =
    inject(FightersService);

  private readonly fightsService =
    inject(FightsService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  private readonly destroySubject =
    new Subject<void>();

  fighter: Fighter | null = null;

  fights: Fight[] = [];

  loading = false;
  fightsLoading = false;

  errorMessage = '';
  fightsErrorMessage = '';

  ngOnInit(): void {
    const fighterId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!fighterId || Number.isNaN(fighterId)) {
      this.errorMessage = 'Invalid fighter ID.';
      return;
    }

    this.loadFighter(fighterId);
    this.loadFightHistory(fighterId);
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  loadFighter(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.changeDetectorRef.markForCheck();

    this.fightersService
      .getById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroySubject)
      )
      .subscribe({
        next: (fighter: Fighter) => {
          this.fighter = fighter;
          this.changeDetectorRef.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Fighter loading error:',
            error
          );

          this.errorMessage =
            'Fighter details could not be loaded.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  loadFightHistory(
    fighterId: number
  ): void {
    this.fightsLoading = true;
    this.fightsErrorMessage = '';

    this.fightsService
      .getByFighter(fighterId)
      .pipe(
        finalize(() => {
          this.fightsLoading = false;
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroySubject)
      )
      .subscribe({
        next: (fights: Fight[]) => {
          this.fights = fights;
          this.changeDetectorRef.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Fight history loading error:',
            error
          );

          this.fights = [];

          this.fightsErrorMessage =
            'Fight history could not be loaded.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/fighters']);
  }

  editFighter(): void {
    if (!this.fighter) {
      return;
    }

    this.router.navigate(['/fighters'], {
      queryParams: {
        edit: this.fighter.id
      }
    });
  }

  openFight(fightId: number): void {
    this.router.navigate([
      '/fights',
      fightId
    ]);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  getRecord(): string {
    if (!this.fighter) {
      return '0-0-0';
    }

    return `${this.fighter.wins}-${this.fighter.losses}-${this.fighter.draws}`;
  }

  getRankingLabel(): string {
    if (!this.fighter) {
      return 'Unranked';
    }

    if (this.fighter.champion) {
      return 'Champion';
    }

    if (this.fighter.interimChampion) {
      return 'Interim champion';
    }

    if (this.fighter.ranking > 0) {
      return `#${this.fighter.ranking}`;
    }

    return 'Unranked';
  }

  getFinishWins(): number {
    if (!this.fighter) {
      return 0;
    }

    return (
      (this.fighter.koWins ?? 0) +
      (this.fighter.submissionWins ?? 0)
    );
  }

  getFinishRate(): number {
    if (
      !this.fighter ||
      this.fighter.wins <= 0
    ) {
      return 0;
    }

    return Math.round(
      (
        this.getFinishWins() /
        this.fighter.wins
      ) * 100
    );
  }

  getOpponent(
    fight: Fight
  ): Fighter | null {
    if (!this.fighter) {
      return null;
    }

    if (
      fight.redCorner.id ===
      this.fighter.id
    ) {
      return fight.blueCorner;
    }

    return fight.redCorner;
  }

  getFightResult(
    fight: Fight
  ): 'WIN' | 'LOSS' | 'DRAW' | 'UPCOMING' {
    if (
      fight.status === 'SCHEDULED'
    ) {
      return 'UPCOMING';
    }

    if (!fight.winner) {
      return 'DRAW';
    }

    if (
      fight.winner.id ===
      this.fighter?.id
    ) {
      return 'WIN';
    }

    return 'LOSS';
  }

  getFightResultClass(
    fight: Fight
  ): string {
    return this
      .getFightResult(fight)
      .toLowerCase();
  }

  formatFightMethod(
    method?: string | null
  ): string {
    if (!method) {
      return 'Result unavailable';
    }

    return method
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );
  }

  formatEventDate(
    date?: string
  ): string {
    if (!date) {
      return 'Date unavailable';
    }

    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(new Date(date));
  }

  trackFightById(
    index: number,
    fight: Fight
  ): number {
    return fight.id;
  }
}