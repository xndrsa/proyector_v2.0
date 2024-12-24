import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Version, getVersionName } from "../constants";

/**
 * Representa una versión de la Biblia.
 */
interface BibleVersion {
  id: number;
  name: string;
  version: string;
  uri: string;
}

/**
 * Respuesta del servicio que contiene una lista de versiones de la Biblia.
 */
interface BibleVersionsResponse {
  versions: BibleVersion[];
}

/**
 * Respuesta del servicio para un versículo o rango de versículos.
 */
interface VerseResponse {
  version: string;
  book: string;
  chapter: number;
  verse: number;
  range?: number;
  text: string;
}

@Injectable({
  providedIn: "root",
})
export class BibleService {
  private baseUrl = "http://localhost:5000";

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de versiones disponibles de la Biblia.
   * 
   * @returns Observable que emite un objeto `BibleVersionsResponse` con las versiones de la Biblia.
   * @example
   * this.bibleService.getVersions().subscribe(response => {
   *   console.log(response.versions);
   * });
   */
  getVersions(): Observable<BibleVersionsResponse> {
    return this.http.get<BibleVersionsResponse>(`${this.baseUrl}/bible/versions`).pipe(
      catchError((error) => {
        console.error("Error fetching Bible versions:", error);
        return throwError(() => new Error("Failed to fetch Bible versions. Please try again later."));
      })
    );
  }

  /**
   * Obtiene un versículo específico de la Biblia.
   * 
   * @param version - La versión de la Biblia (por ejemplo, "KJV", "NIV").
   * @param bookApiName - El nombre del libro en formato API (por ejemplo, "genesis", "exodus").
   * @param chapter - El número del capítulo.
   * @param verse - El número del versículo.
   * @returns Observable que emite un objeto `VerseResponse` con el texto del versículo solicitado.
   * @example
   * this.bibleService.getVerse('KJV', 'genesis', 1, 1).subscribe(response => {
   *   console.log(response.text);
   * });
   */
  getVerse(
    version: string,
    bookApiName: string,
    chapter: number,
    verse: number
  ): Observable<VerseResponse> {
    const url = `${this.baseUrl}/bible/read/${version}/${bookApiName}/${chapter}/${verse}`;
    return this.http.get<VerseResponse>(url).pipe(
      catchError((error) => {
        console.error(`Error fetching Bible verse: ${version} ${bookApiName} ${chapter}:${verse}`, error);
        return throwError(() => new Error("Failed to fetch Bible verse. Please try again later."));
      })
    );
  }

  /**
   * Obtiene un rango de versículos.
   * 
   * @param version - La versión de la Biblia (por ejemplo, "KJV", "NIV").
   * @param bookApiName - El nombre del libro en formato API (por ejemplo, "genesis", "exodus").
   * @param chapter - El número del capítulo.
   * @param verse - El número del versículo inicial.
   * @param range - El rango de versículos en formato "5" (un versículo) o "5-10" (múltiples versículos).
   * @returns Observable que emite un objeto `VerseResponse` con el texto del rango solicitado.
   * @throws Error si el formato del rango no es válido.
   * @example
   * this.bibleService.getVerseRange('KJV', 'genesis', 1, 1, '1-3').subscribe(response => {
   *   console.log(response.text);
   * });
   */
  getVerseRange(
    version: string,
    bookApiName: string,
    chapter: number,
    verse: number,
    range: string
  ): Observable<VerseResponse> {
    if (!/^\d+(-\d+)?$/.test(range)) {
      throw new Error("Invalid range format. Use 'X' or 'X-Y'.");
    }

    const url = `${this.baseUrl}/bible/read/${version}/${bookApiName}/${chapter}/${verse}-${range}`;
    return this.http.get<VerseResponse>(url).pipe(
      catchError((error) => {
        console.error(`Error fetching Bible verse range: ${version} ${bookApiName} ${chapter}:${verse}-${range}`, error);
        return throwError(() => new Error("Failed to fetch Bible verse range. Please try again later."));
      })
    );
  }
}
