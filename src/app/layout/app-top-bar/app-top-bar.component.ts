import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LayoutService } from '../service/layout-service.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-app-top-bar',
  standalone: true,
  imports: [ 
    CommonModule, 
    RouterLink,
    ConfirmDialogModule
  ],
  templateUrl: './app-top-bar.component.html',
  styleUrl: './app-top-bar.component.scss',
  providers: [ConfirmationService]

})
export class AppTopBarComponent {


  set colorScheme(val: string) {
    this.layoutService.config.update((config) => ({
      ...config,
      colorScheme: val,
    }));
  }

  get colorScheme(): string {
    return this.layoutService.config().colorScheme;
  }


  getTheme() {
    return this.colorScheme;
  }



  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private confirmationService: ConfirmationService
  ) {}

  confirmLogout() {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من تسجيل الخروج؟',
      header: 'تأكيد تسجيل الخروج',
      icon: 'pi pi-exclamation-triangle', 
      rejectButtonStyleClass: 'd-none',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        console.log('تسجيل الخروج...');
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
   }


  changeTheme(theme: string, colorScheme: string) {
    this.layoutService.config.update((config) => ({
      ...config,
      theme: theme,
      colorScheme: colorScheme,
    }));
  }

  toggleTheme() {
    this.layoutService.config.update((config) => {
      const isLight = config.colorScheme === 'light';
      return {
        ...config,
        theme: isLight ? 'bootstrap4-dark-blue' : 'bootstrap4-light-blue',
        colorScheme: isLight ? 'dark' : 'light',
      };
    });
  }

}
