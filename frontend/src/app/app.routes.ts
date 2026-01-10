import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { IslandDetails } from './features/island-details/island-details';
import { Admin } from './features/admin/admin';
import { Test } from './features/test/test';

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
    path: 'test',
    component: Test,
    title: 'API Test - Travel Blog',
  },
  {
    path: ':id',
    component: IslandDetails,
    title: 'Island Details - Travel Blog',
  },
];
