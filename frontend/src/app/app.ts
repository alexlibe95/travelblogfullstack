import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './features/layout/navbar/navbar';
import { ROUTES } from './constants/routes';

@Component({  
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly router = inject(Router);
  protected readonly title = signal('travelblog-frontend');

  isHomeRoute(): boolean {
    return this.router.url === ROUTES.HOME;
  }
  isAdminRoute(): boolean {
    return this.router.url === ROUTES.ADMIN;
  }
}
