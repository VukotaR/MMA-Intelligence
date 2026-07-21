import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

import { Club } from '../../core/models/club.model';

import {
  ClubPayload,
  ClubsService
} from '../../core/services/clubs.service';

import {
  Coach,
  UsersService
} from '../../core/services/users.service';

import { AuthService } from '../../core/services/auth';

interface ClubForm {
  name: string;
  city: string;
  country: string;
  logo: string;
  description: string;
  coachId: number | null;
}

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './clubs.html',
  styleUrl: './clubs.css'
})
export class ClubsComponent implements OnInit {
  clubs: Club[] = [];
  coaches: Coach[] = [];

  searchTerm = '';

  loading = true;
  loadingCoaches = false;
  saving = false;

  deletingClubId: number | null = null;

  errorMessage = '';
  successMessage = '';
  coachErrorMessage = '';

  showClubModal = false;
  editingClub: Club | null = null;

  clubForm: ClubForm =
    this.createEmptyForm();

  constructor(
    private readonly clubsService: ClubsService,
    private readonly usersService: UsersService,
    private readonly cdr: ChangeDetectorRef,
    public readonly authService: AuthService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadClubs();

    if (this.isAdmin()) {
      this.loadCoaches();
    }
  }

  loadClubs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clubsService
      .getAll(this.searchTerm)
      .subscribe({
        next: clubs => {
          this.clubs = clubs;
          this.loading = false;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

         this.toast.error(
  'Error',
  'Failed to load clubs.'
);

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadCoaches(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.loadingCoaches = true;
    this.coachErrorMessage = '';

    this.usersService
      .getCoaches()
      .subscribe({
        next: coaches => {
          this.coaches = coaches;
          this.loadingCoaches = false;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.coachErrorMessage =
            error?.error?.message ||
            'Failed to load coaches.';

          this.loadingCoaches = false;
          this.cdr.detectChanges();
        }
      });
  }

  search(): void {
    this.loadClubs();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadClubs();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openAddModal(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.editingClub = null;
    this.clubForm = this.createEmptyForm();

    this.errorMessage = '';
    this.successMessage = '';
    this.coachErrorMessage = '';

    this.showClubModal = true;

    if (this.coaches.length === 0) {
      this.loadCoaches();
    }
  }

  openEditModal(
    club: Club,
    event?: Event
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.isAdmin()) {
      return;
    }

    this.editingClub = club;

    this.clubForm = {
      name: club.name,
      city: club.city,
      country: club.country,
      logo: club.logo ?? '',
      description: club.description ?? '',
      coachId: club.coach?.id ?? null
    };

    this.errorMessage = '';
    this.successMessage = '';
    this.coachErrorMessage = '';

    this.showClubModal = true;

    if (this.coaches.length === 0) {
      this.loadCoaches();
    }
  }

  closeClubModal(): void {
    if (this.saving) {
      return;
    }

    this.showClubModal = false;
    this.editingClub = null;
    this.clubForm = this.createEmptyForm();
    this.coachErrorMessage = '';
  }

  saveClub(): void {
    if (!this.isAdmin() || this.saving) {
      return;
    }

    const name = this.clubForm.name.trim();
    const city = this.clubForm.city.trim();
    const country =
      this.clubForm.country.trim();

    const coachId =
      Number(this.clubForm.coachId);

    if (!name || !city || !country) {
      this.errorMessage =
        'Name, city and country are required.';
      return;
    }

    if (
      !coachId ||
      Number.isNaN(coachId)
    ) {
     this.toast.warning(
  'Validation',
  'Please select a coach.'
);
      return;
    }

    const payload: ClubPayload = {
      name,
      city,
      country,
      coachId
    };

    const logo =
      this.clubForm.logo.trim();

    const description =
      this.clubForm.description.trim();

    if (logo) {
      payload.logo = logo;
    }

    if (description) {
      payload.description = description;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.editingClub
      ? this.clubsService.update(
          this.editingClub.id,
          payload
        )
      : this.clubsService.create(payload);

    request$.subscribe({
      next: savedClub => {
        if (this.editingClub) {
          this.clubs = this.clubs.map(
            club =>
              club.id === savedClub.id
                ? savedClub
                : club
          );

          this.toast.success(
  'Club updated',
  `${savedClub.name} was updated successfully.`
);
        } else {
          this.clubs = [
            savedClub,
            ...this.clubs
          ];

          this.toast.success(
  'Club created',
  `${savedClub.name} was created successfully.`
);
        }

        this.saving = false;
        this.showClubModal = false;
        this.editingClub = null;
        this.clubForm =
          this.createEmptyForm();

        this.cdr.detectChanges();
      },

      error: error => {
        console.error(error);

        this.toast.error(
  'Error',
  error?.error?.message ?? 'Failed to save club.'
);

        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteClub(
    club: Club,
    event?: Event
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (
      !this.isAdmin() ||
      this.deletingClubId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete club "${club.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.deletingClubId = club.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.clubsService
      .delete(club.id)
      .subscribe({
        next: () => {
          this.clubs = this.clubs.filter(
            currentClub =>
              currentClub.id !== club.id
          );

          this.toast.success(
  'Club deleted',
  `${club.name} was deleted successfully.`
);

          this.deletingClubId = null;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete club.';

          this.deletingClubId = null;
          this.cdr.detectChanges();
        }
      });
  }

  getCoachName(club: Club): string {
    if (!club.coach) {
      return 'No coach assigned';
    }

    const coach =
      club.coach as typeof club.coach & {
        firstName?: string;
        lastName?: string;
      };

    const fullName = [
      coach.firstName,
      coach.lastName
    ]
      .filter(Boolean)
      .join(' ');

    return (
      fullName ||
      coach.name ||
      coach.email ||
      'Assigned coach'
    );
  }

  getCoachOptionName(
    coach: Coach
  ): string {
    return [
      coach.firstName,
      coach.lastName
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleImageError(event: Event): void {
    const image =
      event.target as HTMLImageElement;

    image.style.display = 'none';
  }

  private createEmptyForm(): ClubForm {
    return {
      name: '',
      city: '',
      country: '',
      logo: '',
      description: '',
      coachId: null
    };
  }
}