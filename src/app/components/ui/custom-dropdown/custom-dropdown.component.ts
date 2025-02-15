import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CustomDropdownComponent,
      multi: true
    }
  ],
  template: `
    <div [class]="containerClass">
      <label *ngIf="label" class="block font-medium mb-2" [class.required]="required">
        {{ label }}
      </label>
      
      <p-dropdown
        [options]="options"
        [(ngModel)]="value"
        [placeholder]="placeholder"
        [showClear]="showClear"
        [class]="'w-full surface-card border-1 border-round-md'"
        [style]="{ 
          'background': 'var(--surface-card)',
          'border-color': 'var(--surface-border)',
          'min-height': '42px'
        }"
        [panelStyle]="{
          'background': 'var(--surface-overlay)',
          'border': '0 none',
          'border-radius': '6px',
          'box-shadow': '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
        }"
        [emptyMessage]="emptyMessage"
        [optionLabel]="optionLabel"
        [optionValue]="optionValue"
        [filterBy]="filterBy"
        [filter]="filter"
        [filterPlaceholder]="filterPlaceholder"
        [disabled]="disabled"
        appendTo="body"
        [autoDisplayFirst]="false"
        (onChange)="onModelChange($event)"
        (onClear)="onClear()">
        
        <ng-template pTemplate="selectedItem" let-item>
          <div class="flex align-items-center gap-2" *ngIf="item">
            <i [class]="icon + ' text-primary'" *ngIf="icon"></i>
            <span>{{item[optionLabel]}}</span>
          </div>
        </ng-template>

        <ng-template pTemplate="item" let-item>
          <div class="flex align-items-center gap-2">
            <i [class]="icon + ' text-primary'" *ngIf="icon"></i>
            <span>{{item[optionLabel]}}</span>
          </div>
        </ng-template>
      </p-dropdown>

      <small class="text-red-500 mt-1 block" *ngIf="showError">
        {{ errorMessage }}
      </small>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dropdown {
        &:not(.p-disabled):hover {
          border-color: var(--primary-400);
        }
        
        &:not(.p-disabled).p-focus {
          border-color: var(--primary-400);
          box-shadow: 0 0 0 1px var(--primary-400);
        }

        .p-dropdown-label {
          padding: 0.75rem 1rem;
          color: var(--text-color);
        }

        .p-dropdown-trigger {
          padding: 0 0.75rem;
          width: 3rem;
          color: var(--text-color-secondary);
        }

        .p-dropdown-clear-icon {
          right: auto;
          left: 3rem;
          color: var(--text-color-secondary);
        }
      }

      .p-dropdown-panel {
        .p-dropdown-items {
          padding: 0.5rem;
          
          .p-dropdown-item {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin: 0.25rem 0;
            
            &:hover {
              background: var(--surface-200);
            }
            
            &.p-highlight {
              background: var(--primary-100);
              color: var(--primary-700);
            }
          }
        }
      }
    }

    .required:after {
      content: " *";
      color: var(--red-500);
    }
  `]
})
export class CustomDropdownComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() showClear: boolean = true;
  @Input() filter: boolean = false;
  @Input() filterBy: string = '';
  @Input() filterPlaceholder: string = 'ابحث...';
  @Input() emptyMessage: string = 'لا توجد خيارات';
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() containerClass: string = '';

  value: any = null;
  private onChange = (_: any) => {};
  private onTouched = () => {};

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Event handlers
  onModelChange(event: any): void {
    this.value = event.value;
    this.onChange(event.value);
    this.onTouched();
  }

  onClear(): void {
    this.value = null;
    this.onChange(null);
    this.onTouched();
  }
}