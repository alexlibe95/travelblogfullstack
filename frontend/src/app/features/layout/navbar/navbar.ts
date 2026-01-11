import { Component, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggle } from './theme-toggle/theme-toggle';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../constants/routes';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ThemeToggle, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None,
})
export class Navbar {
  protected readonly routes = ROUTES;
  protected readonly isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
