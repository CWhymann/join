import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Contacts } from './components/contacts/contacts';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contacts' },
      { path: 'contacts', component: Contacts },
    ],
  },
  { path: '**', redirectTo: 'contacts' },
];
