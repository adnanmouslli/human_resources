import { Component, ElementRef } from '@angular/core';
import { LayoutService } from '../service/layout-service.service';
import { AppMenuComponent } from "../app-menu/app-menu.component";

@Component({
  selector: 'app-app-sidebar',
  standalone: true,
  imports: [AppMenuComponent],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss'
})
export class AppSidebarComponent {
  constructor(public layoutService: LayoutService, public el: ElementRef) { }
}
