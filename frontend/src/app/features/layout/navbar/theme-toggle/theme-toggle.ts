import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  protected readonly isDarkTheme = signal<boolean>(false);
  protected readonly faSun = faSun;
  protected readonly faMoon = faMoon;

  constructor() {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme.set(true);
      this.applyTheme(true);
    }

    // Watch for theme changes and apply them
    effect(() => {
      this.applyTheme(this.isDarkTheme());
      localStorage.setItem('theme', this.isDarkTheme() ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDarkTheme.update((current) => !current);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
    }
  }
}
