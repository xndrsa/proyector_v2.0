import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

// Services
import { BibleStateService } from "../../services/bible-state.service";
import { BibleService } from "../../services/bible.service";

// Constantes
import { books, Book, Version, getVersionName } from "../../constants";

// Componentes
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
  styles: [``],
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

  constructor(
    private bibleService: BibleService,
    private bibleStateService: BibleStateService
  ) {}

  ngOnInit(): void {
    this.loadVersions();

    this.bibleStateService.getState().subscribe((state) => {
      this.selectedVersion = state.selectedVersion;
      this.selectedBook = state.selectedBook;
      this.selectedChapter = state.selectedChapter;
      this.chapters = state.availableChapters;
    });
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
    this.selectedVersion = versionId;
  
    this.bibleStateService.updateState({
      selectedVersion: versionId,
    });
  
    // Recargar los versículos con la nueva versión
    if (this.selectedBook && this.selectedChapter) {
      this.loadVerses();
    }
  }
  

  onBookSelect(book: Book): void {
    this.selectedBook = book;
    this.chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    this.selectedChapter = null;
    this.verses = []; // Limpia los versículos porque no hay un capítulo seleccionado

    this.bibleStateService.updateState({
      selectedBook: book,
      selectedChapter: null,
      availableChapters: this.chapters,
    });
  }

  onChapterSelect(chapter: number): void {
    this.selectedChapter = chapter;
    this.loadVerses();

    this.bibleStateService.updateState({
      selectedChapter: chapter,
    });
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
