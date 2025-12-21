import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CarouselSlide {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() autoRotate: boolean = true;
  @Input() interval: number = 5000;
  @Output() slideChanged = new EventEmitter<number>();
  
  currentSlideIndex = 0;
  private carouselTimer: any;

  ngOnInit(): void {
    if (this.autoRotate && this.slides.length > 1) {
      this.startAutoRotation();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRotation();
  }

  startAutoRotation(): void {
    this.carouselTimer = setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }

  stopAutoRotation(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.slideChanged.emit(this.currentSlideIndex);
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.slideChanged.emit(this.currentSlideIndex);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.slideChanged.emit(this.currentSlideIndex);
    this.resetTimer();
  }

  resetTimer(): void {
    if (this.autoRotate) {
      this.stopAutoRotation();
      this.startAutoRotation();
    }
  }
}