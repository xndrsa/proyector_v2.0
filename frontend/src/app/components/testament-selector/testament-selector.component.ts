import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { books, Book } from "../../constants";

@Component({
  selector: "app-testament-selector",
  standalone: true,
  imports: [CommonModule],
  template: `
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
              (click)="selectBook(book)"
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
              (click)="selectBook(book)"
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
  `,
  styles: [
    `
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
    `,
  ],
})
export class TestamentSelectorComponent {
  @Input() activeTab: "AT" | "NT" = "AT";
  @Input() selectedVersion: boolean = true; // Indica si hay una versión seleccionada
  @Output() bookSelected = new EventEmitter<Book>();

  searchQuery: string = "";

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

  selectBook(book: Book) {
    this.bookSelected.emit(book);
  }
}
