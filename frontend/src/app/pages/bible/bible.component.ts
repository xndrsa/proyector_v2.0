import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BibleService } from "../../services/bible.service";
import { books, Book, Version, getVersionName } from "../../constants";

@Component({
  selector: "app-bible",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <div class="flex-1 grid grid-cols-6 gap-4 p-4">
        <!-- Left Panel (Libros) -->
        <div
          class="col-span-2 bg-white p-4 shadow-md rounded flex flex-col max-h-[calc(100vh-2rem)] book-panel"
        >
          <!-- Search Input -->
          <div class="relative mb-4">
            <input
              type="text"
              placeholder="Filtrar libros"
              class="w-full border p-2 rounded search-input focus:outline-none focus:ring-2 focus:ring-blue-500"
              (input)="onSearchBooks($event)"
            />
            <span class="absolute right-3 top-2 text-gray-400 text-lg">🔍</span>
          </div>

          <!-- Tabs -->
          <div class="flex mb-4 border-b">
            <button
              (click)="activeTab = 'AT'"
              [class.active-tab]="activeTab === 'AT'"
              class="tab-button w-1/2 text-center py-2"
            >
              AT
            </button>
            <button
              (click)="activeTab = 'NT'"
              [class.active-tab]="activeTab === 'NT'"
              class="tab-button w-1/2 text-center py-2"
            >
              NT
            </button>
          </div>

          <!-- Book List -->
          <div class="flex-1 overflow-y-auto border-t book-list">
            <ng-container *ngIf="selectedVersion; else noVersionSelected">
              <ng-container *ngIf="activeTab === 'AT'">
                <ul>
                  <li
                    *ngFor="let book of filteredBooks('AT')"
                    (click)="onBookSelect(book)"
                    class="p-3 hover:bg-gray-200 cursor-pointer rounded transition ease-in-out hover:scale-105"
                  >
                    {{ book.names[0] }}
                  </li>
                </ul>
              </ng-container>
              <ng-container *ngIf="activeTab === 'NT'">
                <ul>
                  <li
                    *ngFor="let book of filteredBooks('NT')"
                    (click)="onBookSelect(book)"
                    class="p-3 hover:bg-gray-200 cursor-pointer rounded transition ease-in-out hover:scale-105"
                  >
                    {{ book.names[0] }}
                  </li>
                </ul>
              </ng-container>
            </ng-container>
            <ng-template #noVersionSelected>
              <div class="p-4 text-center text-gray-500">
                Selecciona una versión primero.
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Middle Panel (Versiones y Capítulos) -->
        <div
          class="col-span-1 bg-white p-2 shadow-md rounded flex flex-col items-center max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
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
            <ng-container
              *ngIf="versions && versions.length > 0; else noVersions"
            >
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
                class="bg-gray-300 p-2 text-xs rounded hover:bg-gray-400 animated-hover"
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
      .book-panel {
        background: linear-gradient(to bottom, #ffffff, #f9f9f9);
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .search-input {
        font-size: 1rem;
        border: 1px solid #d1d5db;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }

      .search-input:focus {
        border-color: #60a5fa;
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
      }

      .tab-button {
        font-size: 1rem;
        font-weight: bold;
        border-bottom: 2px solid transparent;
        transition: color 0.3s ease, border-color 0.3s ease;
      }

      .tab-button:hover {
        color: #2563eb;
      }

      .active-tab {
        color: #2563eb;
        border-color: #2563eb;
      }

      .book-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .book-list li {
        font-size: 0.95rem;
        color: #4b5563;
        transition: background-color 0.3s ease, transform 0.3s ease;
      }

      .book-list li:hover {
        background-color: #f3f4f6;
        transform: scale(1.03);
      }

      .book-list {
        padding: 0.5rem;
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
  searchQuery = "";

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

  onVersionSelect(versionId: Version) {
    this.selectedVersion = versionId;
    this.selectedBook = null;
    this.selectedChapter = null;
    this.chapters = [];
    this.verses = [];
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

  filteredBooks(testament: "AT" | "NT"): Book[] {
    return books
      .filter(
        (book) =>
          book.testament ===
          (testament === "AT" ? "Antiguo Testamento" : "Nuevo Testamento")
      )
      .filter((book) =>
        book.names[0].toLowerCase().includes(this.searchQuery.toLowerCase())
      );
  }

  onSearchBooks(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }
}
