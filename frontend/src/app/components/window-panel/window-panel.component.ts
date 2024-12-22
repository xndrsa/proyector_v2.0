import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PresentationService } from "../../services/presentation.service";
import { ColorCompactModule } from "ngx-color/compact";
@Component({
  selector: "app-window-panel",
  standalone: true,
  imports: [FormsModule, ColorCompactModule],
  template: `
    <div
      class="fixed top-0 right-0 h-screen z-[9999] transition-transform"
      [class.translate-x-0]="isOpen || isHovered"
      [class.translate-x-full]="!isOpen && !isHovered"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <button
        class="tab"
        (click)="togglePanel()"
        aria-label="Toggle Configuration Panel"
      >
        <span class="icon">{{ isOpen || isHovered ? "⬅" : "➡" }}</span>
      </button>
      <div
        class="w-72 h-full bg-gray-800 text-gray-100 shadow-lg overflow-y-auto"
      >
        <h2 class="text-center text-xl font-bold py-4 border-b border-gray-700">
          Configuración de Pantalla
        </h2>
        <div class="p-4 space-y-4">
          <div class="form-group">
            <label for="fontSize" class="block text-sm font-medium">
              Tamaño de Fuente
            </label>
            <input
              type="number"
              id="fontSize"
              [(ngModel)]="config.fontSize"
              (change)="updateConfig()"
              class="w-full p-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100"
            />
          </div>

          <div class="form-group">
            <label for="backgroundColor" class="block text-sm font-medium">
              Color de Fondo
            </label>
            <color-compact
              [color]="config.backgroundColor"
              (onChangeComplete)="updateBackgroundColor($event)"
            ></color-compact>
          </div>
          <div class="form-group">
            <label for="textColor" class="block text-sm font-medium">
              Color del Texto
            </label>
            <color-compact
              [color]="config.textColor"
              (onChangeComplete)="updateTextColor($event)"
            ></color-compact>
          </div>

          <div class="form-group">
            <label for="transition" class="block text-sm font-medium">
              Duración de Transición (ms)
            </label>
            <input
              type="number"
              id="transition"
              [(ngModel)]="config.transition"
              (change)="updateConfig()"
              class="w-full p-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100"
            />
          </div>
          <div class="form-group">
            <label for="fontFamily" class="block text-sm font-medium">
              Fuente
            </label>
            <input
              type="text"
              id="fontFamily"
              [(ngModel)]="config.fontFamily"
              (change)="updateConfig()"
              class="w-full p-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100"
            />
          </div>
          <div class="form-group flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFullScreen"
              [(ngModel)]="config.isFullScreen"
              (change)="updateConfig()"
              class="h-4 w-4 text-blue-600 border-gray-700 rounded"
            />
            <label for="isFullScreen" class="text-sm font-medium">
              Pantalla Completa
            </label>
          </div>
          <div class="form-group flex items-center space-x-2">
            <input
              type="checkbox"
              id="isWindowOpen"
              [(ngModel)]="config.isWindowOpen"
              (change)="updateConfig()"
              class="h-4 w-4 text-blue-600 border-gray-700 rounded"
            />
            <label for="isWindowOpen" class="text-sm font-medium">
              Ventana Abierta
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        top: 0;
        right: -300px;
        height: 100%;
        width: 300px;
        background-color: #2b2b2b;
        color: #f1f1f1;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
        overflow-y: auto;
        transition: right 0.3s ease;
        z-index: 9999;
      }
      .sidebar.translate-x-0 {
        right: 0;
      }
      .tab {
        position: absolute;
        top: 50%;
        left: -35px;
        transform: translateY(-50%);
        width: 35px;
        height: 70px;
        background-color: #1f2937;
        color: #ffffff;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: none;
        border-radius: 5px 0 0 5px;
        box-shadow: -2px 0 6px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s ease, transform 0.3s ease;
        z-index: 10000;
      }
      .tab:hover {
        background-color: #374151;
      }
      .tab:active {
        background-color: #4b5563;
        transform: translateY(-50%) scale(1.05);
      }
      .tab:hover .icon {
        transform: rotate(5deg);
      }
      .icon {
        font-size: 20px;
        transition: transform 0.3s ease;
      }
      .sidebar .content {
        padding: 20px;
        font-size: 14px;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 14px;
      }
      input[type="number"],
      input[type="text"] {
        width: 100%;
        padding: 8px;
        border: 1px solid #666;
        border-radius: 4px;
        background-color: #f1f1f1;
        color: #333;
        font-size: 14px;
        box-sizing: border-box;
      }
      input[type="color"] {
        width: 100%;
        border: 1px solid #666;
        padding: 2px;
        border-radius: 4px;
        background-color: #f1f1f1;
        color: #333;
        font-size: 14px;
        box-sizing: border-box;
      }
      input[type="checkbox"] {
        width: auto;
        transform: scale(1.2);
      }
      @media (max-width: 768px) {
        .tab {
          width: 50px;
          height: 100px;
          left: -60px;
        }
        .icon {
          font-size: 28px;
        }
        .sidebar .content {
          font-size: 12px;
        }
        label {
          font-size: 12px;
        }
        input[type="number"],
        input[type="text"],
        input[type="color"] {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class WindowPanelComponent implements OnInit {
  config: any = {};
  isHovered: boolean = false;
  isOpen: boolean = false;

  constructor(private presentationService: PresentationService) {}

  ngOnInit(): void {
    this.presentationService.config$.subscribe((config) => {
      this.config = { ...config };
    });
  }

  updateBackgroundColor(event: any): void {
    this.config.backgroundColor = event.color.hex; // Actualiza el color en formato HEX
    this.updateConfig();
  }

  updateTextColor(event: any): void {
    this.config.textColor = event.color.hex; // Actualiza el color en formato HEX
    this.updateConfig();
  }

  updateConfig(): void {
    this.presentationService.updateConfig(this.config);
  }

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }
}
