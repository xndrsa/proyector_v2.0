import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

interface PresentationConfig {
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  transition: number;
  fontFamily: string;
  isFullScreen: boolean;
  isWindowOpen: boolean;
}

interface PresentationContent {
  type: "verse" | "song" | "announcement" | "image";
  content: any;
  timestamp: number;
  metadata?: {
    title?: string;
    subtitle?: string;
    reference?: string;
  };
}

interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PresentationState {
  config: PresentationConfig;
  windowState: WindowPosition;
  currentContent: PresentationContent | null;
  contentHistory: PresentationContent[];
  error: string | null;
}

interface PresentationAcknowledgement {
  id: string;
  status: "success" | "error";
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class PresentationService {
  private channel: BroadcastChannel = new BroadcastChannel("presentation");
  private presentationWindow: Window | null = null;

  // Principal states
  private config = new BehaviorSubject<PresentationConfig>({
    fontSize: 32,
    backgroundColor: "#000000",
    textColor: "#ffffff",
    transition: 500,
    fontFamily: "Arial",
    isFullScreen: false,
    isWindowOpen: false,
  });

  private windowState = new BehaviorSubject<WindowPosition>({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });

  private currentContent = new BehaviorSubject<PresentationContent | null>(
    null
  );
  private contentHistory: PresentationContent[] = [];
  private error = new Subject<string>();
  private contentQueue: PresentationContent[] = [];
  private isTransitioning = false;

  private acknowledgements = new Map<
    string,
    (ack: PresentationAcknowledgement) => void
  >();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  constructor() {
    this.initializeListeners();
    this.loadSavedState();
    this.setupChannelErrorHandling();
    this.setupKeyboardShortcuts();
    this.preloadFonts();
  }

  private initializeListeners(): void {
    window.addEventListener("beforeunload", () => this.cleanup());
    document.addEventListener("fullscreenchange", () => {
      this.updateConfig({ isFullScreen: !!document.fullscreenElement });
    });

    this.channel.onmessage = (event) => this.handleChannelMessage(event);
  }

  private sendInitialState(): void {
    this.channel.postMessage({
      type: "init",
      data: {
        config: this.config.getValue(),
        content: this.currentContent.getValue(),
      },
    });
  }

  private handleContentAcknowledgement(ack: PresentationAcknowledgement): void {
    const handler = this.acknowledgements.get(ack.id);
    if (handler) {
      handler(ack);
      this.acknowledgements.delete(ack.id);
    }

    if (ack.status === "error") {
      this.error.next(ack.message || "Error en la presentación");
      this.handlePresentationError();
    }
  }

  private handlePresentationError(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      this.reconnectPresentation();
    } else {
      this.error.next("No se pudo reconectar con la ventana de presentación");
      this.cleanup();
    }
  }

  private async reconnectPresentation(): Promise<void> {
    this.closePresentationWindow();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.openPresentationWindow();
  }

  async waitForContentAcknowledgement(
    content: PresentationContent
  ): Promise<boolean> {
    const id = crypto.randomUUID();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.acknowledgements.delete(id);
        resolve(false);
      }, 5000);

      this.acknowledgements.set(id, (ack) => {
        clearTimeout(timeout);
        resolve(ack.status === "success");
      });

      this.channel.postMessage({
        type: "content",
        id,
        data: content,
      });
    });
  }

  private setupChannelErrorHandling(): void {
    this.channel.addEventListener("messageerror", (event) => {
      this.error.next("Error en la comunicación entre ventanas");
      console.error("Channel message error:", event);
    });
  }

  async syncState(): Promise<void> {
    if (!this.isWindowOpen()) return;

    const currentState = {
      config: this.config.getValue(),
      content: this.currentContent.getValue(),
      history: this.contentHistory,
    };

    this.channel.postMessage({
      type: "sync",
      data: currentState,
    });
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isWindowOpen()) return false;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);

      this.channel.postMessage({
        type: "ping",
        timestamp: Date.now(),
      });

      const handler = (event: MessageEvent) => {
        if (event.data.type === "pong") {
          clearTimeout(timeout);
          this.channel.removeEventListener("message", handler);
          resolve(true);
        }
      };

      this.channel.addEventListener("message", handler);
    });
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "b": // Ctrl + B for black screen
            event.preventDefault();
            this.toggleBlackScreen();
            break;
          case "f": // Ctrl + F for fullscreen
            event.preventDefault();
            this.toggleFullScreen();
            break;
          case "w": // Ctrl + W to close window
            event.preventDefault();
            this.closePresentationWindow();
            break;
        }
      }
    });
  }

  toggleBlackScreen(): void {
    this.channel.postMessage({
      type: "blackscreen",
      data: { active: true },
    });
  }

  private async preloadFonts(): Promise<void> {
    const fonts = [
      { family: "Arial" },
      { family: "Times New Roman" },
      { family: this.config.getValue().fontFamily },
    ];

    try {
      await Promise.all(
        fonts.map((font) => document.fonts.load(`16px ${font.family}`))
      );
    } catch (error) {
      console.error("Error preloading fonts:", error);
    }
  }

  private handleChannelMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    switch (type) {
      case "ready":
        this.sendInitialState();
        break;
      case "error":
        this.error.next(data);
        break;
      case "windowState":
        this.windowState.next(data);
        break;
      case "contentAck":
        this.handleContentAcknowledgement(data);
        break;
    }
  }
  // window management
  async openPresentationWindow(screenId?: number): Promise<boolean> {
    if (this.presentationWindow && !this.presentationWindow.closed) {
      this.presentationWindow.focus();
      return true;
    }

    try {
      const screens = await this.getAvailableScreens();
      const targetScreen = screenId
        ? screens[screenId]
        : screens[screens.length - 1];

      const options = {
        left: targetScreen ? (screen.width - targetScreen.availWidth) / 2 : 0, // Centrado horizontal
        top: targetScreen ? (screen.height - targetScreen.availHeight) / 2 : 0, // Centrado vertical
        width: targetScreen?.availWidth || 800,
        height: targetScreen?.availHeight || 600,
        menubar: "no",
        toolbar: "no",
        location: "no",
        status: "no",
      };

      // Abre la nueva ventana
      this.presentationWindow = window.open(
        "/presentation",
        "PresentationWindow",
        Object.entries(options)
          .map(([k, v]) => `${k}=${v}`)
          .join(",")
      );

      if (this.presentationWindow) {
        this.updateConfig({ isWindowOpen: true });
        this.watchWindowPosition();
        return true;
      }

      throw new Error("Failed to open presentation window");
    } catch (error) {
      //this.error.next(error.message);
      return false;
    }
  }

  closePresentationWindow(): void {
    if (this.presentationWindow && !this.presentationWindow.closed) {
      this.presentationWindow.close();
    }
    this.cleanup();
  }

  // content management
  async sendContent(
    content: Omit<PresentationContent, "timestamp">
  ): Promise<void> {
    const newContent: PresentationContent = {
      ...content,
      timestamp: Date.now(),
    };

    if (this.isTransitioning) {
      this.contentQueue.push(newContent);
      return;
    }

    await this.transitionContent(newContent);
  }

  private async transitionContent(content: PresentationContent): Promise<void> {
    this.isTransitioning = true;
    this.contentHistory.push(content);

    this.channel.postMessage({
      type: "content",
      data: content,
    });

    await this.waitForTransition();
    this.currentContent.next(content);
    this.isTransitioning = false;

    if (this.contentQueue.length > 0) {
      const nextContent = this.contentQueue.shift()!;
      await this.transitionContent(nextContent);
    }
  }

  private async waitForTransition(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, this.config.getValue().transition)
    );
  }

  // update config for presentations
  updateConfig(newConfig: Partial<PresentationConfig>): void {
    const currentConfig = this.config.getValue();
    const updatedConfig = { ...currentConfig, ...newConfig };

    this.config.next(updatedConfig);
    this.saveState();

    this.channel.postMessage({
      type: "config",
      data: updatedConfig,
    });
  }

  // state management
  private saveState(): void {
    const state: PresentationState = {
      config: this.config.getValue(),
      windowState: this.windowState.getValue(),
      currentContent: this.currentContent.getValue(),
      contentHistory: this.contentHistory,
      error: null,
    };

    localStorage.setItem("presentationState", JSON.stringify(state));
  }

  private loadSavedState(): void {
    try {
      const saved = localStorage.getItem("presentationState");
      if (saved) {
        const state: PresentationState = JSON.parse(saved);
        this.config.next(state.config);
        this.windowState.next(state.windowState);
        this.currentContent.next(state.currentContent);
        this.contentHistory = state.contentHistory;
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
    }
  }

  async toggleFullScreen(): Promise<void> {
    if (!this.presentationWindow) return;

    try {
      if (!document.fullscreenElement) {
        await this.presentationWindow.document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      this.error.next("Error toggling fullscreen");
    }
  }

  // utils
  private async getAvailableScreens(): Promise<Screen[]> {
    if ("getScreenDetails" in window.screen) {
      try {
        return await (window.screen as any).getScreenDetails();
      } catch (error) {
        console.error("Error getting screen details:", error);
        return [];
      }
    }
    return [];
  }

  private watchWindowPosition(): void {
    if (!this.presentationWindow) return;

    const checkPosition = () => {
      if (this.presentationWindow && !this.presentationWindow.closed) {
        this.windowState.next({
          x: this.presentationWindow.screenX,
          y: this.presentationWindow.screenY,
          width: this.presentationWindow.outerWidth,
          height: this.presentationWindow.outerHeight,
        });
        requestAnimationFrame(checkPosition);
      }
    };

    checkPosition();
  }

  private cleanup(): void {
    this.presentationWindow = null;
    this.updateConfig({ isWindowOpen: false, isFullScreen: false });
    this.currentContent.next(null);
    this.contentQueue = [];
    this.saveState();
  }

  // Observables
  get config$(): Observable<PresentationConfig> {
    return this.config.asObservable();
  }

  get windowState$(): Observable<WindowPosition> {
    return this.windowState.asObservable();
  }

  get currentContent$(): Observable<PresentationContent | null> {
    return this.currentContent.asObservable();
  }

  get error$(): Observable<string> {
    return this.error.asObservable();
  }

  clearContent(): void {
    this.currentContent.next(null);
    this.contentQueue = [];
    this.channel.postMessage({ type: "clear" });
  }

  getContentHistory(): PresentationContent[] {
    return [...this.contentHistory];
  }

  isWindowOpen(): boolean {
    return this.presentationWindow !== null && !this.presentationWindow.closed;
  }
}
