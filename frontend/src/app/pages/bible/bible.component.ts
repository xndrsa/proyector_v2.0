import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BibleService } from "../../services/bible.service";

@Component({
  selector: "app-bible",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Main Layout -->
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

          <!-- Book List with Scroll -->
          <div class="flex-1 overflow-y-auto border-t">
            <ul *ngIf="activeTab === 'AT'">
              <li
                *ngFor="let book of atBooks"
                (click)="onBookSelect(book)"
                class="p-2 hover:bg-gray-200 cursor-pointer rounded"
              >
                {{ book }}
              </li>
            </ul>
            <ul *ngIf="activeTab === 'NT'">
              <li
                *ngFor="let book of ntBooks"
                (click)="onBookSelect(book)"
                class="p-2 hover:bg-gray-200 cursor-pointer rounded"
              >
                {{ book }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Middle Panel (Versiones y Capítulos) -->
        <div
          class="col-span-1 bg-white p-2 shadow-md rounded flex flex-col items-center max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <div class="w-full mb-2 text-center font-semibold text-gray-700">
            Versiones
          </div>

          <div *ngIf="isLoading" class="w-full text-center py-4 flex justify-center items-center">
            <div class="loader"></div>
            <p class="text-gray-500 text-sm ml-2">Cargando versiones...</p>
          </div>

          <ng-container *ngIf="!isLoading">
            <button
              *ngFor="let v of versions"
              (click)="onVersionSelect(v.id)"
              class="w-full mb-2 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              {{ v.name }}
            </button>
          </ng-container>

          <div class="w-full mb-4 text-center font-semibold text-gray-700">
            Capítulos
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button
              *ngFor="let number of chapters"
              (click)="onChapterSelect(number)"
              class="bg-gray-300 p-2 text-xs rounded hover:bg-gray-400"
            >
              {{ number }}
            </button>
          </div>
        </div>

        <!-- Right Panel (Versículos) -->
        <div
          class="col-span-3 bg-white p-4 shadow-md rounded overflow-y-auto max-h-[calc(100vh-2rem)]"
        >
          <h2 class="text-xl font-semibold mb-2">
            {{ selectedBook }} {{ selectedChapter }} - {{ selectedVersion }}
          </h2>

          <!-- Loader de versículos -->
          <div *ngIf="isLoadingVerses" class="w-full text-center py-4 flex justify-center items-center">
            <div class="loader"></div>
            <p class="text-gray-500 text-sm ml-2">Cargando versículos...</p>
          </div>

          <ng-container *ngIf="!isLoadingVerses">
            <p *ngFor="let verse of verses" class="mb-2">
              <span class="font-bold">{{ verse.number }}</span>
              {{ verse.verse }}
            </p>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .loader {
        border: 4px solid #f3f3f3; /* Gris claro */
        border-top: 4px solid #3498db; /* Azul */
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
    `,
  ],
})
export class BibleComponent implements OnInit {
  activeTab: "AT" | "NT" = "AT";

  atBooks = [
    "Génesis",
    "Éxodo",
    "Levítico",
    "Números",
    "Deuteronomio",
    "Josué",
    "Jueces",
    "Rut",
    "1 Samuel",
    "2 Samuel",
    "1 Reyes",
    "2 Reyes",
    "1 Crónicas",
    "2 Crónicas",
    "Esdras",
    "Nehemías",
    "Ester",
    "Job",
    "Salmos",
    "Proverbios",
    "Eclesiastés",
    "Cantares",
  ];

  ntBooks = [
    "Mateo",
    "Marcos",
    "Lucas",
    "Juan",
    "Hechos",
    "Romanos",
    "1 Corintios",
    "2 Corintios",
    "Gálatas",
    "Efesios",
    "Filipenses",
    "Colosenses",
    "1 Tesalonicenses",
    "2 Tesalonicenses",
    "1 Timoteo",
    "2 Timoteo",
    "Tito",
    "Filemón",
    "Hebreos",
    "Santiago",
    "1 Pedro",
    "2 Pedro",
    "1 Juan",
    "2 Juan",
    "3 Juan",
    "Judas",
    "Apocalipsis",
  ];

  isLoading = false;
  isLoadingVerses = false;
  versions: { id: string; name: string }[] = [];
  chapters = Array.from({ length: 50 }, (_, i) => i + 1);

  selectedVersion: string = "";
  selectedBook: string = "";
  selectedChapter: number = 1;

  verses: { number: number; verse: string }[] = [];

  constructor(private bibleService: BibleService) {}

  ngOnInit(): void {
    this.loadVersions();
  }

  loadVersions() {
    this.isLoading = true;
    this.bibleService.getVersions().subscribe({
      next: (data) => {
        this.versions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al obtener versiones", err);
        this.isLoading = false;
      },
    });
  }

  onVersionSelect(versionId: string) {
    this.selectedVersion = versionId;
  }

  onBookSelect(book: string) {
    this.selectedBook = book;
  }

  onChapterSelect(chapter: number) {
    this.selectedChapter = chapter;
    this.loadVerses();
  }

  loadVerses() {
    if (!this.selectedVersion || !this.selectedBook || !this.selectedChapter) {
      return;
    }

    // Mostrar loader de versículos
    this.isLoadingVerses = true;

    // Suponiendo que un rango grande (1-50) nos da el capítulo completo:
    this.bibleService.getVerseRange(this.selectedVersion, this.selectedBook, this.selectedChapter, 1, "50").subscribe({
      next: (data) => {
        const cleanedText = data.text.replace(/'/g, '"');
        const versesArray = JSON.parse(cleanedText);

        this.verses = versesArray.map((v: any) => ({
          number: v.number,
          verse: v.verse
        }));

        this.isLoadingVerses = false;
      },
      error: (err) => {
        console.error("Error al obtener versículos", err);
        this.verses = [];
        this.isLoadingVerses = false;
      },
    });
  }
}
