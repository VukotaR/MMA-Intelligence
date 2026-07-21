import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Fighter } from '../../../../../core/services/fighters';

export const FightersActions = createActionGroup({
  source: 'Fighters',
  events: {
    'Load Fighters': props<{
      search: string;
    }>(),

    'Load Fighters Success': props<{
      fighters: Fighter[];
    }>(),

    'Load Fighters Failure': props<{
      error: string;
    }>(),

    'Clear Fighters Error': emptyProps()
  }
});