import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Book, Version } from "../../constants";

@Component({
  selector: "app-version-chapters",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="col-span-1 bg-white p-2 shadow-md rounded flex flex-col items-center max-h-[calc(100vh-2rem)] overflow-y-auto h-full"
    >
      <!-- Versiones -->
      <div class="w-full mb-2 text-center font-semibold text-gray-700">
        Versiones
      </div>

      <div
        *ngIf="isLoading"
        class="w-full text-center py-4 flex justify-center items-center"
      >
        <div class="loader"></div>
        <p class="text-gray-500 text-sm ml-2">Cargando versiones...</p>
      </div>

      <ng-container *ngIf="!isLoading">
        <ng-container *ngIf="versions && versions.length > 0; else noVersions">
          <button
            *ngFor="let v of versions"
            (click)="onVersionSelect(v.id)"
            [ngClass]="{
              'bg-blue-500 text-white': selectedVersion === v.id,
              'bg-gray-200 hover:bg-gray-300': selectedVersion !== v.id
            }"
            class="w-full mb-2 py-2 text-sm rounded animated-hover"
          >
            {{ v.name }}
          </button>
        </ng-container>
        <ng-template #noVersions>
          <div class="p-4 text-center text-gray-500">
            No hay versiones disponibles.
          </div>
        </ng-template>
      </ng-container>

      <!-- Capítulos -->
      <div class="w-full mb-4 text-center font-semibold text-gray-700">
        Capítulos
      </div>
      <div class="grid grid-cols-4 gap-2">
        <ng-container
          *ngIf="selectedVersion && selectedBook; else noBookOrVersion"
        >
          <button
            *ngFor="let number of chapters"
            (click)="onChapterSelect(number)"
            [ngClass]="{
              'bg-blue-500 text-white': selectedChapter === number,
              'bg-gray-300 hover:bg-gray-400': selectedChapter !== number
            }"
            class="p-2 text-xs rounded animated-hover"
          >
            {{ number }}
          </button>
        </ng-container>
        <ng-template #noBookOrVersion>
          <div class="col-span-4 p-4 text-center text-gray-500 text-sm">
            {{
              !selectedVersion
                ? "Selecciona una versión"
                : "Selecciona un libro"
            }}
            antes de elegir un capítulo.
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .animated-hover:hover {
        transform: scale(1.05);
        transition: transform 0.2s ease-in-out;
      }
      .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      button.bg-blue-500 {
        background-color: #3b82f6;
        color: white;
      }
      button:hover:not(.bg-blue-500) {
        background-color: #e2e8f0;
      }
    `,
  ],
})
export class VersionChaptersComponent {
  @Input() isLoading: boolean = false;
  @Input() versions: Array<{ id: string; name: string }> = [];
  @Input() selectedVersion: Version | null = null;
  @Input() selectedBook: Book | null = null;
  @Input() chapters: number[] = [];
  @Input() selectedChapter: number | null = null;

  @Output() versionSelected = new EventEmitter<Version>();
  @Output() chapterSelected = new EventEmitter<number>();

  onVersionSelect(versionId: string): void {
    const versionEnum = Object.values(Version).find((v) => v === versionId) as
      | Version
      | undefined;
    if (versionEnum) {
      this.selectedVersion = versionEnum; // Actualiza el estado local
      this.versionSelected.emit(versionEnum); // Emitimos el evento al padre
    } else {
      console.warn(`Versión desconocida seleccionada: ${versionId}`);
    }
  }

  onChapterSelect(chapter: number): void {
    this.selectedChapter = chapter; // Actualizamos el capítulo seleccionado
    this.chapterSelected.emit(chapter); // Emitimos el evento
  }
}
