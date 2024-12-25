import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Book, Version } from "../../constants";

const VERSION_SIGLAS: { [key: string]: string } = {
  reinavalera1960: "RV1960",
  reinavalera1995: "RV1995",
  nuevaversioninternacional: "NVI",
  dioshablahoy: "DHH",
  palabradediosparatodos: "PDT",
  kingjamesversion: "KJV",
};

@Component({
  selector: "app-version-chapters",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="col-span-1 bg-white p-4 shadow-md rounded flex flex-col items-center max-h-[calc(100vh-2rem)] overflow-y-auto h-full"
    >
      <!-- Título de las Versiones -->
      <div class="w-full mb-2 text-center font-semibold text-gray-700">
        Versiones
      </div>

      <!-- Indicador de carga -->
      <div
        *ngIf="isLoading"
        class="w-full text-center py-4 flex flex-col justify-center items-center"
        aria-live="polite"
      >
        <div class="loader"></div>
        <p class="text-gray-500 text-sm mt-2">Cargando versiones...</p>
      </div>

      <!-- Lista de Versiones -->
      <ng-container *ngIf="!isLoading">
        <ng-container *ngIf="versions && versions.length > 0; else noVersions">
          <div class="grid grid-cols-2 gap-2 w-full">
            <button
              *ngFor="let v of versions"
              (click)="onVersionSelect(v.id)"
              [attr.aria-selected]="selectedVersion === v.id"
              [ngClass]="{
                'bg-blue-500 text-white border-blue-600':
                  selectedVersion === v.id,
                'bg-gray-200 hover:bg-gray-300': selectedVersion !== v.id
              }"
              class="py-2 text-xs rounded animated-hover border"
            >
              {{ getSiglas(v.id) }}
            </button>
          </div>
        </ng-container>
        <ng-template #noVersions>
          <div class="p-4 text-center text-gray-500 text-sm">
            No hay versiones disponibles en este momento.
          </div>
        </ng-template>
      </ng-container>

      <!-- Título de los Capítulos -->
      <div class="w-full mb-4 mt-4 text-center font-semibold text-gray-700">
        Capítulos
      </div>

      <!-- Lista de Capítulos -->
      <div class="grid grid-cols-4 gap-2 w-full">
        <ng-container
          *ngIf="selectedVersion && selectedBook; else noBookOrVersion"
        >
          <button
            *ngFor="let number of chapters"
            (click)="onChapterSelect(number)"
            [attr.aria-selected]="selectedChapter === number"
            [ngClass]="{
              'bg-blue-500 text-white border-blue-600':
                selectedChapter === number,
              'bg-gray-300 hover:bg-gray-400': selectedChapter !== number
            }"
            class="p-2 text-xs rounded animated-hover border"
          >
            {{ number }}
          </button>
        </ng-container>
        <ng-template #noBookOrVersion>
          <div class="col-span-6 p-4 text-center text-gray-500 text-sm">
            {{
              !selectedVersion
                ? "Por favor, selecciona una versión primero."
                : "Selecciona un libro antes de elegir un capítulo."
            }}
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedBook"] && changes["selectedBook"].currentValue) {
      this.selectedChapter = null;
      console.log("Por favor, selecciona un capítulo.");
    }

    if (
      changes["selectedVersion"] &&
      !changes["selectedVersion"].currentValue
    ) {
      this.selectedBook = null;
      this.selectedChapter = null;
      this.chapters = [];
    }
  }

  onVersionSelect(versionId: string): void {
    // Si el versionId es igual al seleccionado actualmente, no hacemos nada
    if (versionId === this.selectedVersion) {
      return;
    }

    const versionEnum = Object.values(Version).find((v) => v === versionId) as
      | Version
      | undefined;
    if (versionEnum) {
      this.selectedVersion = versionEnum;
      this.versionSelected.emit(versionEnum);
    }
  }

  onChapterSelect(chapter: number): void {
    // Si el capítulo es igual al seleccionado actualmente, no hacemos nada
    if (chapter === this.selectedChapter) {
      return;
    }

    this.selectedChapter = chapter;
    this.chapterSelected.emit(chapter);
  }

  getSiglas(versionId: string): string {
    return (VERSION_SIGLAS[versionId] || versionId).toUpperCase();
  }
}
