import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import {
  PresentationService,
  VerseData,
} from "../../services/presentation.service";

@Component({
  selector: "app-verse-panel",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="col-span-3 bg-white p-4 shadow-md rounded overflow-y-auto h-[calc(100vh-2rem)] verse-panel"
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
          <div
            class="verse"
            *ngFor="let verse of verses"
            (click)="onVerseClick(verse)"
          >
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
export class VersePanelComponent {
  @Input() isLoadingVerses: boolean = false;
  @Input() selectedBook: { names: string[]; apiName: string } | null = null;
  @Input() selectedChapter: number | null = null;
  @Input() selectedVersion: string | null = null;
  @Input() verses: { number: number; verse: string }[] = [];

  @Output() verseClicked = new EventEmitter<VerseData>();

  constructor(private presentationService: PresentationService) {}

  onVerseClick(verse: { number: number; verse: string }): void {
    if (this.selectedBook && this.selectedChapter) {
      const reference = `${this.selectedBook.names[0]} ${this.selectedChapter}:${verse.number}`;
      const verseData: VerseData = {
        text: verse.verse,
        reference: reference,
      };
      this.verseClicked.emit(verseData);
      this.presentationService.sendContent({
        type: "verse",
        content: verseData,
      });
    }
  }
}
