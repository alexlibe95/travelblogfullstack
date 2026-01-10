import { Component, ViewEncapsulation } from '@angular/core';
import { TypingAnimation } from './typing-animation/typing-animation';

@Component({
  selector: 'app-home',
  imports: [TypingAnimation],
  templateUrl: './home.html',
  styleUrl: './home.css',
  encapsulation: ViewEncapsulation.None,
})
export class Home {}
