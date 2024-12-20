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
          class="col-span-2 bg-white p-4 shadow-md rounded flex flex-col max-h-[calc(100vh-2rem)]"
        >
          <!-- Search Input -->
          <div class="relative mb-4">
            <input
              type="text"
              placeholder="Filtrar libros"
              class="w-full border p-2 rounded"
              (input)="onSearchBooks($event)"
            />
            <span class="absolute right-2 top-2 text-gray-400">🔍</span>
          </div>

          <!-- Tabs -->
          <div class="flex mb-2 border-b">
            <button
              (click)="activeTab = 'AT'"
              [class.text-blue-500]="activeTab === 'AT'"
              [class.border-b-2]="activeTab === 'AT'"
              class="w-1/2 text-center py-2 cursor-pointer font-semibold border-r"
            >
              AT
            </button>
            <button
              (click)="activeTab = 'NT'"
              [class.text-blue-500]="activeTab === 'NT'"
              [class.border-b-2]="activeTab === 'NT'"
              class="w-1/2 text-center py-2 cursor-pointer font-semibold"
            >
              NT
            </button>
          </div>

          <!-- Book List -->
          <div class="flex-1 overflow-y-auto border-t">
            <ng-container *ngIf="selectedVersion; else noVersionSelected">
              <ng-container *ngIf="activeTab === 'AT'">
                <ul>
                  <li
                    *ngFor="let book of filteredBooks('AT')"
                    (click)="onBookSelect(book)"
                    class="p-2 hover:bg-gray-200 cursor-pointer rounded"
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
                    class="p-2 hover:bg-gray-200 cursor-pointer rounded"
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
                class="w-full mb-2 py-2 text-sm rounded"
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
                class="bg-gray-300 p-2 text-xs rounded hover:bg-gray-400"
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
          class="col-span-3 bg-white p-4 shadow-md rounded overflow-y-auto max-h-[calc(100vh-2rem)]"
        >
          <h2 class="text-xl font-semibold mb-2">
            {{ selectedBook ? selectedBook.names[0] : "Libro no seleccionado" }}
            {{ selectedChapter ?? "" }}
            - {{ selectedVersion ?? "Versión no seleccionada" }}
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
              <p *ngFor="let verse of verses" class="mb-2">
                <span class="font-bold">{{ verse.number }}</span>
                {{ verse.verse }}
              </p>
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
        "150"
      )
      .subscribe({
        next: (data) => {
          try {
            console.log("Respuesta de la API (original):", data.text);
            const sanitizedText = data.text.replace(/'/g, '"');
            console.log("Respuesta de la API (sanitizada):", sanitizedText);
  
            this.verses = JSON.parse(sanitizedText).map((v: any) => ({
              number: v.number,
              verse: v.verse,
            }));
  
            this.isLoadingVerses = false;
          } catch (error) {
            console.error("Error al parsear el texto de versículos:", error);
            console.error("Texto recibido:", data.text);
  
            this.verses = [];
            this.isLoadingVerses = false;
          }
        },
        error: (err) => {
          console.error("Error al cargar versículos desde la API:", err);
          this.verses = [];
          this.isLoadingVerses = false;
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
