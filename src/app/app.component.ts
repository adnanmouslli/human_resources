import { Component, Inject, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from "./components/ui/toast/toast.component";
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ToastModule] ,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'human-resources';
}
