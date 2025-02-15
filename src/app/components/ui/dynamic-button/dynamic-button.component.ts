import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonOptions } from '../../../type/ui/button';



@Component({
  selector: 'app-dynamic-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-button.component.html',
  styleUrl: './dynamic-button.component.scss'
})
export class DynamicButtonComponent {
  @Input() options: ButtonOptions = {}; // تعريف الخيارات
  @Output() clicked = new EventEmitter<void>(); // حدث للنقر على الزر

  onClick() {
    this.clicked.emit(); // إطلاق الحدث عند النقر
  }

  getSizeClass(): string {
    switch (this.options.size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium'; // الحجم الافتراضي
    }
  }


}
