import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: true,
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
