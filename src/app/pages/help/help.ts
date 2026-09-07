import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

/** Static help page. */
@Component({
  selector: 'app-help',
  standalone: true,
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  private location = inject(Location);

  /** Returns to the previous page in the browser history. */
  goBack(): void {
    this.location.back();
  }
}
