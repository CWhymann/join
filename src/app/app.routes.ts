import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Contacts } from './components/contacts/contacts';
import { Help } from './pages/help/help';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contacts' },
      { path: 'contacts', component: Contacts },
      { path: 'help', component: Help },
    ],
  },
  { path: '**', redirectTo: 'contacts' },
];
