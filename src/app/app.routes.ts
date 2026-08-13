import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Contacts } from './components/contacts/contacts';
import { Help } from './pages/help/help';
import { Policy } from './pages/policy/policy';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contacts' },
      { path: 'contacts', component: Contacts },
      { path: 'help', component: Help },
      { path: 'privacy-policy', component: Policy },
    ],
  },
  { path: '**', redirectTo: 'contacts' },
];
