import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule],
  template: `
  <p-toast
    position="bottom-right"
    key="global-toast"
    [breakpoints]="breakpointOptions"
  ></p-toast>
`,
styles: [`
  /* Optional custom styling for toasts */
  :host ::ng-deep .p-toast {
    z-index: 9999;
  }
`]

})
export class ToastComponent {
  breakpointOptions = {
    '920px': {
      width: '100%',
      right: '0',
      left: '0'
    }
  };

  constructor() {}

  ngOnInit() {
    // Optional: You can add any initialization logic here
  }
}
