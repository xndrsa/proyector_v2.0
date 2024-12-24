import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { books, Book } from "../../constants";

@Component({
  selector: "app-testament-selector",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative mb-4">
      <input
        #searchInput
        type="text"
        placeholder=""
        class="w-full border p-2 pl-10 rounded search-input focus:outline-none focus:ring-2 focus:ring-blue-500"
        (input)="onSearchBooks($event)"
      />
      <span class="material-icons absolute left-3 top-2 text-gray-400"
        >search</span
      >
      <button
        *ngIf="searchQuery"
        (click)="clearSearch(searchInput)"
        class="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
      >
        <span class="material-icons">backspace</span>
      </button>
    </div>

    <div class="flex mb-4 tab-container border-b border-gray-200">
      <button
        (click)="setActiveTab('AT')"
        [class.active-tab]="activeTab === 'AT'"
        class="tab-button flex-1 py-2 px-4 text-center "
      >
        Antiguo Testamento
      </button>
      <button
        (click)="setActiveTab('NT')"
        [class.active-tab]="activeTab === 'NT'"
        class="tab-button flex-1 py-2 px-4 text-center "
      >
        Nuevo Testamento
      </button>
    </div>

    <div class="flex-1 overflow-y-auto book-list">
      <ng-container *ngIf="selectedVersion; else noVersionSelected">
        <ul>
          <li
            *ngFor="let book of filteredBooks"
            (click)="selectBook(book)"
            [class.selected-book]="selectedBook === book"
            class="book-item"
          >
            {{ book.names[0] }}
          </li>
        </ul>
      </ng-container>
      <ng-template #noVersionSelected>
        <div class="no-version-message">
          Selecciona una versión primero.
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .search-input {
        font-size: 1rem;
        border: 1px solid #e2e8f0;
        background-color: #f8fafc;
        transition: all 0.2s ease;
      }

      .search-input:focus {
        background-color: white;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      .tab-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #f8fafc;
      }

      .tab-button {
        font-size: 1rem;
        font-weight: 600;
        color: #64748b;
        border: 1px solid transparent;
        background-color: #f8fafc;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .tab-button:hover {
        background-color: #e2e8f0;
        color: #3b82f6;
      }

      .tab-button.active-tab {
        background-color: #ffffff;
        color: #3b82f6;
        border-bottom: 2px solid #3b82f6;
        font-weight: bold;
        box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
      }

      .book-list {
        max-height: calc(100vh - 10rem);
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
      }

      .book-list::-webkit-scrollbar {
        width: 6px;
      }

      .book-list::-webkit-scrollbar-track {
        background: #f1f5f9;
      }

      .book-list::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 3px;
      }

      .book-item {
        padding: 0.75rem 1rem;
        margin: 0.25rem 0;
        font-size: 0.95rem;
        color: #475569;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      .book-item:hover {
        background-color: #f1f5f9;
        border-color: #e2e8f0;
        transform: translateX(4px);
      }

      .book-item.selected-book {
        background-color: #F1F1F1;
        color: black;
        font-weight: bold;
        border-color: rgb(212 212 212);
        transform: none; /* Eliminar la animación de desplazamiento para el seleccionado */
      }

      .no-version-message {
        padding: 1rem;
        text-align: center;
        color: #64748b;
        font-style: italic;
      }
    `,
  ],
})
export class TestamentSelectorComponent {
  @Input() activeTab: "AT" | "NT" = "AT";
  @Input() selectedVersion: boolean = true;
  @Output() bookSelected = new EventEmitter<Book>();
  selectedBook: Book | null = null;

  searchQuery: string = "";
  private booksCache = {
    AT: books.filter((book) => book.testament === "Antiguo Testamento"),
    NT: books.filter((book) => book.testament === "Nuevo Testamento"),
  };
  filteredBooks: Book[] = [...this.booksCache.AT];

  setActiveTab(tab: "AT" | "NT"): void {
    this.activeTab = tab;
    this.filterBooks();
  }

  onSearchBooks(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = this.removeAccents(input);
    this.filterBooks();
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = "";
    this.searchQuery = "";
    this.filterBooks();
    input.focus();
  }

  private filterBooks(): void {
    const books = this.booksCache[this.activeTab];
    if (this.searchQuery) {
      this.filteredBooks = books.filter((book) =>
        book.names.some((name) =>
          this.removeAccents(name.toLowerCase()).includes(this.searchQuery)
        )
      );
    } else {
      this.filteredBooks = books;
    }
  }

  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  selectBook(book: Book): void {
    if (!this.selectedVersion) {
      console.warn("No se puede seleccionar un libro sin una versión activa.");
      return;
    }
  
    this.selectedBook = book;
    this.bookSelected.emit(book);
  }
  
}
