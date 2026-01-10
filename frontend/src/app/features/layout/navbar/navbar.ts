import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggle } from './theme-toggle/theme-toggle';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ThemeToggle],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None
})
export class Navbar {}
