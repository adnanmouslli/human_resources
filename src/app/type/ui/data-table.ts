import { TemplateRef } from '@angular/core';

export interface Column {
  field: string;
  header: string;
  type: 'text' | 'date' | 'number' | 'boolean' | 'currency' | 'image' | 'progress' | 'custom' | 'status';
  filterType?: 'text' | 'numeric' | 'dropdown' | 'date';
  filterField?: string;
  width?: string;
  format?: string;
  sortable?: boolean;
  filterable?: boolean;
  statusOptions?: { label: string; value: string; styleClass?: string }[];
  bodyTemplate?: TemplateRef<any> | null;  // Updated type
  minWidth?: string;
  maxWidth?: string;
}