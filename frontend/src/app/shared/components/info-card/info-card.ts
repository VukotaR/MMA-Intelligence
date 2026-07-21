import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-card.html',
  styleUrl: './info-card.css'
})
export class InfoCard {
  @Input({ required: true })
  title = '';

  @Input({ required: true })
  value: string | number = '';

  @Input()
  description = '';

  @Output()
  cardSelected = new EventEmitter<string>();

  selectCard(): void {
    this.cardSelected.emit(this.title);
  }
}