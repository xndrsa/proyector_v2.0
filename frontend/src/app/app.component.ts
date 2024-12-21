import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WindowPanelComponent } from './components/window-panel/window-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, WindowPanelComponent],
  template: `
    <div class="flex min-h-screen relative">
      <!-- Sidebar principal -->
      <app-sidebar></app-sidebar>

      <!-- Contenido principal -->
      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>

      <!-- Sidebar derecho (Window Panel) -->
      <app-window-panel></app-window-panel>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'frontend';
}
