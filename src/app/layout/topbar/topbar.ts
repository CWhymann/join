import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar {
  private readonly supabaseService = inject(SupabaseService);

  protected isProfileMenuOpen = false;

  protected toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  protected closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  protected async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.closeProfileMenu();
  }

  @HostListener('document:click')
  protected closeProfileMenuOnOutsideClick(): void {
    this.closeProfileMenu();
  }

  @HostListener('document:keydown.escape')
  protected closeProfileMenuOnEscape(): void {
    this.closeProfileMenu();
  }
}
