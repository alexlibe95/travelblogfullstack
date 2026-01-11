import { Component, ViewEncapsulation, signal, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-animation',
  imports: [CommonModule],
  templateUrl: './typing-animation.html',
  styleUrl: './typing-animation.css',
  encapsulation: ViewEncapsulation.None,
})
export class TypingAnimation implements OnInit, OnDestroy {
  private readonly defaultPhrases = [
    'Live your dream vacation in Greece',
    'Discover the magic of Santorini',
    'Explore the beauty of Mykonos',
    'Experience paradise in Crete',
    'Sail through the Greek Islands',
    'Find your perfect island escape',
    'Adventure awaits in Rhodes',
    'Unwind in the Aegean Sea',
    'Discover hidden gems in Paros',
    'Experience authentic Greek culture',
  ];

  @Input() phrases: string[] = this.defaultPhrases;
  @Input() typingSpeed = 80; // milliseconds per character
  @Input() deletingSpeed = 50; // milliseconds per character (faster when deleting)
  @Input() pauseBeforeDelete = 2000; // pause before starting to delete (2 seconds)
  @Input() pauseBeforeRetype = 500; // pause before retyping (0.5 seconds)

  protected readonly displayedText = signal<string>('');

  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private isDeleting = false;
  private currentIndex = 0;
  private currentPhraseIndex = 0;
  private currentPhrase = '';

  ngOnInit(): void {
    if (this.phrases.length > 0) {
      this.currentPhrase = this.phrases[0];
      this.startTypingAnimation();
    }
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private startTypingAnimation(): void {
    if (this.isDeleting) {
      // Deleting phase
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.displayedText.set(this.currentPhrase.slice(0, this.currentIndex));
        this.typingTimeout = setTimeout(() => this.startTypingAnimation(), this.deletingSpeed);
      } else {
        // Finished deleting, move to next phrase
        this.isDeleting = false;
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        this.currentPhrase = this.phrases[this.currentPhraseIndex];
        this.typingTimeout = setTimeout(() => {
          this.currentIndex = 0;
          this.startTypingAnimation();
        }, this.pauseBeforeRetype);
      }
    } else {
      // Typing phase
      if (this.currentIndex < this.currentPhrase.length) {
        this.displayedText.set(this.currentPhrase.slice(0, this.currentIndex + 1));
        this.currentIndex++;
        this.typingTimeout = setTimeout(() => this.startTypingAnimation(), this.typingSpeed);
      } else {
        // Finished typing, wait then start deleting
        this.typingTimeout = setTimeout(() => {
          this.isDeleting = true;
          this.startTypingAnimation();
        }, this.pauseBeforeDelete);
      }
    }
  }
}
