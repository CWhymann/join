import { Component, computed, inject } from '@angular/core';
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

  private readonly loggedInItems = [
    { label: 'Summary', route: '/summary', icon: 'summary.svg' },
    { label: 'Add Task', route: '/add-task', icon: 'add-task.svg' },
    { label: 'Board', route: '/board', icon: 'board.svg' },
    { label: 'Contacts', route: '/contacts', icon: 'contacts.svg' }
  ];

  private readonly loggedOutItems = [{ label: 'Log In', route: '/login', icon: 'login.svg' }];

  protected readonly navigationItems = computed(() =>
    this.isLoggedIn() ? this.loggedInItems : this.loggedOutItems
  );
}
