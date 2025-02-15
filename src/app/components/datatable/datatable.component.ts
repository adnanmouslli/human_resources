import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { Table } from 'primeng/table';
import { Column } from '../../type/ui/data-table';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ProgressBarModule,
    MultiSelectModule,
    DropdownModule
  ],
  template: `
    <div class="card shadow-sm border-round">
      <h5 class="text-xl font-semibold text-900 mb-4">{{title}}</h5>
      <p-table 
        #dt 
        [value]="data" 
        [columns]="columns"
        [rows]="rows" 
        [paginator]="true" 
        [loading]="loading"
        [rowHover]="true"
        [globalFilterFields]="globalFilterFields"
        [sortMode]="'single'"
        [resizableColumns]="true"
        styleClass="p-datatable-elegant"
        responsiveLayout="scroll"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[5 , 10, 25, 50]"
        [dataKey]="'id'"
        (onFilter)="onFilter($event)"
        (onSort)="onSort($event)">
        
        <!-- Table Caption -->
        <ng-template pTemplate="caption">
          <div class="flex justify-content-between align-items-center mb-4">
            <div class="flex gap-2">
              <button pButton 
                      label="مسح الفلاتر" 
                      class="p-button-outlined p-button-secondary" 
                      icon="pi pi-filter-slash" 
                      [disabled]="loading"
                      (click)="clear(dt)">
              </button>
              <button pButton 
                      label="تصدير CSV" 
                      class="p-button-outlined p-button-primary" 
                      icon="pi pi-file" 
                      [disabled]="loading"
                      (click)="exportCSV(dt)">
              </button>
            </div>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input pInputText 
                     type="text" 
                     #filterInput
                     [disabled]="loading"
                     (input)="onGlobalFilter(dt, $event)" 
                     placeholder="بحث..." 
                     class="p-inputtext-lg"/>
            </span>
          </div>
        </ng-template>

        <!-- Column Headers -->
        <ng-template pTemplate="header">
          <tr>
            <th *ngFor="let col of columns" 
                [pSortableColumn]="col.sortable ? col.field : undefined"
                [style]="{'min-width': col.width || '10rem'}"
                class="text-900 font-semibold">
              <div class="flex justify-content-between align-items-center">
                {{col.header}}
                <div class="flex align-items-center gap-2">
                  <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
                  
                  <!-- Column Filters -->
                  <ng-container *ngIf="col.filterable" [ngSwitch]="col.filterType">
                    <p-columnFilter *ngSwitchCase="'text'"
                      [field]="col.filterField || col.field"
                      type="text"
                      display="menu">
                    </p-columnFilter>

                    <p-columnFilter *ngSwitchCase="'numeric'"
                      [field]="col.filterField || col.field"
                      type="numeric"
                      display="menu">
                    </p-columnFilter>

                    <p-columnFilter *ngSwitchCase="'dropdown'"
                      [field]="col.filterField || col.field"
                      matchMode="equals"
                      display="menu"
                      [showMatchModes]="false"
                      [showOperator]="false"
                      [showAddButton]="false">
                      <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                        <p-dropdown 
                          [ngModel]="value" 
                          [options]="col.statusOptions || []"
                          (onChange)="filter($event.value)" 
                          placeholder="الكل"
                          [style]="{'width': '100%'}"
                          [disabled]="loading">
                        </p-dropdown>
                      </ng-template>
                    </p-columnFilter>
                  </ng-container>
                </div>
              </div>
            </th>
          </tr>
        </ng-template>

        <!-- Table Body -->
        <ng-template pTemplate="body" let-rowData>
          <tr class="hover:surface-100">
            <td *ngFor="let col of columns" class="p-3">
              <ng-container [ngSwitch]="col.type">
                <span *ngSwitchCase="'text'" class="text-900">
                  {{rowData[col.field]}}
                </span>

                <span *ngSwitchCase="'date'" class="text-900">
                  {{rowData[col.field] | date: (col.format || 'yyyy-MM-dd')}}
                </span>

                <span *ngSwitchCase="'number'" class="text-900">
                  {{rowData[col.field] | number: (col.format || '1.0-2')}}
                </span>

                <span *ngSwitchCase="'currency'" class="text-900">
                  {{rowData[col.field] | currency:'SAR':'symbol'}}
                </span>

                <p-progressBar *ngSwitchCase="'progress'"
                  [value]="rowData[col.field]"
                  [showValue]="false"
                  styleClass="h-1rem">
                </p-progressBar>

                <i *ngSwitchCase="'boolean'"
                   class="pi text-xl"
                   [ngClass]="{'pi-check-circle text-green-500': rowData[col.field],
                              'pi-times-circle text-pink-500': !rowData[col.field]}">
                </i>

                <span *ngSwitchCase="'status'"
                      [class]="'status-badge status-' + (rowData[col.field]?.toString().toLowerCase() || '')">
                    {{rowData[col.field]}}
                </span>

                <img *ngSwitchCase="'image'"
                     [src]="rowData[col.field]"
                     [alt]="col.header"
                     class="w-3rem shadow-1 border-round"/>

                <ng-container *ngSwitchCase="'custom'">
                  <ng-container 
                    *ngTemplateOutlet="col.bodyTemplate || null; 
                    context: { $implicit: rowData, column: col }">
                  </ng-container>
                </ng-container>

                <span *ngSwitchDefault class="text-900">
                  {{rowData[col.field]}}
                </span>
              </ng-container>
            </td>
          </tr>
        </ng-template>

        <!-- Empty Message -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="columns.length" class="text-center p-4">
              <div class="text-700">لا توجد بيانات للعرض</div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class DatatableComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() title: string = 'جدول البيانات';
  @Input() loading: boolean = false;
  @Input() rows: number = 10;
  @Input() globalFilterFields: string[] = [];

  @Output() filterChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();

  ngOnInit() {
    if (this.globalFilterFields.length === 0) {
      this.globalFilterFields = this.columns
        .filter(col => col.type === 'text')
        .map(col => col.field);
    }
  }

  clear(table: Table) {
    if (!this.loading) {
      table.clear();
      const filterInput = document.querySelector('#filterInput') as HTMLInputElement;
      if (filterInput) {
        filterInput.value = '';
      }
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    if (!this.loading) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }

  exportCSV(table: Table) {
    if (!this.loading) {
      table.exportCSV();
    }
  }

  onFilter(event: any) {
    this.filterChange.emit(event.filters);
  }

  onSort(event: any) {
    this.sortChange.emit({
      field: event.field,
      order: event.order
    });
  }
}