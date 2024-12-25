import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WindowPanelComponent } from './components/window-panel/window-panel.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, WindowPanelComponent],
  template: `
    <div class="flex min-h-screen relative">
      <!-- Sidebar principal -->
      <app-sidebar *ngIf="!isPresentationRoute"></app-sidebar>

      <!-- Contenido principal -->
      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>

      <!-- Sidebar derecho (Window Panel) -->
      <app-window-panel *ngIf="!isPresentationRoute"></app-window-panel>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isPresentationRoute: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Predicado de tipo no se ni que hace
      )
      .subscribe((event: NavigationEnd) => {
        this.isPresentationRoute = event.urlAfterRedirects.startsWith('/presentation');
      });
  }
}
