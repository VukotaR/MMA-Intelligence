import { Routes } from '@angular/router';
import { ClubsComponent } from './pages/clubs/clubs';
import { ClubDetailsComponent } from './pages/club-details/club-details';
import {
  authGuard
} from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import(
        './features/auth/pages/login/login'
      ).then(
        (component) => component.Login
      )
  },
  {
  path: 'register',
  loadComponent: () =>
    import(
      './features/auth/pages/register/register'
    ).then(
      component => component.Register
    )
},
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/dashboard/pages/dashboard/dashboard'
      ).then(
        (component) => component.Dashboard
      )
  },
  {
    path: 'fighters',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/fighters/pages/fighters/fighters'
      ).then(
        (component) => component.Fighters
      )
  },
  {
    path: 'fighters/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/fighters/pages/fighter-details/fighter-details'
      ).then(
        (component) =>
          component.FighterDetails
      )
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/events/pages/events/events'
      ).then(
        (component) => component.Events
      )
  },
  {
  path: 'events/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import(
      './features/events/pages/event-details/event-details'
    ).then(
      component => component.EventDetails
    )
},
{
  path: 'fights/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import(
      './features/fights/fight-details/fight-details'
    ).then(
      (component) => component.FightDetails
    )
},
{
  path: 'compare',
  canActivate: [authGuard],
  loadComponent: () =>
    import(
      './features/compare-fighters/compare-fighters'
    ).then(
      c => c.CompareFighters
    )
},
{
  path: 'clubs',
  canActivate: [authGuard],
  component: ClubsComponent
},
{
  path: 'clubs/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/club-details/club-details')
      .then(
        module =>
          module.ClubDetailsComponent
      )
},
  {
    path: '**',
    redirectTo: 'login'
  }
];