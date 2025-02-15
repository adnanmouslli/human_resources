import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicButtonComponent } from "../dynamic-button/dynamic-button.component";

@Component({
  standalone:true ,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: any[] = [];
  @Input() formTitle: string = 'Form';
  @Input() useCard: boolean = true; // تحديد إذا كان النموذج داخل بطاقة
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>(); // مخرج لإرسال البيانات

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      this.fields.reduce((acc, field) => {
        acc[field.name] = [
          '',
          [
            ...(field.required ? [Validators.required] : []),
            ...(field.email ? [Validators.email] : []),
            ...(field.minLength ? [Validators.minLength(field.minLength)] : []),
          ],
        ];
        return acc;
      }, {})
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      
      this.form.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

}
