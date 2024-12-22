import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PresentationService } from "../../services/presentation.service";
import { ColorCompactModule } from "ngx-color/compact";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-window-panel",
  standalone: true,
  imports: [FormsModule, ColorCompactModule, CommonModule],
  template: `
    <div
      class="fixed top-0 right-0 h-screen z-[9999] transition-transform"
      [class.translate-x-0]="isOpen || isHovered"
      [class.translate-x-full]="!isOpen && !isHovered"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Botón para mostrar/ocultar el panel -->
      <button
        class="tab"
        (click)="togglePanel()"
        aria-label="Toggle Configuration Panel"
      >
        <span class="icon">{{ isOpen || isHovered ? "⬅" : "➡" }}</span>
      </button>

      <!-- Panel principal -->
      <div
        class="w-72 h-full bg-gray-800 text-gray-100 shadow-lg flex flex-col overflow-y-auto"
      >
        <!-- Encabezado del panel -->
        <h2 class="text-center text-xl font-bold py-4 border-b border-gray-700">
          Configuración de Pantalla
        </h2>

        <!-- Contenido del panel -->
        <div class="p-4 space-y-4">
          <!-- Tamaño de Fuente -->
          <div class="form-control">
            <label for="fontSize" class="label">
              <span class="label-text text-gray-200">Tamaño de Fuente</span>
            </label>
            <div class="relative">
              <input
                type="number"
                id="fontSize"
                [(ngModel)]="config.fontSize"
                (change)="updateConfig()"
                class="input input-bordered w-full bg-gray-900 text-gray-100"
                placeholder="Ingresa tamaño en px"
                min="8"
                max="100"
              />
              <span
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              >
                {{ config.fontSize }} px
              </span>
            </div>
          </div>

          <!-- Fuente -->
          <div class="form-control">
            <label for="fontFamily" class="label">
              <span class="label-text text-gray-200">Fuente</span>
            </label>
            <select
              id="fontFamily"
              [(ngModel)]="config.fontFamily"
              (change)="updateConfig()"
              class="select select-bordered w-full bg-gray-900 text-gray-100"
            >
              <option *ngFor="let font of availableFonts" [value]="font.family">
                {{ font.family }}
              </option>
            </select>
          </div>

          <!-- Color de Fondo -->
          <div class="form-control">
            <label for="backgroundColor" class="label">
              <span class="label-text text-gray-200">Color de Fondo</span>
            </label>
            <color-compact
              [color]="config.backgroundColor"
              (onChangeComplete)="updateBackgroundColor($event)"
            ></color-compact>
          </div>

          <!-- Color del Texto -->
          <div class="form-control">
            <label for="textColor" class="label">
              <span class="label-text text-gray-200">Color del Texto</span>
            </label>
            <color-compact
              [color]="config.textColor"
              (onChangeComplete)="updateTextColor($event)"
            ></color-compact>
          </div>

          <!-- Duración de la Transición -->
          <div class="form-control">
            <label for="transition" class="label">
              <span class="label-text text-gray-200"
                >Duración de Transición (ms)</span
              >
            </label>
            <input
              type="number"
              id="transition"
              [(ngModel)]="config.transition"
              (change)="updateConfig()"
              class="input input-bordered w-full bg-gray-900 text-gray-100"
            />
          </div>

          <!-- Pantalla Completa -->
          <div class="form-control flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFullScreen"
              [(ngModel)]="config.isFullScreen"
              (change)="updateConfig()"
              class="checkbox bg-gray-600"
            />
            <label for="isFullScreen" class="text-gray-200">
              Pantalla Completa
            </label>
          </div>

          <!-- Ventana Abierta -->
          <div class="form-control flex items-center space-x-2">
            <input
              type="checkbox"
              id="isWindowOpen"
              [(ngModel)]="config.isWindowOpen"
              (change)="updateConfig()"
              class="checkbox bg-gray-600"
            />
            <label for="isWindowOpen" class="text-gray-200">
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
  availableFonts: { family: string }[] = [];

  constructor(private presentationService: PresentationService) {}

  ngOnInit(): void {
    // Suscribirse a la configuración actual
    this.presentationService.config$.subscribe((config) => {
      this.config = { ...config };
    });

    this.availableFonts = [
      { family: "Roboto" },
      { family: "Open Sans" },
      { family: "Lato" },
      { family: "Montserrat" },
      { family: "Source Sans Pro" },
      { family: "Arial" }, // Predeterminada
    ];
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
