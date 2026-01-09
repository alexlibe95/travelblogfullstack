import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { IslandDetails } from './features/island-details/island-details';
import { Admin } from './features/admin/admin';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home - Travel Blog',
  },
  {
    path: 'admin',
    component: Admin,
    title: 'Admin - Travel Blog',
  },
  {
    path: ':id',
    component: IslandDetails,
    title: 'Island Details - Travel Blog',
  },
];
