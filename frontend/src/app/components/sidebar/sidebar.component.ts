import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavLink {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="bg-gray-800 text-white h-full w-16 flex flex-col items-center py-4"
      role="navigation"
      aria-label="Sidebar"
    >
      <!-- Logo o Encabezado -->
      <div class="mb-6">
        <span class="text-2xl font-bold text-gray-300">📚</span>
      </div>

      <!-- Links de Navegación -->
      <ul class="w-full flex flex-col items-center space-y-6">
        <li
          *ngFor="let link of links; trackBy: trackByRoute"
          class="w-full"
          [routerLinkActive]="['bg-gray-700']"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          <a
            [routerLink]="link.route"
            class="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors duration-200"
            [attr.aria-label]="link.label"
          >
            <!-- Icono -->
            <span class="text-2xl mb-1">{{ link.icon }}</span>
            <!-- Etiqueta -->
            <span class="text-xs">{{ link.label }}</span>
          </a>
        </li>
      </ul>

      <!-- Footer (opcional) -->
      <div class="mt-auto">
        <span class="text-xs text-gray-500">© 2024</span>
      </div>
    </nav>
  `,
  styles: [],
})
export class SidebarComponent {
  @Input() links: NavLink[] = [
    { label: 'Leer Biblia', route: '/bible', icon: '📖' },
    { label: 'Canciones', route: '/songs', icon: '🎵' },
  ];

  trackByRoute(index: number, link: NavLink): string {
    return link.route;
  }
}
