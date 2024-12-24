import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BibleService } from "../../services/bible.service";
import { books, Book, Version, getVersionName } from "../../constants";
import { TestamentSelectorComponent } from "../../components/testament-selector/testament-selector.component";
import { VersionChaptersComponent } from "../../components/version-chapters/version-chapters.component";
import { VersePanelComponent } from "../../components/verse-panel/verse-panel.component";

@Component({
  selector: "app-bible",
  standalone: true,
  imports: [
    CommonModule,
    TestamentSelectorComponent,
    VersionChaptersComponent,
    VersePanelComponent,
  ],
  template: `
    <div class="flex h-screen bg-gray-100">
      <div class="flex-1 grid grid-cols-6 gap-4 p-4">
        <!-- Left Panel (Libros) -->
        <div
          class="col-span-2 bg-white p-4 shadow-md rounded flex flex-col h-[calc(100vh-2rem)] overflow-hidden"
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
          class="h-[calc(100vh-2rem)]"
          (versionSelected)="onVersionSelect($event)"
          (chapterSelected)="onChapterSelect($event)"
        ></app-version-chapters>

        <!-- Right Panel (Versículos) -->
        <app-verse-panel
          class="col-span-3"
          [isLoadingVerses]="isLoadingVerses"
          [selectedBook]="selectedBook"
          [selectedChapter]="selectedChapter"
          [selectedVersion]="selectedVersion"
          [verses]="verses"
        ></app-verse-panel>
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
    //console.log("Versión seleccionada:", versionId);

    this.selectedVersion = versionId;
    this.selectedBook = null; // Reinicia el libro seleccionado
    this.selectedChapter = null; // Reinicia el capítulo seleccionado
    this.chapters = []; // Limpia los capítulos
    this.verses = []; // Limpia los versículos

    // Si el libro seleccionado ya no es válido para la nueva versión, notifica a los componentes hijos
    if (!this.selectedBook) {
      this.resetChildComponents();
    }
  }

  onBookSelect(book: Book): void {
    //console.log("Libro seleccionado:", book);

    // Actualizar el libro seleccionado
    this.selectedBook = book;

    // Actualizar la lista de capítulos disponibles para el libro
    this.chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

    // Reiniciar el capítulo seleccionado para requerir que el usuario lo elija
    this.selectedChapter = null;
    this.verses = []; // Limpia los versículos porque no hay un capítulo seleccionado
  }

  onChapterSelect(chapter: number): void {
    console.log("Capítulo seleccionado:", chapter);
    this.selectedChapter = chapter;
    this.loadVerses();
  }

  resetChildComponents(): void {
    this.selectedBook = null;
    this.selectedChapter = null;
    this.chapters = [];
    this.verses = [];
  }

  loadVerses(): void {
    if (!this.selectedVersion || !this.selectedBook || !this.selectedChapter) {
      console.warn("No se puede cargar versículos. Faltan dependencias.");
      return;
    }

    console.log(
      `Cargando versículos para: versión ${this.selectedVersion}, libro ${this.selectedBook.names[0]}, capítulo ${this.selectedChapter}`
    );

    this.isLoadingVerses = true;

    this.bibleService
      .getVerseRange(
        this.selectedVersion,
        this.selectedBook.apiName,
        this.selectedChapter,
        1,
        "200"
      )
      .subscribe({
        next: (data) => {
          try {
            if (Array.isArray(data.text)) {
              this.verses = data.text.map((v: any) => ({
                number: v.number,
                verse: v.verse,
              }));
            } else {
              console.warn("Formato inesperado de datos:", data.text);
              this.verses = [];
            }
          } catch (error) {
            console.error("Error procesando los versículos:", error);
            this.verses = [];
          } finally {
            this.isLoadingVerses = false;
          }
        },
        error: (err) => {
          console.error("Error al cargar versículos:", err);
          this.isLoadingVerses = false;
        },
      });
  }
}
