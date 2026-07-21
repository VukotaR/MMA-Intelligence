import {
  EntityAdapter,
  EntityState,
  createEntityAdapter
} from '@ngrx/entity';

import {
  createFeature,
  createReducer,
  on
} from '@ngrx/store';

import { Fighter } from '../../../../../core/services/fighters';
import { FightersActions } from './fighters.actions';

export const fightersFeatureKey = 'fighters';

export interface FightersState extends EntityState<Fighter> {
  loading: boolean;
  error: string | null;
}

export const fightersAdapter: EntityAdapter<Fighter> =
  createEntityAdapter<Fighter>({
    selectId: (fighter) => fighter.id,
    sortComparer: false
  });

export const initialFightersState: FightersState =
  fightersAdapter.getInitialState({
    loading: false,
    error: null
  });

export const fightersReducer = createReducer(
  initialFightersState,

  on(
    FightersActions.loadFighters,
    (state): FightersState => ({
      ...state,
      loading: true,
      error: null
    })
  ),

  on(
    FightersActions.loadFightersSuccess,
    (state, { fighters }): FightersState =>
      fightersAdapter.setAll(fighters, {
        ...state,
        loading: false,
        error: null
      })
  ),

  on(
    FightersActions.loadFightersFailure,
    (state, { error }): FightersState => ({
      ...state,
      loading: false,
      error
    })
  ),

  on(
    FightersActions.clearFightersError,
    (state): FightersState => ({
      ...state,
      error: null
    })
  )
);

export const fightersFeature = createFeature({
  name: fightersFeatureKey,
  reducer: fightersReducer
});