import { Injectable, inject } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType
} from '@ngrx/effects';

import {
  catchError,
  map,
  of,
  switchMap
} from 'rxjs';

import { FightersService } from '../../../../../core/services/fighters';
import { FightersActions } from './fighters.actions';

@Injectable()
export class FightersEffects {
  private readonly actions$ = inject(Actions);

  private readonly fightersService =
    inject(FightersService);

  loadFighters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FightersActions.loadFighters),

      switchMap(({ search }) =>
        this.fightersService.getAll(search).pipe(
          map((fighters) =>
            FightersActions.loadFightersSuccess({
              fighters
            })
          ),

          catchError((error: unknown) => {
            console.error(
              'NgRx fighters loading error:',
              error
            );

            return of(
              FightersActions.loadFightersFailure({
                error:
                  'Fighters could not be loaded. Please try again.'
              })
            );
          })
        )
      )
    )
  );
}