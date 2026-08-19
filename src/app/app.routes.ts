import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Contacts } from './components/contacts/contacts';
import { Help } from './pages/help/help';
import { Policy } from './pages/policy/policy';
import { Notice } from './pages/notice/notice';
import { Board } from './components/board/board';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contacts' },
      { path: 'contacts', component: Contacts },
      { path: 'board', component: Board },
      { path: 'help', component: Help },
      { path: 'privacy-policy', component: Policy },
      { path: 'legal-notice', component: Notice },
    ],
  },
  { path: '**', redirectTo: 'contacts' },
];
