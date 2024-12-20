import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface BibleVersion {
  id: string;
  name: string;
}

interface VerseResponse {
  version: string;
  book: string;
  chapter: number;
  verse: number;
  range?: number;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class BibleService {
  private baseUrl = 'http://localhost:5000';
  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de versiones disponibles de la Biblia.
   * GET /bible/versions
   */
  getVersions(): Observable<BibleVersion[]> {
    return this.http.get<BibleVersion[]>(`${this.baseUrl}/bible/versions`);
  }

  /**
   * Obtiene un versículo específico de la Biblia.
   * GET /bible/read/{version}/{book}/{chapter}/{verse}
   */
  getVerse(version: string, book: string, chapter: number, verse: number): Observable<VerseResponse> {
    const url = `${this.baseUrl}/bible/read/${version}/${book}/${chapter}/${verse}`;
    return this.http.get<VerseResponse>(url);
  }

  /**
   * Obtiene un rango de versículos.
   * GET /bible/read/{version}/{book}/{chapter}/{verse}-{range}
   * ejemplo de range: "5" (solo un versículo), o "5-10" (varios versículos)
   */
  getVerseRange(version: string, book: string, chapter: number, verse: number, range: string): Observable<VerseResponse> {
    const url = `${this.baseUrl}/bible/read/${version}/${book}/${chapter}/${verse}-${range}`;
    return this.http.get<VerseResponse>(url);
  }
}
