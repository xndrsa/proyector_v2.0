import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bible',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Main Layout -->
      <div class="flex-1 grid grid-cols-6 gap-4 p-4">
        <!-- Left Panel -->
        <div class="col-span-2 bg-white p-4 shadow-md rounded flex flex-col max-h-[calc(100vh-2rem)]">
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
                class="p-2 hover:bg-gray-200 cursor-pointer rounded"
              >
                {{ book }}
              </li>
            </ul>
            <ul *ngIf="activeTab === 'NT'">
              <li
                *ngFor="let book of ntBooks"
                class="p-2 hover:bg-gray-200 cursor-pointer rounded"
              >
                {{ book }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Middle Panel -->
        <div
          class="col-span-1 bg-white p-2 shadow-md rounded flex flex-col items-center max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <div class="w-full mb-2 text-center font-semibold text-gray-700">
            Versiones
          </div>
          <button
            *ngFor="let version of versions"
            class="w-full mb-2 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            {{ version }}
          </button>
          <div class="grid grid-cols-4 gap-2">
            <button
              *ngFor="let number of chapters"
              class="bg-gray-300 p-2 text-xs rounded hover:bg-gray-400"
            >
              {{ number }}
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="col-span-3 bg-white p-4 shadow-md rounded overflow-y-auto max-h-[calc(100vh-2rem)]">
          <h2 class="text-xl font-semibold mb-2">Mateo 1</h2>
          <p *ngFor="let verse of verses" class="mb-2">
            <span class="font-bold">{{ verse.number }}</span>
            {{ verse.text }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class BibleComponent {
  activeTab: 'AT' | 'NT' = 'AT';

  atBooks = [
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio',
    'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel',
    '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas',
    'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos',
    'Proverbios', 'Eclesiastés', 'Cantares'
  ];

  ntBooks = [
    'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos',
    'Romanos', '1 Corintios', '2 Corintios', 'Gálatas',
    'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses',
    '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito',
    'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro',
    '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'
  ];

  versions = ['RV1960', 'DHH', 'NVI', 'LBLA', 'OSO'];
  chapters = Array.from({ length: 52 }, (_, i) => i + 1);
  verses = Array.from({ length: 36 }, (_, i) => ({
    number: i + 1,
    text: 'Lorem ipsum.',
  }));
}
