import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BibleService } from "../../services/bible.service";
import { books, Book, Version, getVersionName } from "../../constants";
import { TestamentSelectorComponent } from "../../components/testament-selector/testament-selector.component";
import { VersionChaptersComponent } from "../../components/version-chapters/version-chapters.component";

@Component({
  selector: "app-bible",
  standalone: true,
  imports: [CommonModule, TestamentSelectorComponent, VersionChaptersComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <div class="flex-1 grid grid-cols-6 gap-4 p-4">
        <!-- Left Panel (Libros) -->
        <div
          class="col-span-2 bg-white p-4 shadow-md rounded flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden"
        >
          <app-testament-selector
            [activeTab]="activeTab"
            [selectedVersion]="!!selectedVersion"
            (bookSelected)="onBookSelect($event)"
          ></app-testament-selector>
        </div>

        <!-- Middle Panel (Versiones y Capítulos) -->
        <app-version-chapters
          [isLoading]="isLoading"
          [versions]="versions"
          [selectedVersion]="selectedVersion"
          [selectedBook]="selectedBook"
          [chapters]="chapters"
          (versionSelected)="onVersionSelect($event)"
          (chapterSelected)="onChapterSelect($event)"
        ></app-version-chapters>

        <!-- Right Panel (Versículos) -->
        <div
          class="col-span-3 bg-white p-4 shadow-md rounded overflow-y-auto max-h-[calc(100vh-2rem)] verse-panel"
        >
          <h2
            class="text-xl font-semibold mb-4 text-center text-blue-600 border-b-2 pb-2 border-blue-300"
          >
            {{ selectedBook ? selectedBook.names[0] : "Libro no seleccionado" }}
            {{ selectedChapter ?? "" }} -
            {{ selectedVersion ?? "Versión no seleccionada" }}
          </h2>

          <div
            *ngIf="isLoadingVerses"
            class="w-full text-center py-4 flex justify-center items-center"
          >
            <div class="loader"></div>
            <p class="text-gray-500 text-sm ml-2">Cargando versículos...</p>
          </div>

          <ng-container *ngIf="!isLoadingVerses">
            <ng-container *ngIf="verses && verses.length > 0; else noVerses">
              <div class="verse" *ngFor="let verse of verses">
                <span class="verse-number">{{ verse.number }}</span>
                <span class="verse-text">{{ verse.verse }}</span>
              </div>
            </ng-container>
            <ng-template #noVerses>
              <div class="p-4 text-center text-gray-500">
                Selecciona una versión, un libro y un capítulo para cargar
                versículos.
              </div>
            </ng-template>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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

      .verse-panel {
        background: linear-gradient(to bottom, #ffffff, #f9f9f9);
        border: 1px solid #e5e7eb;
      }

      .verse {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
        padding: 0.5rem;
        border-left: 4px solid #345bdb;
        background-color: #f0f0f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        transition: transform 0.2s ease, background-color 0.3s ease;
      }

      .verse:hover {
        transform: translateX(5px);
        background-color: #f1f7ff;
        cursor: pointer;
      }

      .verse-number {
        font-weight: bold;
        margin-right: 0.5rem;
        color: #4a90e2;
        font-size: 1rem;
      }

      .verse-text {
        font-size: 0.95rem;
        color: #555;
        line-height: 1.5;
      }

      h2 {
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `,
  ],
})
export class BibleComponent implements OnInit {
  activeTab: "AT" | "NT" = "AT";
  isLoading = false;
  isLoadingVerses = false;
  versions: { id: Version; name: string }[] = [];
  chapters: number[] = [];
  selectedVersion: Version | null = null;
  selectedBook: Book | null = null;
  selectedChapter: number | null = null;
  verses: { number: number; verse: string }[] = [];
  //searchQuery = "";

  private mapToVersionEnum(version: string): Version | null {
    switch (version) {
      case "reinavalera1960":
        return Version.Rv60;
      case "reinavalera1995":
        return Version.Rv95;
      case "nuevaversioninternacional":
        return Version.Nvi;
      case "dioshablahoy":
        return Version.Dhh;
      case "palabradediosparatodos":
        return Version.Pdt;
      case "kingjamesversion":
        return Version.KJV;
      default:
        console.warn(`Versión desconocida: ${version}`);
        return null;
    }
  }

  constructor(private bibleService: BibleService) {}

  ngOnInit(): void {
    this.loadVersions();
  }

  loadVersions() {
    this.isLoading = true;
    this.bibleService.getVersions().subscribe({
      next: (data) => {
        this.versions = data.versions
          .map((v) => ({
            id: this.mapToVersionEnum(v.version),
            name: v.name,
          }))
          .filter((v) => v.id !== null) as { id: Version; name: string }[];
        this.isLoading = false;

        if (this.versions.length > 0) {
          this.onVersionSelect(this.versions[0].id);
        }
      },
      error: () => {
        this.isLoading = false;
        console.error("Error al cargar versiones");
      },
    });
  }

  onVersionSelect(versionId: Version): void {
    console.log("Versión seleccionada:", versionId); // Depuración
    this.selectedVersion = versionId; // Actualiza la versión seleccionada
    this.selectedBook = null; // Reinicia el libro seleccionado
    this.selectedChapter = null; // Reinicia el capítulo seleccionado
    this.chapters = []; // Limpia los capítulos
    this.verses = []; // Limpia los versículos
  }
  

  onBookSelect(book: Book) {
    this.selectedBook = book;
    this.chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  }

  onChapterSelect(chapter: number) {
    this.selectedChapter = chapter;
    this.loadVerses();
  }

  loadVerses() {
    if (!this.selectedVersion || !this.selectedBook || !this.selectedChapter)
      return;

    this.isLoadingVerses = true;

    this.bibleService
      .getVerseRange(
        this.selectedVersion,
        this.selectedBook.apiName, // Se usa apiName aquí
        this.selectedChapter,
        1,
        "200"
      )
      .subscribe({
        next: (data) => {
          try {
            console.log("Respuesta de la API (original):", data.text);

            if (Array.isArray(data.text)) {
              this.verses = data.text.map((v: any) => ({
                number: v.number,
                verse: v.verse,
              }));
            } else if (typeof data.text === "string") {
              const sanitizedText = data.text.replace(/'/g, '"');
              this.verses = JSON.parse(sanitizedText).map((v: any) => ({
                number: v.number,
                verse: v.verse,
              }));
            } else {
              console.warn("Formato inesperado en data.text:", data.text);
              this.verses = [];
            }

            this.isLoadingVerses = false;
          } catch (error) {
            console.error("Error al procesar versículos:", error);
            console.error("Texto recibido:", data.text);
            this.verses = [];
            this.isLoadingVerses = false;
          }
        },
      });
  }
}
