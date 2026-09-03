import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AddTask } from './components/add-task/add-task';
import { Contacts } from './components/contacts/contacts';
import { Help } from './pages/help/help';
import { Policy } from './pages/policy/policy';
import { Notice } from './pages/notice/notice';
import { Board } from './components/board/board';
import { Summary } from './components/summary/summary';
import { Login } from './components/login/login';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'summary', component: Summary, canActivate: [authGuard] },
            { path: 'add-task', component: AddTask, canActivate: [authGuard] },
            { path: 'contacts', component: Contacts, canActivate: [authGuard] },
            { path: 'board', component: Board, canActivate: [authGuard] },
            { path: 'help', component: Help },
            { path: 'privacy-policy', component: Policy },
            { path: 'legal-notice', component: Notice },
        ],
    },
    { path: '**', redirectTo: 'login' },
];
