import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
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

import { Router } from '@angular/router';

import {
  EventOrganization,
  EventsService,
  MmaEvent,
  SaveEventRequest
} from '../../../../core/services/events';

interface EventFightSummary {
  redCornerName: string;
  blueCornerName: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {
  events: MmaEvent[] = [];
  filteredEvents: MmaEvent[] = [];
  organizations: EventOrganization[] = [];

  loading = true;
  saving = false;
  deleting = false;

  errorMessage = '';
  formErrorMessage = '';
  successMessage = '';

  selectedStatus = 'ALL';

  formVisible = false;
  deleteModalVisible = false;

  editingEvent: MmaEvent | null = null;
  eventToDelete: MmaEvent | null = null;

  eventForm: FormGroup;

  constructor(
    private readonly eventsService: EventsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.eventForm =
      this.formBuilder.group({
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],

        organizationId: [
          null,
          Validators.required
        ],

        date: [
          '',
          Validators.required
        ],

        city: [
          '',
          Validators.required
        ],

        country: [
          '',
          Validators.required
        ],

        venue: [''],
        poster: [''],
        description: [''],

        status: [
          'UPCOMING',
          Validators.required
        ]
      });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadOrganizations();
  }

  loadEvents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.eventsService.getAll().subscribe({
      next: (response) => {
        const events = Array.isArray(response)
          ? response
          : [];

        this.events = [...events].sort(
          (first, second) =>
            this.getEventTimestamp(second) -
            this.getEventTimestamp(first)
        );

        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Error while loading events',
          error
        );

        this.events = [];
        this.filteredEvents = [];
        this.loading = false;

        this.errorMessage =
          'Events are not available';

        this.cdr.detectChanges();
      }
    });
  }

  loadOrganizations(): void {
    this.eventsService
      .getOrganizations()
      .subscribe({
        next: (organizations) => {
          this.organizations =
            Array.isArray(organizations)
              ? organizations
              : [];

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Error while loading events:',
            error
          );

          this.organizations = [];
          this.cdr.detectChanges();
        }
      });
  }

  openCreateForm(): void {
    this.editingEvent = null;
    this.formErrorMessage = '';
    this.successMessage = '';

    this.eventForm.reset({
      name: '',
      organizationId:
        this.organizations[0]?.id ?? null,
      date: '',
      city: '',
      country: '',
      venue: '',
      poster: '',
      description: '',
      status: 'UPCOMING'
    });

    this.formVisible = true;
    this.cdr.detectChanges();
  }

  openEditForm(
    event: MmaEvent,
    domEvent?: globalThis.Event
  ): void {
    domEvent?.stopPropagation();

    this.editingEvent = event;
    this.formErrorMessage = '';
    this.successMessage = '';

    this.eventForm.reset({
      name: event.name,
      organizationId:
        event.organization?.id ?? null,

      date: this.toDateTimeLocal(
        this.getRawEventDate(event)
      ),

      city: event.city ?? '',
      country: event.country ?? '',
      venue: event.venue ?? '',
      poster: this.getPosterUrl(event) ?? '',
      description: event.description ?? '',
      status: event.status ?? 'UPCOMING'
    });

    this.formVisible = true;
    this.cdr.detectChanges();
  }

  closeForm(): void {
    if (this.saving) {
      return;
    }

    this.formVisible = false;
    this.editingEvent = null;
    this.formErrorMessage = '';
    this.eventForm.reset();

    this.cdr.detectChanges();
  }

  submitEvent(): void {
    this.formErrorMessage = '';
    this.successMessage = '';

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();

      this.formErrorMessage =
        'Fill all the required fields.';

      this.cdr.detectChanges();
      return;
    }

    const rawValue = this.eventForm.getRawValue();

    const selectedDate =
      new Date(rawValue.date);

    if (
      Number.isNaN(selectedDate.getTime())
    ) {
      this.formErrorMessage =
        'Event date not valid.';

      this.cdr.detectChanges();
      return;
    }

    const request: SaveEventRequest = {
      name: rawValue.name.trim(),
      organizationId: Number(
        rawValue.organizationId
      ),

      date: selectedDate.toISOString(),

      city: rawValue.city.trim(),
      country: rawValue.country.trim(),

      venue:
        rawValue.venue?.trim() || undefined,

      poster:
        rawValue.poster?.trim() || undefined,

      description:
        rawValue.description?.trim() ||
        undefined,

      status: rawValue.status
    };

    this.saving = true;

    const operation$ = this.editingEvent
      ? this.eventsService.update(
          this.editingEvent.id,
          request
        )
      : this.eventsService.create(request);

    operation$.subscribe({
      next: () => {
        this.saving = false;

        this.successMessage =
          this.editingEvent
            ? 'Događaj je uspešno izmenjen.'
            : 'Događaj je uspešno dodat.';

        this.formVisible = false;
        this.editingEvent = null;

        this.loadEvents();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Greška prilikom čuvanja događaja:',
          error
        );

        this.saving = false;

        this.formErrorMessage =
          error?.error?.message ||
          'Čuvanje događaja nije uspelo.';

        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(
    event: MmaEvent,
    domEvent?: globalThis.Event
  ): void {
    domEvent?.stopPropagation();

    this.eventToDelete = event;
    this.deleteModalVisible = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    if (this.deleting) {
      return;
    }

    this.eventToDelete = null;
    this.deleteModalVisible = false;

    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.eventToDelete) {
      return;
    }

    this.deleting = true;

    this.eventsService
      .delete(this.eventToDelete.id)
      .subscribe({
        next: () => {
          this.deleting = false;
          this.deleteModalVisible = false;

          this.successMessage =
            'Događaj je uspešno obrisan.';

          this.eventToDelete = null;

          this.loadEvents();
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Greška prilikom brisanja događaja:',
            error
          );

          this.deleting = false;

          this.errorMessage =
            error?.error?.message ||
            'Brisanje događaja nije uspelo.';

          this.deleteModalVisible = false;
          this.eventToDelete = null;

          this.cdr.detectChanges();
        }
      });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredEvents = [
        ...this.events
      ];
    } else {
      this.filteredEvents =
        this.events.filter(
          (event) =>
            event.status ===
            this.selectedStatus
        );
    }

    this.cdr.detectChanges();
  }

  openEvent(eventId: number): void {
    this.router.navigate([
      '/events',
      eventId
    ]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getRawEventDate(
    event: MmaEvent
  ): string | null {
    return (
      event.date ??
      event.eventDate ??
      event.startDate ??
      null
    );
  }

  getEventTimestamp(
    event: MmaEvent
  ): number {
    const rawDate =
      this.getRawEventDate(event);

    if (!rawDate) {
      return 0;
    }

    const timestamp =
      new Date(rawDate).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  getEventDate(
    event: MmaEvent
  ): string {
    const rawDate =
      this.getRawEventDate(event);

    if (!rawDate) {
      return 'Datum nije naveden';
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return 'Neispravan datum';
    }

    return new Intl.DateTimeFormat(
      'sr-RS',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    ).format(date);
  }

  getEventTime(
    event: MmaEvent
  ): string {
    const rawDate =
      this.getRawEventDate(event);

    if (!rawDate) {
      return '';
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'sr-RS',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date);
  }

  getLocation(
    event: MmaEvent
  ): string {
    const parts = [
      event.venue,
      event.arena,
      event.city,
      event.country
    ].filter(
      (value): value is string =>
        typeof value === 'string' &&
        value.trim().length > 0
    );

    if (parts.length > 0) {
      return parts.join(', ');
    }

    return (
      event.location?.trim() ||
      'Lokacija nije navedena'
    );
  }

  getPosterUrl(
    event: MmaEvent
  ): string | null {
    return (
      event.poster ??
      event.posterUrl ??
      event.imageUrl ??
      null
    );
  }

  getStatusLabel(
    status: string
  ): string {
    switch (status) {
      case 'UPCOMING':
        return 'Upcoming';

      case 'COMPLETED':
        return 'Finished';

      case 'CANCELLED':
        return 'Canceled';

      default:
        return status;
    }
  }

  getMainEvent(
    event: MmaEvent
  ): EventFightSummary | null {
    const mainEvent =
      event.fights?.find(
        (fight) =>
          fight.cardPosition ===
          'MAIN_EVENT'
      );

    if (
      !mainEvent?.redCorner ||
      !mainEvent?.blueCorner
    ) {
      return null;
    }

    return {
      redCornerName:
        this.getFighterName(
          mainEvent.redCorner
        ),

      blueCornerName:
        this.getFighterName(
          mainEvent.blueCorner
        )
    };
  }

  private getFighterName(
    fighter: any
  ): string {
    return (
      fighter?.name ||
      'Unknown Fighter'
    );
  }

  private toDateTimeLocal(
    rawDate: string | null
  ): string {
    if (!rawDate) {
      return '';
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offset =
      date.getTimezoneOffset();

    const localDate =
      new Date(
        date.getTime() -
        offset * 60_000
      );

    return localDate
      .toISOString()
      .slice(0, 16);
  }
  isAdmin(): boolean {
  return this.authService.isAdmin();
}
}