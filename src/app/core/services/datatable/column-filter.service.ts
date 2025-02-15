import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColumnFilterService {
  private filterSource = new Subject<{field: string, value: any}>();
  filterChanged$ = this.filterSource.asObservable();

  updateFilter(field: string, value: any) {
    this.filterSource.next({ field, value });
  }

  parseFilterValue(value: any, type: string) {
    switch(type) {
      case 'date':
        return value ? new Date(value) : null;
      case 'numeric':
        return value ? parseFloat(value) : null;
      case 'boolean':
        return value === 'true';
      default:
        return value;
    }
  }
}
