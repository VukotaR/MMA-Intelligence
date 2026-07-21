import { AuthService } from '../../core/services/auth';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  finalize,
  merge,
  switchMap,
  take,
  takeUntil,
  zip
} from 'rxjs';   
import {
  Fighter,
  FightersService
} from '../../core/services/fighters';
import {
  Analysis,
  AnalysisPayload,
  AnalysisService,
  AnalysisStatus
} from '../../core/services/analysis';
interface ScoreReason {
  label: string;
  description: string;
  redPoints: number;
  bluePoints: number;
}

interface ComparisonResult {
  redScore: number;
  blueScore: number;

  redProbability: number;
  blueProbability: number;

  winner: Fighter | null;
  confidence: number;

  verdict: string;
  predictedMethod: string;

  reasons: string[];
  scoreBreakdown: ScoreReason[];
}

@Component({
  selector: 'app-compare-fighters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './compare-fighters.html',
  styleUrl: './compare-fighters.css'
})
export class CompareFighters implements OnInit, OnDestroy {
  private readonly fightersService = inject(FightersService);
  private readonly router = inject(Router);
private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroySubject = new Subject<void>();
  private readonly redSelectionSubject =
  new Subject<number>();
  private readonly analysisService =
inject(AnalysisService);
private readonly authService = inject(AuthService); 
analysisFormVisible = false;
analysisSaving = false;
analysisLoading = false;

analysisSuccessMessage = '';
analysisErrorMessage = '';

savedAnalyses: Analysis[] = [];
editingAnalysis: Analysis | null = null;
get canManageAnalysis(): boolean {
  const role = this.authService.getCurrentUser()?.role;

  return role === 'ADMIN' || role === 'COACH';
}
analysisForm: AnalysisPayload = {
  title: '',
  redFighterId: 0,
  blueFighterId: 0,

  summary: '',

  redFighterStrengths: '',
  redFighterWeaknesses: '',
  blueFighterStrengths: '',
  blueFighterWeaknesses: '',

  overallStrategy: '',
  strikingStrategy: '',
  grapplingStrategy: '',
  defensiveStrategy: '',

  roundOnePlan: '',
  roundTwoPlan: '',
  roundThreePlan: '',
  championshipRoundsPlan: '',

  keyTargets: '',
  risksToAvoid: '',
  contingencyPlan: '',
  coachNotes: '',

  status: 'DRAFT'
};


private readonly blueSelectionSubject =
  new Subject<number>();

  fighters: Fighter[] = [];

  redFighterId: number | null = null;
  blueFighterId: number | null = null;

  redFighter: Fighter | null = null;
  blueFighter: Fighter | null = null;

  comparisonResult: ComparisonResult | null = null;

  loading = false;
  errorMessage = '';

  readonly weightClassOrder = [
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

  ngOnInit(): void {
    this.loadFighters();
     this.initializeSelectionStreams();
  }
  private initializeSelectionStreams(): void {
  merge(
    this.redSelectionSubject,
    this.blueSelectionSubject
  )
    .pipe(
      takeUntil(this.destroySubject)
    )
    .subscribe(() => {
      this.comparisonResult = null;
      this.errorMessage = '';
      this.changeDetectorRef.markForCheck();
    });
  this.redSelectionSubject
    .pipe(
      switchMap((fighterId: number) =>
        this.fightersService
          .getById(fighterId)
          .pipe(take(1))
      ),
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: (fighter: Fighter) => {
        this.redFighter = fighter;

        if (
          this.blueFighter &&
          !this.isBlueFighterAllowed(this.blueFighter)
        ) {
          this.blueFighterId = null;
          this.blueFighter = null;
        }

        this.changeDetectorRef.markForCheck();
      },

      error: (error: unknown) => {
        console.error(
          'Red fighter loading error:',
          error
        );

        this.errorMessage =
          'The selected fighter could not be loaded.';

        this.changeDetectorRef.markForCheck();
      }
    });
}
openAnalysisForm(): void {
  if (!this.redFighter || !this.blueFighter) {
    return;
  }

  this.editingAnalysis = null;
  this.resetAnalysisForm();

  this.analysisFormVisible = true;
  this.analysisSuccessMessage = '';
  this.analysisErrorMessage = '';

  this.changeDetectorRef.markForCheck();
}

closeAnalysisForm(): void {
  if (this.analysisSaving) {
    return;
  }

  this.analysisFormVisible = false;
  this.editingAnalysis = null;
  this.analysisErrorMessage = '';

  this.changeDetectorRef.markForCheck();
}

resetAnalysisForm(): void {
  const redName = this.redFighter?.name ?? 'Red fighter';
  const blueName = this.blueFighter?.name ?? 'Blue fighter';

  this.analysisForm = {
    title: `${redName} vs ${blueName} — Tactical Game Plan`,

    redFighterId: this.redFighter?.id ?? 0,
    blueFighterId: this.blueFighter?.id ?? 0,

    summary: '',

    redFighterStrengths: '',
    redFighterWeaknesses: '',
    blueFighterStrengths: '',
    blueFighterWeaknesses: '',

    overallStrategy: '',
    strikingStrategy: '',
    grapplingStrategy: '',
    defensiveStrategy: '',

    roundOnePlan: '',
    roundTwoPlan: '',
    roundThreePlan: '',
    championshipRoundsPlan: '',

    keyTargets: '',
    risksToAvoid: '',
    contingencyPlan: '',
    coachNotes: '',

    status: 'DRAFT'
  };
}

saveAnalysis(): void {
  if (
    !this.redFighter ||
    !this.blueFighter
  ) {
    this.analysisErrorMessage =
      'Both fighters must be selected.';

    return;
  }

  if (
    !this.analysisForm.title.trim() ||
    !this.analysisForm.summary.trim() ||
    !this.analysisForm.overallStrategy.trim()
  ) {
    this.analysisErrorMessage =
      'Title, matchup summary and overall strategy are required.';

    return;
  }

  this.analysisSaving = true;
  this.analysisErrorMessage = '';
  this.analysisSuccessMessage = '';

  const payload: AnalysisPayload = {
    ...this.analysisForm,

    title: this.analysisForm.title.trim(),

    redFighterId: this.redFighter.id,
    blueFighterId: this.blueFighter.id,

    summary: this.analysisForm.summary.trim(),
    overallStrategy:
      this.analysisForm.overallStrategy.trim()
  };

  const request$ = this.editingAnalysis
    ? this.analysisService.update(
        this.editingAnalysis.id,
        payload
      )
    : this.analysisService.create(payload);

  request$
    .pipe(
      finalize(() => {
        this.analysisSaving = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: (analysis: Analysis) => {
        this.analysisSuccessMessage =
          this.editingAnalysis
            ? 'Game plan updated successfully.'
            : 'Game plan saved successfully.';

        this.editingAnalysis = analysis;
        this.analysisFormVisible = false;

        this.loadMatchupAnalyses();

        this.changeDetectorRef.markForCheck();
      },

      error: (error: unknown) => {
        console.error(
          'Analysis saving error:',
          error
        );

        this.analysisErrorMessage =
          'The game plan could not be saved. Please try again.';

        this.changeDetectorRef.markForCheck();
      }
    });
}

publishAnalysis(): void {
  this.analysisForm.status = 'PUBLISHED';
  this.saveAnalysis();
}

saveDraft(): void {
  this.analysisForm.status = 'DRAFT';
  this.saveAnalysis();
}

loadMatchupAnalyses(): void {
  if (
    !this.redFighter ||
    !this.blueFighter
  ) {
    this.savedAnalyses = [];
    return;
  }

  this.analysisLoading = true;

  this.analysisService
    .getByMatchup(
      this.redFighter.id,
      this.blueFighter.id
    )
    .pipe(
      finalize(() => {
        this.analysisLoading = false;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: (analyses: Analysis[]) => {
        this.savedAnalyses = analyses;
        this.changeDetectorRef.markForCheck();
      },

      error: (error: unknown) => {
        console.error(
          'Analysis loading error:',
          error
        );

        this.savedAnalyses = [];
        this.changeDetectorRef.markForCheck();
      }
    });
}

editAnalysis(analysis: Analysis): void {
  this.editingAnalysis = analysis;

  this.analysisForm = {
    title: analysis.title,

    redFighterId: analysis.redFighter.id,
    blueFighterId: analysis.blueFighter.id,

    summary: analysis.summary,

    redFighterStrengths:
      analysis.redFighterStrengths ?? '',

    redFighterWeaknesses:
      analysis.redFighterWeaknesses ?? '',

    blueFighterStrengths:
      analysis.blueFighterStrengths ?? '',

    blueFighterWeaknesses:
      analysis.blueFighterWeaknesses ?? '',

    overallStrategy: analysis.overallStrategy,

    strikingStrategy:
      analysis.strikingStrategy ?? '',

    grapplingStrategy:
      analysis.grapplingStrategy ?? '',

    defensiveStrategy:
      analysis.defensiveStrategy ?? '',

    roundOnePlan:
      analysis.roundOnePlan ?? '',

    roundTwoPlan:
      analysis.roundTwoPlan ?? '',

    roundThreePlan:
      analysis.roundThreePlan ?? '',

    championshipRoundsPlan:
      analysis.championshipRoundsPlan ?? '',

    keyTargets:
      analysis.keyTargets ?? '',

    risksToAvoid:
      analysis.risksToAvoid ?? '',

    contingencyPlan:
      analysis.contingencyPlan ?? '',

    coachNotes:
      analysis.coachNotes ?? '',

    status: analysis.status
  };

  this.analysisFormVisible = true;
  this.analysisErrorMessage = '';

  this.changeDetectorRef.markForCheck();
}

deleteAnalysis(analysis: Analysis): void {
  const confirmed = window.confirm(
    `Delete "${analysis.title}"?`
  );

  if (!confirmed) {
    return;
  }

  this.analysisService
    .remove(analysis.id)
    .pipe(
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: () => {
        this.savedAnalyses =
          this.savedAnalyses.filter(
            item => item.id !== analysis.id
          );

        this.analysisSuccessMessage =
          'Game plan deleted successfully.';

        this.changeDetectorRef.markForCheck();
      },

      error: (error: unknown) => {
        console.error(
          'Analysis deletion error:',
          error
        );

        this.analysisErrorMessage =
          'The game plan could not be deleted.';

        this.changeDetectorRef.markForCheck();
      }
    });
}

getCoachName(analysis: Analysis): string {
  if (!analysis.coach) {
    return 'Unassigned coach';
  }

  return [
    analysis.coach.firstName,
    analysis.coach.lastName
  ]
    .filter(Boolean)
    .join(' ');
}

getAnalysisStatusLabel(
  status: AnalysisStatus
): string {
  return status === 'PUBLISHED'
    ? 'Published'
    : 'Draft';
}

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  loadFighters(): void {
    this.loading = true;
    this.errorMessage = '';

    this.fightersService
      .getAll()
      .pipe(
        finalize(() => {
  this.loading = false;
  this.changeDetectorRef.markForCheck();
}),
        takeUntil(this.destroySubject)
      )
      .subscribe({
       next: (fighters: Fighter[]) => {
  this.fighters = fighters;
  this.changeDetectorRef.markForCheck();
},

error: (error) => {
  console.error(error);

  this.errorMessage =
    'Fighters could not be loaded. Please try again.';

  this.changeDetectorRef.markForCheck();
}
      });
  }

  get availableRedFighters(): Fighter[] {
    if (!this.blueFighter) {
      return this.fighters;
    }

    return this.fighters.filter(
      fighter => fighter.id !== this.blueFighter?.id
    );
  }

  get availableBlueFighters(): Fighter[] {
    if (!this.redFighter) {
      return [];
    }

    const allowedClasses = this.getAllowedWeightClasses(
      this.redFighter.weightClass
    );

    return this.fighters.filter((fighter) => {
      return (
        fighter.id !== this.redFighter?.id &&
        allowedClasses.includes(fighter.weightClass)
      );
    });
  }

  get allowedWeightClassesLabel(): string {
    if (!this.redFighter) {
      return '';
    }

    return this.getAllowedWeightClasses(
      this.redFighter.weightClass
    ).join(', ');
  }

onRedFighterChange(): void {
  if (this.redFighterId === null) {
    this.redFighter = null;
    this.blueFighterId = null;
    this.blueFighter = null;
    this.comparisonResult = null;

    this.changeDetectorRef.markForCheck();
    return;
  }

  this.redSelectionSubject.next(
    Number(this.redFighterId)
  );
  this.updateComparison();
}
  onBlueFighterChange(): void {
  if (this.blueFighterId === null) {
    this.blueFighter = null;
    this.comparisonResult = null;

    this.changeDetectorRef.markForCheck();
    return;
  }

  this.blueFighter =
    this.fighters.find(
      (fighter) =>
        fighter.id === Number(this.blueFighterId)
    ) ?? null;

  this.blueSelectionSubject.next(
    Number(this.blueFighterId)
  );

  this.changeDetectorRef.markForCheck();
  this.updateComparison();
}


  resetComparison(): void {
    this.redFighterId = null;
    this.blueFighterId = null;

    this.redFighter = null;
    this.blueFighter = null;

    this.comparisonResult = null;
    this.errorMessage = '';
    this.savedAnalyses = [];
this.analysisFormVisible = false;
this.editingAnalysis = null;

this.analysisSuccessMessage = '';
this.analysisErrorMessage = '';
  }
  private updateComparison(): void {
  if (
    this.redFighterId === null ||
    this.blueFighterId === null
  ) {
    return;
  }

  zip(
    this.fightersService
      .getById(this.redFighterId)
      .pipe(take(1)),

    this.fightersService
      .getById(this.blueFighterId)
      .pipe(take(1))
  )
    .pipe(
      takeUntil(this.destroySubject)
    )
    .subscribe({
      next: ([red, blue]) => {
        this.redFighter = red;
        this.blueFighter = blue;

        this.comparisonResult =
          this.createPrediction(red, blue);

          this.loadMatchupAnalyses();

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {
        console.error(error);
      }
    });
}

  getAllowedWeightClasses(weightClass: string): string[] {
    const selectedIndex =
      this.weightClassOrder.indexOf(weightClass);

    if (selectedIndex === -1) {
      return [weightClass];
    }

    return this.weightClassOrder.slice(
      selectedIndex,
      selectedIndex + 3
    );
  }

  isBlueFighterAllowed(fighter: Fighter): boolean {
    if (!this.redFighter) {
      return false;
    }

    const allowedClasses = this.getAllowedWeightClasses(
      this.redFighter.weightClass
    );

    return allowedClasses.includes(fighter.weightClass);
  }

  getRecord(fighter: Fighter): string {
    return `${fighter.wins}-${fighter.losses}-${fighter.draws}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getRankingLabel(fighter: Fighter): string {
    if (fighter.champion) {
      return 'Champion';
    }

    if (fighter.interimChampion) {
      return 'Interim Champion';
    }

    if (fighter.ranking > 0) {
      return `#${fighter.ranking}`;
    }

    return 'Unranked';
  }

  getComparisonClass(
    redValue: number,
    blueValue: number,
    side: 'red' | 'blue',
    lowerIsBetter = false
  ): string {
    if (redValue === blueValue) {
      return 'equal-value';
    }

    let redIsBetter: boolean;

    if (lowerIsBetter) {
      redIsBetter = redValue < blueValue;
    } else {
      redIsBetter = redValue > blueValue;
    }

    if (side === 'red') {
      return redIsBetter ? 'better-value' : 'weaker-value';
    }

    return redIsBetter ? 'weaker-value' : 'better-value';
  }

  getWinnerSide(): 'red' | 'blue' | 'draw' {
    if (!this.comparisonResult?.winner) {
      return 'draw';
    }

    return this.comparisonResult.winner.id ===
      this.redFighter?.id
      ? 'red'
      : 'blue';
  }

  viewFighter(fighter: Fighter): void {
    this.router.navigate(['/fighters', fighter.id]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
  compareFighters(): void {
  if (!this.redFighter || !this.blueFighter) {
    this.errorMessage = 'Please select both fighters.';
    this.changeDetectorRef.markForCheck();
    return;
  }

  if (!this.isBlueFighterAllowed(this.blueFighter)) {
    this.errorMessage =
      'The selected opponent is outside the allowed weight classes.';

    this.changeDetectorRef.markForCheck();
    return;
  }

  this.comparisonResult = this.createPrediction(
    this.redFighter,
    this.blueFighter
  );

  this.errorMessage = '';
  this.changeDetectorRef.markForCheck();
}

  private createPrediction(
    red: Fighter,
    blue: Fighter
  ): ComparisonResult {
    const breakdown: ScoreReason[] = [];

    this.addCategory(
      breakdown,
      'Professional record',
      'Win percentage and total fight experience',
      this.calculateRecordScore(red),
      this.calculateRecordScore(blue)
    );

    this.addCategory(
      breakdown,
      'Striking',
      'Accuracy, output, defense and absorbed strikes',
      this.calculateStrikingScore(red),
      this.calculateStrikingScore(blue)
    );

    this.addCategory(
      breakdown,
      'Grappling',
      'Takedowns, takedown defense and submissions',
      this.calculateGrapplingScore(red),
      this.calculateGrapplingScore(blue)
    );

    this.addCategory(
      breakdown,
      'Physical attributes',
      'Age, height and reach advantages',
      this.calculatePhysicalScore(red, blue),
      this.calculatePhysicalScore(blue, red)
    );

    this.addCategory(
      breakdown,
      'Momentum',
      'Current winning streak',
      this.clamp(red.currentWinStreak * 1.7, 0, 10),
      this.clamp(blue.currentWinStreak * 1.7, 0, 10)
    );

    this.addCategory(
      breakdown,
      'Ranking and title status',
      'Championship status and divisional ranking',
      this.calculateStatusScore(red),
      this.calculateStatusScore(blue)
    );

    const rawRedScore = breakdown.reduce(
      (total, item) => total + item.redPoints,
      0
    );

    const rawBlueScore = breakdown.reduce(
      (total, item) => total + item.bluePoints,
      0
    );

    const redScore = Math.round(
      this.clamp(rawRedScore, 0, 100)
    );

    const blueScore = Math.round(
      this.clamp(rawBlueScore, 0, 100)
    );

    const totalScore = Math.max(redScore + blueScore, 1);

    const redProbability = Math.round(
      (redScore / totalScore) * 100
    );

    const blueProbability = 100 - redProbability;

    const scoreDifference = Math.abs(redScore - blueScore);

    let winner: Fighter | null = null;
    let verdict = '';

    if (scoreDifference <= 2) {
      verdict = 'Too close to call';
    } else if (redScore > blueScore) {
      winner = red;
      verdict = `${red.name} has the statistical advantage`;
    } else {
      winner = blue;
      verdict = `${blue.name} has the statistical advantage`;
    }

    const confidence = winner
      ? Math.round(
          this.clamp(
            52 + scoreDifference * 2.2,
            52,
            95
          )
        )
      : 50;

    const reasons = this.buildReasons(
      breakdown,
      red,
      blue,
      winner
    );

    return {
      redScore,
      blueScore,
      redProbability,
      blueProbability,
      winner,
      confidence,
      verdict,
      predictedMethod: this.predictMethod(
        winner,
        red,
        blue
      ),
      reasons,
      scoreBreakdown: breakdown
    };
  }

  private calculateRecordScore(fighter: Fighter): number {
    const totalFights =
      fighter.wins +
      fighter.losses +
      fighter.draws;

    const winRate =
      totalFights > 0
        ? fighter.wins / totalFights
        : 0;

    const experienceScore = this.clamp(
      totalFights / 3,
      0,
      8
    );

    return this.clamp(
      winRate * 14 + experienceScore,
      0,
      22
    );
  }

  private calculateStrikingScore(fighter: Fighter): number {
    const accuracy =
      this.clamp(fighter.strikingAccuracy, 0, 100) *
      0.07;

    const defense =
      this.clamp(fighter.strikingDefense, 0, 100) *
      0.065;

    const output =
      this.clamp(
        fighter.significantStrikesPerMinute,
        0,
        10
      ) * 0.75;

    const absorbedPenalty =
      this.clamp(
        fighter.significantStrikesAbsorbedPerMinute,
        0,
        10
      ) * 0.45;

    return this.clamp(
      accuracy + defense + output - absorbedPenalty,
      0,
      20
    );
  }

  private calculateGrapplingScore(fighter: Fighter): number {
    const takedownAccuracy =
      this.clamp(fighter.takedownAccuracy, 0, 100) *
      0.06;

    const takedownDefense =
      this.clamp(fighter.takedownDefense, 0, 100) *
      0.055;

    const takedownOutput =
      this.clamp(fighter.takedownsPer15, 0, 10) *
      0.65;

    const submissionThreat =
      this.clamp(fighter.submissionAverage, 0, 10) *
      0.75;

    return this.clamp(
      takedownAccuracy +
        takedownDefense +
        takedownOutput +
        submissionThreat,
      0,
      18
    );
  }

  private calculatePhysicalScore(
    fighter: Fighter,
    opponent: Fighter
  ): number {
    let score = 5;

    const reachDifference =
      fighter.reach - opponent.reach;

    const heightDifference =
      fighter.height - opponent.height;

    score += this.clamp(
      reachDifference * 0.18,
      -2,
      2
    );

    score += this.clamp(
      heightDifference * 0.08,
      -1,
      1
    );

    score += this.calculateAgePrimeScore(fighter.age);

    return this.clamp(score, 0, 12);
  }

  private calculateAgePrimeScore(age: number): number {
    if (age >= 27 && age <= 33) {
      return 3;
    }

    if (
      (age >= 24 && age <= 26) ||
      (age >= 34 && age <= 36)
    ) {
      return 2;
    }

    if (
      (age >= 21 && age <= 23) ||
      (age >= 37 && age <= 39)
    ) {
      return 1;
    }

    return 0;
  }

  private calculateStatusScore(fighter: Fighter): number {
    if (fighter.champion) {
      return 18;
    }

    if (fighter.interimChampion) {
      return 15;
    }

    if (fighter.ranking > 0) {
      return this.clamp(
        13 - fighter.ranking * 0.75,
        2,
        13
      );
    }

    return 1;
  }

  private predictMethod(
    winner: Fighter | null,
    red: Fighter,
    blue: Fighter
  ): string {
    if (!winner) {
      return 'No clear method predicted';
    }

    const opponent =
      winner.id === red.id ? blue : red;

    const totalWins = Math.max(winner.wins, 1);

    const koRate = winner.koWins / totalWins;
    const submissionRate =
      winner.submissionWins / totalWins;
    const decisionRate =
      winner.decisionWins / totalWins;

    const strikingAdvantage =
      winner.strikingAccuracy +
      winner.significantStrikesPerMinute -
      opponent.strikingDefense * 0.35;

    const grapplingAdvantage =
      winner.takedownAccuracy +
      winner.submissionAverage * 8 -
      opponent.takedownDefense * 0.35;

    if (
      koRate >= submissionRate &&
      koRate >= decisionRate &&
      strikingAdvantage > 20
    ) {
      return `${winner.name} by KO/TKO`;
    }

    if (
      submissionRate > koRate &&
      submissionRate >= decisionRate &&
      grapplingAdvantage > 15
    ) {
      return `${winner.name} by submission`;
    }

    return `${winner.name} by decision`;
  }

  private buildReasons(
    breakdown: ScoreReason[],
    red: Fighter,
    blue: Fighter,
    winner: Fighter | null
  ): string[] {
    if (!winner) {
      return [
        'The overall statistical scores are nearly identical.',
        'Neither fighter has a decisive advantage across the main categories.',
        'Small tactical details could determine the outcome.'
      ];
    }

    const winnerIsRed = winner.id === red.id;

    const sortedAdvantages = breakdown
      .map(item => {
        const difference = winnerIsRed
          ? item.redPoints - item.bluePoints
          : item.bluePoints - item.redPoints;

        return {
          label: item.label,
          difference
        };
      })
      .filter(item => item.difference > 0.5)
      .sort(
        (first, second) =>
          second.difference - first.difference
      )
      .slice(0, 4);

    const reasons = sortedAdvantages.map(item => {
      return `${winner.name} has the advantage in ${item.label.toLowerCase()}.`;
    });

    if (winner.champion) {
      reasons.unshift(
        `${winner.name} receives an advantage for current championship status.`
      );
    } else if (winner.interimChampion) {
      reasons.unshift(
        `${winner.name} receives an advantage for interim championship status.`
      );
    }

    return reasons.slice(0, 5);
  }

  private addCategory(
    breakdown: ScoreReason[],
    label: string,
    description: string,
    redPoints: number,
    bluePoints: number
  ): void {
    breakdown.push({
      label,
      description,
      redPoints: Number(redPoints.toFixed(1)),
      bluePoints: Number(bluePoints.toFixed(1))
    });
  }

  private clamp(
    value: number,
    minimum: number,
    maximum: number
  ): number {
    return Math.min(
      Math.max(value, minimum),
      maximum
    );
  }
}