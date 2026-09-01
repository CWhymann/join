import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AddTask } from './components/add-task/add-task';
import { Contacts } from './components/contacts/contacts';
import { Help } from './pages/help/help';
import { Policy } from './pages/policy/policy';
import { Notice } from './pages/notice/notice';
import { Board } from './components/board/board';
import { Login } from './components/login/login';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'add-task', component: AddTask },
            { path: 'contacts', component: Contacts },
            { path: 'board', component: Board },
            { path: 'help', component: Help },
            { path: 'privacy-policy', component: Policy },
            { path: 'legal-notice', component: Notice },
        ],
    },
    { path: '**', redirectTo: 'login' },
];
