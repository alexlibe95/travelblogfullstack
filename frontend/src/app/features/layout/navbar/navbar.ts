import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggle } from './theme-toggle/theme-toggle';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ThemeToggle],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {}
