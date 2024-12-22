import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FontFaceService {

  constructor() { }
  /**
   * Carga una hoja de estilo CSS para fuentes web, como las de Google Fonts.
   * @param url URL del archivo CSS que define las fuentes.
   * @returns Una promesa que se resuelve cuando la hoja de estilo está cargada.
   */
  loadFontsFromCss(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${url}"]`)) {
        resolve();
        return;
      }

      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = url;

      linkElement.onload = () => {
        console.log(`Hoja de estilo cargada: ${url}`);
        resolve();
      };

      linkElement.onerror = (error) => {
        console.error(`Error al cargar la hoja de estilo: ${url}`, error);
        reject(error);
      };

      document.head.appendChild(linkElement);
    });
  }

  /**
   * Verifica si una fuente está cargada en el documento.
   * @param family Nombre de la familia de la fuente.
   * @returns Verdadero si la fuente está cargada, falso en caso contrario.
   */
  isFontLoaded(family: string): boolean {
    return document.fonts.check(`16px '${family}'`);
  }

  /**
   * Espera a que una fuente específica esté cargada.
   * @param family Nombre de la familia de la fuente.
   * @param timeout Tiempo máximo en milisegundos para esperar.
   * @returns Una promesa que se resuelve cuando la fuente está cargada.
   */
  async waitForFont(family: string, timeout: number = 5000): Promise<void> {
    const startTime = performance.now();

    while (!this.isFontLoaded(family)) {
      if (performance.now() - startTime > timeout) {
        throw new Error(`Tiempo de espera agotado para cargar la fuente: ${family}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms wait time
    }

    console.log(`Fuente cargada: ${family}`);
  }
  
}
