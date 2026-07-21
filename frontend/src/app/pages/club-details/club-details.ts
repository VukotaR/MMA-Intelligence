import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Club,
  ClubFighter
} from '../../core/models/club.model';

import { ClubsService } from '../../core/services/clubs.service';
import {
  Fighter,
  FightersService
} from '../../core/services/fighters';
import { AuthService } from '../../core/services/auth';

interface ClubForm {
  name: string;
  city: string;
  country: string;
  logo: string;
  description: string;
}

@Component({
  selector: 'app-club-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './club-details.html',
  styleUrl: './club-details.css'
})
export class ClubDetailsComponent implements OnInit {
  club: Club | null = null;
  clubId: number | null = null;

  loading = true;
  saving = false;
  deleting = false;
  loadingFighters = false;
  addingFighter = false;

  loadErrorMessage = '';
  errorMessage = '';
  successMessage = '';

  removingFighterId: number | null = null;

  showEditModal = false;
  showAddFighterModal = false;

  availableFighters: Fighter[] = [];
  selectedFighterId: number | null = null;
  fighterSearchTerm = '';

  clubForm: ClubForm = this.createEmptyClubForm();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly clubsService: ClubsService,
    private readonly fightersService: FightersService,
    private readonly cdr: ChangeDetectorRef,
    public readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id || Number.isNaN(id)) {
      this.loadErrorMessage = 'Invalid club ID.';
      this.loading = false;
      return;
    }

    this.clubId = id;
    this.loadClub(id);
  }

  loadClub(id: number): void {
    this.loading = true;
    this.loadErrorMessage = '';

    this.clubsService
      .getById(id)
      .subscribe({
        next: club => {
          this.club = club;
          this.loading = false;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.loadErrorMessage =
            error?.error?.message ||
            'Failed to load club details.';

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  canManageClub(): boolean {
    if (!this.club) {
      return false;
    }

    if (this.authService.isAdmin()) {
      return true;
    }

    const currentUserId =
      this.authService.getUserId();

    return (
      this.authService.isCoach() &&
      currentUserId !== null &&
      this.club.coach?.id === currentUserId
    );
  }

  canAddFighter(): boolean {
    return this.authService.isAdmin();
  }

  canRemoveFighter(): boolean {
    return this.canManageClub();
  }

  canDeleteClub(): boolean {
    return this.authService.isAdmin();
  }

  openEditModal(): void {
    if (!this.club || !this.canManageClub()) {
      return;
    }

    this.clubForm = {
      name: this.club.name,
      city: this.club.city,
      country: this.club.country,
      logo: this.club.logo ?? '',
      description: this.club.description ?? ''
    };

    this.errorMessage = '';
    this.successMessage = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    if (this.saving) {
      return;
    }

    this.showEditModal = false;
    this.clubForm = this.createEmptyClubForm();
  }

  saveClub(): void {
    if (
      !this.club ||
      !this.canManageClub() ||
      this.saving
    ) {
      return;
    }

    const name = this.clubForm.name.trim();
    const city = this.clubForm.city.trim();
    const country = this.clubForm.country.trim();

    if (!name || !city || !country) {
      this.errorMessage =
        'Name, city and country are required.';
      return;
    }

    const payload: Partial<Club> = {
      name,
      city,
      country,
      logo:
        this.clubForm.logo.trim() || null,
      description:
        this.clubForm.description.trim() || null
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clubsService
      .update(this.club.id, payload)
      .subscribe({
        next: updatedClub => {
          /*
           * Čuvamo postojeće relacije ukoliko backend
           * u PATCH odgovoru ne vrati coach/fighters.
           */
          this.club = {
            ...this.club!,
            ...updatedClub,
            coach:
              updatedClub.coach ??
              this.club!.coach,
            fighters:
              updatedClub.fighters ??
              this.club!.fighters
          };

          this.successMessage =
            `${this.club.name} was updated successfully.`;

          this.saving = false;
          this.showEditModal = false;
          this.clubForm =
            this.createEmptyClubForm();

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to update club.';

          this.saving = false;
          this.cdr.detectChanges();
        }
      });
  }

  openAddFighterModal(): void {
    if (!this.club || !this.canAddFighter()) {
      return;
    }

    this.selectedFighterId = null;
    this.fighterSearchTerm = '';
    this.availableFighters = [];

    this.errorMessage = '';
    this.successMessage = '';
    this.showAddFighterModal = true;

    this.loadAvailableFighters();
  }

  closeAddFighterModal(): void {
    if (
      this.loadingFighters ||
      this.addingFighter
    ) {
      return;
    }

    this.showAddFighterModal = false;
    this.availableFighters = [];
    this.selectedFighterId = null;
    this.fighterSearchTerm = '';
  }

  loadAvailableFighters(): void {
    if (!this.club) {
      return;
    }

    this.loadingFighters = true;
    this.errorMessage = '';

    this.fightersService
      .getAll(this.fighterSearchTerm)
      .subscribe({
        next: fighters => {
          const currentFighterIds = new Set(
            (this.club?.fighters ?? [])
              .map(fighter => fighter.id)
          );

          this.availableFighters =
            fighters.filter(
              fighter =>
                !currentFighterIds.has(fighter.id)
            );

          this.loadingFighters = false;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to load available fighters.';

          this.loadingFighters = false;
          this.cdr.detectChanges();
        }
      });
  }

  searchAvailableFighters(): void {
    this.selectedFighterId = null;
    this.loadAvailableFighters();
  }

  clearFighterSearch(): void {
    this.fighterSearchTerm = '';
    this.selectedFighterId = null;
    this.loadAvailableFighters();
  }

  addFighter(): void {
    if (
      !this.club ||
      !this.canAddFighter() ||
      this.addingFighter
    ) {
      return;
    }

    const fighterId =
      Number(this.selectedFighterId);

    if (!fighterId || Number.isNaN(fighterId)) {
      this.errorMessage =
        'Please select a fighter.';
      return;
    }

    const selectedFighter =
      this.availableFighters.find(
        fighter => fighter.id === fighterId
      );

    this.addingFighter = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clubsService
      .addFighter(this.club.id, fighterId)
      .subscribe({
        next: updatedClub => {
          this.club = updatedClub;

          this.successMessage =
            selectedFighter
              ? `${selectedFighter.name} was added to the club.`
              : 'Fighter was added to the club.';

          this.addingFighter = false;
          this.showAddFighterModal = false;
          this.selectedFighterId = null;
          this.availableFighters = [];

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to add fighter to club.';

          this.addingFighter = false;
          this.cdr.detectChanges();
        }
      });
  }

  removeFighter(
    fighter: ClubFighter,
    event: Event
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (
      !this.club ||
      !this.canRemoveFighter() ||
      this.removingFighterId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${fighter.name} from ${this.club.name}?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.removingFighterId = fighter.id;

    this.clubsService
      .removeFighter(
        this.club.id,
        fighter.id
      )
      .subscribe({
        next: updatedClub => {
          this.club = updatedClub;

          this.successMessage =
            `${fighter.name} was removed from the club.`;

          this.removingFighterId = null;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to remove fighter from club.';

          this.removingFighterId = null;
          this.cdr.detectChanges();
        }
      });
  }

  deleteClub(): void {
    if (
      !this.club ||
      !this.canDeleteClub() ||
      this.deleting
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete club "${this.club.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.deleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clubsService
      .delete(this.club.id)
      .subscribe({
        next: () => {
          this.deleting = false;

          this.router.navigate(
            ['/clubs'],
            {
              state: {
                successMessage:
                  `${this.club?.name} was deleted successfully.`
              }
            }
          );
        },

        error: error => {
          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete club.';

          this.deleting = false;
          this.cdr.detectChanges();
        }
      });
  }

  getCoachName(): string {
    if (!this.club?.coach) {
      return 'No coach assigned';
    }

    return (
      this.club.coach.name ||
      this.club.coach.email ||
      'Assigned coach'
    );
  }

  handleImageError(event: Event): void {
    const image =
      event.target as HTMLImageElement;

    image.style.display = 'none';
  }

  private createEmptyClubForm(): ClubForm {
    return {
      name: '',
      city: '',
      country: '',
      logo: '',
      description: ''
    };
  }
}