import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  EventsService,
  EventFight,
  EventFighter,
  MmaEvent,
  SaveFightRequest
} from '../../../../core/services/events';

@Component({
  selector: 'app-event-details',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetails implements OnInit {

  event?: MmaEvent;

  fighters: EventFighter[] = [];

  loading = true;
  fightersLoading = false;
  savingFight = false;

  errorMessage = '';
  successMessage = '';
  fightFormError = '';

  fightFormVisible = false;
  editingFight: EventFight | null = null;
  deletingFightId: number | null = null;

  fightForm: FormGroup;

  readonly fightStatuses = [
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED'
  ];

  readonly cardPositions = [
    'MAIN_EVENT',
    'CO_MAIN_EVENT',
    'MAIN_CARD',
    'PRELIMS',
    'EARLY_PRELIMS'
  ];

  readonly weightClasses = [
    'Featherweight',
    'Lightweight',
    'Welterweight',
    'Middleweight',
    'Light heavyweight',
    'Heavyweight',
  ];

  readonly fightMethods = [
    'KO',
    'TKO',
    'SUBMISSION',
    'UNANIMOUS_DECISION',
    'SPLIT_DECISION',
    'MAJORITY_DECISION',
    'DRAW',
    'NO_CONTEST',
    'DISQUALIFICATION'
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly eventsService: EventsService,
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
  ) {
    this.fightForm = this.formBuilder.group({
      redCornerId: [
        null,
        [
          Validators.required
        ]
      ],

      blueCornerId: [
        null,
        [
          Validators.required
        ]
      ],

      weightClass: [
        'LIGHTWEIGHT',
        [
          Validators.required
        ]
      ],

      status: [
        'SCHEDULED',
        [
          Validators.required
        ]
      ],

      cardPosition: [
        'MAIN_CARD',
        [
          Validators.required
        ]
      ],

      scheduledRounds: [
        3,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(5)
        ]
      ],

      cardOrder: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      titleFight: [
        false
      ],

      winnerId: [
        null
      ],

      method: [
        null
      ],

      methodDetails: [
        ''
      ],

      finishedRound: [
        null
      ],

      finishedTime: [
        ''
      ],

      youtubeUrl: [
        ''
      ],

      analysisSummary: [
        ''
      ]
    });
  }

  ngOnInit(): void {
    this.loadEvent();
  }

  private getEventId(): number {
    return Number(
      this.route.snapshot.paramMap.get('id')
    );
  }

  loadEvent(): void {
    const eventId = this.getEventId();

    if (!eventId) {
      this.errorMessage = 'Invalid event.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.eventsService.getById(eventId).subscribe({
      next: (event) => {
        this.event = event;

        if (this.event.fights) {
          this.event.fights = [
            ...this.event.fights
          ].sort(
            (firstFight, secondFight) =>
              (firstFight.cardOrder ?? 0) -
              (secondFight.cardOrder ?? 0)
          );
        }

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(error);

        this.errorMessage =
          error?.error?.message ||
          'Event could not be loaded.';

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  loadFighters(): void {
    if (this.fighters.length > 0) {
      return;
    }

    this.fightersLoading = true;

    this.eventsService.getFighters().subscribe({
      next: (fighters) => {
        this.fighters = [...fighters].sort(
          (firstFighter, secondFighter) =>
            firstFighter.name.localeCompare(
              secondFighter.name
            )
        );

        this.fightersLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(error);

        this.fightFormError =
          error?.error?.message ||
          'Fighters could not be loaded.';

        this.fightersLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  openCreateFightForm(): void {
  this.editingFight = null;

  this.successMessage = '';
  this.fightFormError = '';

  this.fightForm.reset({
    redCornerId: null,
    blueCornerId: null,
    weightClass: 'Lightweight',
    status: 'SCHEDULED',
    cardPosition: 'MAIN_CARD',
    scheduledRounds: 3,
    cardOrder: this.event?.fights?.length ?? 0,
    titleFight: false,
    winnerId: null,
    method: null,
    methodDetails: '',
    finishedRound: null,
    finishedTime: '',
    youtubeUrl: '',
    analysisSummary: ''
  });

  this.fightFormVisible = true;
  this.loadFighters();
}
openEditFightForm(
  fight: EventFight,
  event?: MouseEvent
): void {
  event?.stopPropagation();

  this.editingFight = fight;
  this.successMessage = '';
  this.fightFormError = '';

  this.fightForm.reset({
    redCornerId: fight.redCorner.id,
    blueCornerId: fight.blueCorner.id,
    weightClass: fight.weightClass,
    status: fight.status,
    cardPosition: fight.cardPosition,
    scheduledRounds: fight.scheduledRounds,
    cardOrder: fight.cardOrder ?? 0,
    titleFight: fight.titleFight,
    winnerId: fight.winner?.id ?? null,
    method: fight.method ?? null,
    methodDetails: fight.methodDetails ?? '',
    finishedRound: fight.finishedRound ?? null,
    finishedTime: fight.finishedTime ?? '',
    youtubeUrl: fight.youtubeUrl ?? '',
    analysisSummary: fight.analysisSummary ?? ''
  });

  this.fightFormVisible = true;
  this.loadFighters();
}

  closeFightForm(): void {
    if (this.savingFight) {
      return;
    }

    this.fightFormVisible = false;
    this.fightFormError = '';

    this.fightForm.reset();
  }

  submitFight(): void {
    if (!this.event) {
      this.fightFormError =
        'The event is not available.';
      return;
    }

    this.fightFormError = '';
    this.successMessage = '';

    if (this.fightForm.invalid) {
      this.fightForm.markAllAsTouched();

      this.fightFormError =
        'Please complete all required fields.';

      return;
    }

    const rawValue = this.fightForm.getRawValue();

    const redCornerId = Number(
      rawValue.redCornerId
    );

    const blueCornerId = Number(
      rawValue.blueCornerId
    );

    if (redCornerId === blueCornerId) {
      this.fightFormError =
        'Red Corner and Blue Corner must be different fighters.';

      return;
    }

    if (
      rawValue.status === 'COMPLETED' &&
      !rawValue.winnerId
    ) {
      this.fightFormError =
        'A completed fight must have a winner.';

      return;
    }

    if (
      rawValue.status === 'COMPLETED' &&
      !rawValue.method
    ) {
      this.fightFormError =
        'A completed fight must have a result method.';

      return;
    }

    if (
      rawValue.status === 'COMPLETED' &&
      !rawValue.finishedRound
    ) {
      this.fightFormError =
        'A completed fight must have a finished round.';

      return;
    }

    if (
      rawValue.status === 'COMPLETED' &&
      !rawValue.finishedTime?.trim()
    ) {
      this.fightFormError =
        'A completed fight must have a finished time.';

      return;
    }

    if (
      rawValue.finishedRound &&
      Number(rawValue.finishedRound) >
      Number(rawValue.scheduledRounds)
    ) {
      this.fightFormError =
        'Finished round cannot be greater than scheduled rounds.';

      return;
    }

    const request: SaveFightRequest = {
      eventId: this.event.id,

      redCornerId,
      blueCornerId,

      weightClass: rawValue.weightClass,
      status: rawValue.status,
      cardPosition: rawValue.cardPosition,

      scheduledRounds: Number(
        rawValue.scheduledRounds
      ),

      cardOrder: Number(
        rawValue.cardOrder
      ),

      titleFight: Boolean(
        rawValue.titleFight
      )
    };

    if (rawValue.winnerId) {
      request.winnerId = Number(
        rawValue.winnerId
      );
    }

    if (rawValue.method) {
      request.method = rawValue.method;
    }

    if (rawValue.methodDetails?.trim()) {
      request.methodDetails =
        rawValue.methodDetails.trim();
    }

    if (rawValue.finishedRound) {
      request.finishedRound = Number(
        rawValue.finishedRound
      );
    }

    if (rawValue.finishedTime?.trim()) {
      request.finishedTime =
        rawValue.finishedTime.trim();
    }

    if (rawValue.youtubeUrl?.trim()) {
      request.youtubeUrl =
        rawValue.youtubeUrl.trim();
    }

    if (rawValue.analysisSummary?.trim()) {
      request.analysisSummary =
        rawValue.analysisSummary.trim();
    }

    this.savingFight = true;

    this.savingFight = true;

const saveRequest$ = this.editingFight
  ? this.eventsService.updateFight(
      this.editingFight.id,
      request
    )
  : this.eventsService.createFight(
      request
    );

saveRequest$.subscribe({
  next: () => {
    const wasEditing = Boolean(
      this.editingFight
    );

    this.savingFight = false;
    this.fightFormVisible = false;
    this.editingFight = null;

    this.toast.success(
  'Fight created',
  'Fight created successfully.'
);

    this.loadEvent();
    this.cdr.detectChanges();
  },

  error: (error) => {
    console.error(error);

    const backendMessage =
      error?.error?.message;

    this.fightFormError =
      Array.isArray(backendMessage)
        ? backendMessage.join(' ')
        : backendMessage ||
          (
            this.editingFight
              ? 'Fight could not be updated.'
              : 'Fight could not be created.'
          );

    this.savingFight = false;
    this.cdr.detectChanges();
  }
});
  }

  deleteFight(
  fight: EventFight,
  event?: MouseEvent
): void {
  event?.stopPropagation();

  const redCorner =
    this.getFighterName(fight.redCorner);

  const blueCorner =
    this.getFighterName(fight.blueCorner);

  const confirmed = window.confirm(
    `Delete fight ${redCorner} vs ${blueCorner}?`
  );

  if (!confirmed) {
    return;
  }

  this.deletingFightId = fight.id;
  this.successMessage = '';
  this.errorMessage = '';

  this.eventsService.deleteFight(
    fight.id
  ).subscribe({
    next: () => {
      this.deletingFightId = null;

      this.successMessage =
        'Fight deleted successfully.';

      this.loadEvent();
      this.cdr.detectChanges();
    },

    error: (error) => {
      console.error(error);

      const backendMessage =
        error?.error?.message;

      this.errorMessage =
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage ||
            'Fight could not be deleted.';

      this.deletingFightId = null;
      this.cdr.detectChanges();
    }
  });
}

  isCompletedFightSelected(): boolean {
    return (
      this.fightForm.get('status')?.value ===
      'COMPLETED'
    );
  }

  getAvailableWinnerFighters():
    EventFighter[] {

    const redCornerId = Number(
      this.fightForm.get(
        'redCornerId'
      )?.value
    );

    const blueCornerId = Number(
      this.fightForm.get(
        'blueCornerId'
      )?.value
    );

    return this.fighters.filter(
      fighter =>
        fighter.id === redCornerId ||
        fighter.id === blueCornerId
    );
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  openFight(fightId: number): void {
    this.router.navigate([
      '/fights',
      fightId
    ]);
  }

  getSection(
    cardPosition: string
  ): EventFight[] {

    if (!this.event?.fights) {
      return [];
    }

    return this.event.fights
      .filter(
        fight =>
          fight.cardPosition ===
          cardPosition
      )
      .sort(
        (firstFight, secondFight) =>
          (firstFight.cardOrder ?? 0) -
          (secondFight.cardOrder ?? 0)
      );
  }

  getMainEvent():
    EventFight | undefined {

    return this.getSection(
      'MAIN_EVENT'
    )[0];
  }

  getCoMainEvent():
    EventFight | undefined {

    return this.getSection(
      'CO_MAIN_EVENT'
    )[0];
  }

  getMainCard(): EventFight[] {
    return this.getSection(
      'MAIN_CARD'
    );
  }

  getPrelims(): EventFight[] {
    return this.getSection(
      'PRELIMS'
    );
  }

  getEarlyPrelims(): EventFight[] {
    return this.getSection(
      'EARLY_PRELIMS'
    );
  }

  getFighterName(
    fighter?: EventFighter | null
  ): string {

    if (!fighter) {
      return 'Unknown Fighter';
    }

    return (
      fighter.name?.trim() ||
      'Unknown Fighter'
    );
  }

  getFighterInitials(
    fighter?: EventFighter | null
  ): string {

    return (
      this.getFighterName(fighter)
        .split(/\s+/)
        .slice(0, 2)
        .map(
          part => part.charAt(0)
        )
        .join('')
        .toUpperCase() ||
      '?'
    );
  }

  getFighterImage(
    fighter?: EventFighter | null
  ): string | null {

    return fighter?.image ?? null;
  }

  getStatusLabel(
    status: string
  ): string {

    switch (status) {
      case 'UPCOMING':
        return 'Upcoming';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }

  getFightStatusLabel(
    status: string
  ): string {

    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }

  formatDate(): string {
    if (
      !this.event?.eventDate &&
      !this.event?.date
    ) {
      return '';
    }

    const rawDate =
      this.event.eventDate ??
      this.event.date;

    const parsedDate =
      new Date(rawDate!);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    ).format(parsedDate);
  }

  getLocation(): string {
    if (!this.event) {
      return '';
    }

    return [
      this.event.venue,
      this.event.city,
      this.event.country
    ]
      .filter(Boolean)
      .join(', ');
  }

  formatWeightClass(
    weightClass: string
  ): string {

    if (!weightClass) {
      return 'Weight class not available';
    }

    return weightClass
      .toLowerCase()
      .split('_')
      .map(
        word =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  }

  formatCardPosition(
    cardPosition: string
  ): string {

    return cardPosition
      .toLowerCase()
      .split('_')
      .map(
        word =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  }

  formatFightMethod(
    method: string
  ): string {

    switch (method) {
      case 'KO':
        return 'KO';

      case 'TKO':
        return 'TKO';

      case 'SUBMISSION':
        return 'Submission';

      case 'UNANIMOUS_DECISION':
        return 'Unanimous Decision';

      case 'SPLIT_DECISION':
        return 'Split Decision';

      case 'MAJORITY_DECISION':
        return 'Majority Decision';

      case 'DRAW':
        return 'Draw';

      case 'NO_CONTEST':
        return 'No Contest';

      case 'DISQUALIFICATION':
        return 'Disqualification';

      default:
        return method;
    }
  }

  isWinner(
    fight: EventFight,
    fighter?: EventFighter | null
  ): boolean {

    return Boolean(
      fight.winner?.id &&
      fighter?.id &&
      fight.winner.id === fighter.id
    );
  }

  hasResult(
    fight: EventFight
  ): boolean {

    return Boolean(
      fight.status === 'COMPLETED' ||
      fight.winner ||
      fight.method ||
      fight.finishedRound ||
      fight.finishedTime
    );
  }
  isAdmin(): boolean {
  return this.authService.isAdmin();
}
}