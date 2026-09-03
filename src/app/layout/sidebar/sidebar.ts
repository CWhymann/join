import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  protected readonly isLoggedIn = inject(AuthService).isLoggedIn;

  protected readonly navigationItems = [
    { label: 'Summary', route: '/summary', icon: 'summary.svg' },
    { label: 'Add Task', route: '/add-task', icon: 'add-task.svg' },
    { label: 'Board', route: '/board', icon: 'board.svg' },
    { label: 'Contacts', route: '/contacts', icon: 'contacts.svg' }
  ];
}
