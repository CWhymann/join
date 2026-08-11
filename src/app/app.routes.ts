import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { RoutePlaceholder } from './pages/route-placeholder/route-placeholder';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contacts' },
      { path: 'contacts', component: RoutePlaceholder },
    ]
  },
  { path: '**', redirectTo: 'contacts' }
];
