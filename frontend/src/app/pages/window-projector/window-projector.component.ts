import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  PresentationService,
  PresentationContent,
} from "../../services/presentation.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-window-projector",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="presentation-container"
      [style.opacity]="isTransitioning ? 0 : 1"
      *ngIf="currentContent"
    >
      <div class="content">
        <div *ngIf="currentContent.type === 'verse'">
          <p class="verse-text">{{ currentContent.content.text }}</p>
          <p class="verse-reference">{{ currentContent.content.reference }}</p>
        </div>
      </div>
    </div>
    <div *ngIf="!currentContent" class="no-content">
      <p>No hay contenido para mostrar.</p>
    </div>
  `,
  styles: [
    `
      .presentation-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: var(--background-color, #000);
        color: var(--text-color, #fff);
        font-size: var(--font-size, 32px);
        font-family: var(--font-family, Arial);
        transition: all var(--transition, 0.5s) ease;
        padding: 2rem;
        overflow: hidden;
      }

      .content {
        text-align: center;
        max-width: 80%;
      }

      .verse-text {
        font-size: 1.5em;
        margin-bottom: 0.5em;
        line-height: 1.4;
      }

      .verse-reference {
        font-size: 1.2em;
        color: var(--reference-color, #ccc);
      }

      .no-content {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #333;
        color: #fff;
        font-size: 24px;
      }
    `,
  ],
})
export class WindowProjectorComponent implements OnInit, OnDestroy {
  currentContent: PresentationContent | null = null;
  isTransitioning = false;
  private destroy$ = new Subject<void>();

  constructor(private presentationService: PresentationService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de contenido del servicio
    this.presentationService.currentContent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((content) => {
        console.log("Nuevo contenido recibido en la Ventana:", content);
        this.handleContentUpdate(content);
      });

    // Enviar mensaje de ready a través del servicio
    this.presentationService.sendReadyMessage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async handleContentUpdate(content: PresentationContent | null): Promise<void> {
    console.log("HandleContentUpdate llamado con:", content); // DEBUG
  
    if (!content) {
      this.currentContent = null;
      return;
    }
  
    this.isTransitioning = true;
    await this.waitForNextFrame();
    this.currentContent = content;
  
    const transitionTimeStr = getComputedStyle(document.documentElement)
      .getPropertyValue("--transition")
      .trim();
    const transitionTime = transitionTimeStr
      ? parseInt(transitionTimeStr.replace("ms", ""), 10)
      : 500;
  
    console.log(`Esperando ${transitionTime} ms para la transición`); // DEBUG
    await new Promise((resolve) => setTimeout(resolve, transitionTime));
    this.isTransitioning = false;
  
    // Enviar reconocimiento de contenido a través del servicio
    this.presentationService.sendContentAcknowledgement(content);
  }
  

  private waitForNextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
}
