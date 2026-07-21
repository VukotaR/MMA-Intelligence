import { createSelector } from '@ngrx/store';

import {
  fightersAdapter,
  fightersFeature
} from './fighters.reducer';

const entitySelectors = fightersAdapter.getSelectors();

export const selectFightersState =
  fightersFeature.selectFightersState;

export const selectAllFighters = createSelector(
  selectFightersState,
  entitySelectors.selectAll
);

export const selectFightersEntities = createSelector(
  selectFightersState,
  entitySelectors.selectEntities
);

export const selectFightersTotal = createSelector(
  selectFightersState,
  entitySelectors.selectTotal
);

export const selectFightersLoading =
  fightersFeature.selectLoading;

export const selectFightersError =
  fightersFeature.selectError;