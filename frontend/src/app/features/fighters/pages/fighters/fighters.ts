import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil
} from 'rxjs';

import {
  Fighter,
  FighterPayload,
  FightersService
} from '../../../../core/services/fighters';

@Component({
  selector: 'app-fighters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './fighters.html',
  styleUrl: './fighters.css'
})
export class Fighters implements OnInit, OnDestroy {
  private readonly fightersService = inject(FightersService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  fighters: Fighter[] = [];

  searchTerm = '';

  selectedWeightClass = 'All';

  sortBy = 'ranking';

  sortOrder: 'asc' | 'desc' = 'asc';

 readonly weightClasses = [
  'All',
  'Strawweight',
  'Flyweight',
  'Bantamweight',
  'Featherweight',
  'Lightweight',
  'Welterweight',
  'Middleweight',
  'Light Heavyweight',
  'Heavyweight'
];
  loading = false;
  saving = false;

  errorMessage = '';
  formErrorMessage = '';

  deletingId: number | null = null;

  modalOpen = false;
  editingFighter: Fighter | null = null;

  private readonly searchSubject = new Subject<string>();
  private readonly destroySubject = new Subject<void>();

  fighterForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2)
      ]
    ],

    nickname: [''],

    country: [
      '',
      [
        Validators.required,
        Validators.minLength(2)
      ]
    ],

    age: [
      18,
      [
        Validators.required,
        Validators.min(18),
        Validators.max(60)
      ]
    ],

    height: [
      170,
      [
        Validators.required,
        Validators.min(140),
        Validators.max(230)
      ]
    ],

    weight: [
      70,
      [
        Validators.required,
        Validators.min(45),
        Validators.max(180)
      ]
    ],
    weightClass: ['Lightweight'],

    reach: [
      170,
      [
        Validators.min(120),
        Validators.max(250)
      ]
    ],

    stance: [''],
    fightingStyle: [''],

    image: [
      '',
      [
        Validators.pattern(/^https?:\/\/.+/i)
      ]
    ],

    bio: [''],

    wins: [0, Validators.min(0)],
    losses: [0, Validators.min(0)],
    draws: [0, Validators.min(0)],

    koWins: [0, Validators.min(0)],
    submissionWins: [0, Validators.min(0)],
    decisionWins: [0, Validators.min(0)],
    currentWinStreak: [0, Validators.min(0)],

    strikingAccuracy: [
      0,
      [
        Validators.min(0),
        Validators.max(100)
      ]
    ],

    strikingDefense: [
      0,
      [
        Validators.min(0),
        Validators.max(100)
      ]
    ],

    significantStrikesPerMinute: [
      0,
      Validators.min(0)
    ],

    significantStrikesAbsorbedPerMinute: [
      0,
      Validators.min(0)
    ],

    takedownAccuracy: [
      0,
      [
        Validators.min(0),
        Validators.max(100)
      ]
    ],

    takedownDefense: [
      0,
      [
        Validators.min(0),
        Validators.max(100)
      ]
    ],

    takedownsPer15: [
      0,
      Validators.min(0)
    ],

    submissionAverage: [
      0,
      Validators.min(0)
    ],

    ranking: [
      1,
      Validators.min(1)
    ],

    champion: [false],
    interimChampion: [false]
  });

  ngOnInit(): void {
    this.loadFighters();

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroySubject)
      )
      .subscribe((search) => {
        this.loadFighters(search);
      });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();

    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.modalOpen && !this.saving) {
      this.closeModal();
    }
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadFighters('');
  }

  loadFighters(search = this.searchTerm): void {
  this.loading = true;
  this.errorMessage = '';
  this.changeDetectorRef.markForCheck();

  const start = Date.now();

  this.fightersService
    .getAll(search)
    .pipe(
      finalize(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 350 - elapsed);

        setTimeout(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }, remaining);
      }),
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: (fighters: Fighter[]) => {
        this.fighters = fighters;
        this.changeDetectorRef.markForCheck();
      },

      error: (error: unknown) => {
        console.error('Fighters loading error:', error);

        this.errorMessage =
          'Fighters could not be loaded. Please try again.';

        this.changeDetectorRef.markForCheck();
      }
    });
  } 

  addFighter(): void {
    this.editingFighter = null;
    this.formErrorMessage = '';

    this.fighterForm.reset({
      name: '',
      nickname: '',
      country: '',
      age: 18,
      height: 170,
      weight: 70,
      weightClass: 'Lightweight',
      reach: 170,
      stance: '',
      fightingStyle: '',
      image: '',
      bio: '',

      wins: 0,
      losses: 0,
      draws: 0,
      koWins: 0,
      submissionWins: 0,
      decisionWins: 0,
      currentWinStreak: 0,

      strikingAccuracy: 0,
      strikingDefense: 0,
      significantStrikesPerMinute: 0,
      significantStrikesAbsorbedPerMinute: 0,

      takedownAccuracy: 0,
      takedownDefense: 0,
      takedownsPer15: 0,
      submissionAverage: 0,

      ranking: 1,
      champion: false,
      interimChampion: false
    });

    this.openModal();
  }

  editFighter(fighter: Fighter): void {
    this.editingFighter = fighter;
    this.formErrorMessage = '';

    this.fighterForm.reset({
      name: fighter.name,
      nickname: fighter.nickname ?? '',
      country: fighter.country,
      age: fighter.age,
      height: fighter.height,
      weight: fighter.weight,
      weightClass: fighter.weightClass ?? 'Lightweight',
      reach: fighter.reach ?? 170,
      stance: fighter.stance ?? '',
      fightingStyle: fighter.fightingStyle ?? '',
      image: fighter.image ?? '',
      bio: fighter.bio ?? '',

      wins: fighter.wins ?? 0,
      losses: fighter.losses ?? 0,
      draws: fighter.draws ?? 0,
      koWins: fighter.koWins ?? 0,
      submissionWins: fighter.submissionWins ?? 0,
      decisionWins: fighter.decisionWins ?? 0,
      currentWinStreak: fighter.currentWinStreak ?? 0,

      strikingAccuracy: fighter.strikingAccuracy ?? 0,
      strikingDefense: fighter.strikingDefense ?? 0,
      significantStrikesPerMinute:
        fighter.significantStrikesPerMinute ?? 0,
      significantStrikesAbsorbedPerMinute:
        fighter.significantStrikesAbsorbedPerMinute ?? 0,

      takedownAccuracy: fighter.takedownAccuracy ?? 0,
      takedownDefense: fighter.takedownDefense ?? 0,
      takedownsPer15: fighter.takedownsPer15 ?? 0,
      submissionAverage: fighter.submissionAverage ?? 0,

      ranking: fighter.ranking > 0 ? fighter.ranking : 1,
      champion: fighter.champion ?? false,
      interimChampion: fighter.interimChampion ?? false
    });

    this.openModal();
  }

  private openModal(): void {
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.editingFighter = null;
    this.formErrorMessage = '';
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
saveFighter(): void {
  if (this.fighterForm.invalid) {
    this.fighterForm.markAllAsTouched();

    this.formErrorMessage =
      'Please correct the marked fields.';

    this.changeDetectorRef.markForCheck();
    return;
  }

  this.saving = true;
  this.formErrorMessage = '';
  this.changeDetectorRef.markForCheck();

  const start = Date.now();
  const wasEditing = !!this.editingFighter;

  const payload = this.buildPayload();

  const request$ = this.editingFighter
    ? this.fightersService.update(
        this.editingFighter.id,
        payload
      )
    : this.fightersService.create(payload);

  request$
    .pipe(
      finalize(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        }, remaining);
      }),
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: (savedFighter: Fighter) => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          if (wasEditing) {
            this.fighters = this.fighters.map((fighter) =>
              fighter.id === savedFighter.id
                ? savedFighter
                : fighter
            );
          } else {
            this.fighters = [
              savedFighter,
              ...this.fighters
            ];
          }

          this.modalOpen = false;
          this.editingFighter = null;
          this.formErrorMessage = '';

          document.body.style.overflow = '';

          if (wasEditing) {
            this.toastService.success(
              'Fighter updated',
              `${savedFighter.name} was updated successfully.`
            );
          } else {
            this.toastService.success(
              'Fighter added',
              `${savedFighter.name} was added successfully.`
            );
          }

          this.changeDetectorRef.markForCheck();
        }, remaining);
      },

      error: (error: any) => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          console.error('Fighter save error:', error);

          const backendMessage = error?.error?.message;

          this.formErrorMessage = Array.isArray(backendMessage)
            ? backendMessage.join(', ')
            : backendMessage ||
              'The fighter could not be saved.';

          this.toastService.error(
            'Save failed',
            this.formErrorMessage
          );

          this.changeDetectorRef.markForCheck();
        }, remaining);
      }
    });
}

  private buildPayload(): FighterPayload {
    const value = this.fighterForm.getRawValue();

    return {
      name: value.name.trim(),
      country: value.country.trim(),
      age: Number(value.age),
      height: Number(value.height),
      weight: Number(value.weight),
weightClass: value.weightClass,
      nickname: this.optionalString(value.nickname),
      reach: Number(value.reach),
      stance: this.optionalString(value.stance),
      fightingStyle: this.optionalString(value.fightingStyle),
      image: this.optionalString(value.image),
      bio: this.optionalString(value.bio),

      wins: Number(value.wins),
      losses: Number(value.losses),
      draws: Number(value.draws),
      koWins: Number(value.koWins),
      submissionWins: Number(value.submissionWins),
      decisionWins: Number(value.decisionWins),
      currentWinStreak: Number(value.currentWinStreak),

      strikingAccuracy: Number(value.strikingAccuracy),
      strikingDefense: Number(value.strikingDefense),
      significantStrikesPerMinute:
        Number(value.significantStrikesPerMinute),
      significantStrikesAbsorbedPerMinute:
        Number(value.significantStrikesAbsorbedPerMinute),

      takedownAccuracy: Number(value.takedownAccuracy),
      takedownDefense: Number(value.takedownDefense),
      takedownsPer15: Number(value.takedownsPer15),
      submissionAverage: Number(value.submissionAverage),

      ranking: Number(value.ranking),
      champion: Boolean(value.champion),
      interimChampion: Boolean(value.interimChampion)
    };
  }

  private optionalString(value: string): string | undefined {
    const trimmedValue = value.trim();

    return trimmedValue || undefined;
  }

  viewFighter(fighter: Fighter): void {
  this.router.navigate(['/fighters', fighter.id]);
}

deleteFighter(): void {
  const fighter = this.fighterToDelete;

  if (!fighter) {
    return;
  }

  this.deletingId = fighter.id;
  this.errorMessage = '';
  this.changeDetectorRef.markForCheck();

  const start = Date.now();

  this.fightersService
    .delete(fighter.id)
    .pipe(
      finalize(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 450 - elapsed);

        setTimeout(() => {
          this.deletingId = null;
          this.changeDetectorRef.markForCheck();
        }, remaining);
      }),
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: () => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 450 - elapsed);

        setTimeout(() => {
          this.fighters = this.fighters.filter(
            (item) => item.id !== fighter.id
          );

          this.toastService.success(
            'Fighter deleted',
            `${fighter.name} was deleted successfully.`
          );

          this.fighterToDelete = null;
          document.body.style.overflow = '';

          this.changeDetectorRef.markForCheck();
        }, remaining);
      },

      error: (error: unknown) => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 450 - elapsed);

        setTimeout(() => {
          console.error('Fighter deletion error:', error);

          this.errorMessage =
            'The fighter could not be deleted.';

          this.toastService.error(
            'Delete failed',
            this.errorMessage
          );

          this.changeDetectorRef.markForCheck();
        }, remaining);
      }
    });
}

  isInvalid(controlName: string): boolean {
    const control = this.fighterForm.get(controlName);

    return Boolean(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
  fighterToDelete: Fighter | null = null;
  openDeleteModal(fighter: Fighter): void {
  this.fighterToDelete = fighter;
  document.body.style.overflow = 'hidden';
  this.changeDetectorRef.markForCheck();
}

closeDeleteModal(): void {
  if (this.deletingId !== null) {
    return;
  }

  this.fighterToDelete = null;
  document.body.style.overflow = '';
  this.changeDetectorRef.markForCheck();
}

  getRecord(fighter: Fighter): string {
    return `${fighter.wins}-${fighter.losses}-${fighter.draws}`;
  }

  getRankingLabel(fighter: Fighter): string {
    if (fighter.champion) {
      return 'Champion';
    }

    if (fighter.interimChampion) {
      return 'Interim champion';
    }

    if (fighter.ranking > 0) {
      return `#${fighter.ranking}`;
    }

    return 'Unranked';
  }
get filteredFighters(): Fighter[] {
  let fighters = [...this.fighters];

  if (this.selectedWeightClass !== 'All') {
    fighters = fighters.filter(
      fighter =>
        fighter.weightClass === this.selectedWeightClass
    );
  }

  fighters.sort((a, b) => {
    let comparison = 0;

    switch (this.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;

      case 'ranking':
        comparison = a.ranking - b.ranking;
        break;

      case 'wins':
        comparison = b.wins - a.wins;
        break;

      case 'age':
        comparison = a.age - b.age;
        break;
    }

    return this.sortOrder === 'asc'
      ? comparison
      : -comparison;
  });

  return fighters;
}
isAdmin(): boolean {
  return this.authService.isAdmin();
}
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
