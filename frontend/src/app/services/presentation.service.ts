import { Injectable } from "@angular/core";
import { createStore, withProps, select } from "@ngneat/elf";
import { Observable } from "rxjs";
import { FontFaceService } from "./font-face.service";
import { v4 as uuidv4 } from "uuid";

// =========================
// Definiciones de interfaces
// =========================
interface PresentationConfig {
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  transition: number;
  fontFamily: string;
  isFullScreen: boolean;
  isWindowOpen: boolean;
}

export interface VerseData {
  text: string;
  reference?: string;
}

export interface PresentationContent {
  type: "verse";
  content: VerseData;
  timestamp: number;
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

// Estado inicial
const initialState: PresentationState = {
  config: {
    fontSize: 32,
    backgroundColor: "#000000",
    textColor: "#ffffff",
    transition: 500,
    fontFamily: "Arial",
    isFullScreen: false,
    isWindowOpen: false,
  },
  windowState: {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  },
  currentContent: null,
  contentHistory: [],
  error: null,
};

// Store
const presentationStore = createStore(
  { name: "presentation" },
  withProps<PresentationState>(initialState)
);

@Injectable({
  providedIn: "root",
})
export class PresentationService {
  private isConnected = false;
  private channel: BroadcastChannel;
  private presentationWindow: Window | null = null;
  private senderId: string;
  private reconnectionTimer: any = null;
  private pingInterval: any = null;
  private heartbeatMissed = 0;
  private readonly MAX_MISSED_HEARTBEATS = 3;
  private readonly HEARTBEAT_INTERVAL = 2000;
  private contentQueue: PresentationContent[] = [];
  private isTransitioning = false;
  private lastTimestamp = 0;
  private timestampCounter = 0;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  constructor(private fontFaceService: FontFaceService) {
    this.senderId = uuidv4();
    this.channel = new BroadcastChannel("presentation");
    this.initializeService();
  }

  // =========================
  // Inicialización
  // =========================
  private initializeService(): void {
    this.initializeListeners();
    this.loadSavedState();
    this.setupChannelErrorHandling();
    this.startHeartbeat();
    this.preloadFonts();
  }

  private setupChannelErrorHandling(): void {
    // Manejar errores del canal de mensajes
    this.channel.addEventListener("messageerror", (event) => {
      console.error("Error en el canal de mensajes:", event);
      this.handleError("Error en la comunicación entre ventanas");
    });

    // Manejar errores generales
    window.addEventListener("unhandledrejection", (event) => {
      if (
        event.reason &&
        typeof event.reason === "object" &&
        "target" in event.reason
      ) {
        const target = (event.reason as any).target;
        if (target === this.channel || target === this.presentationWindow) {
          console.error("Error no manejado en la presentación:", event.reason);
          this.handleError("Error inesperado en la presentación");
        }
      }
    });

    // Manejar cierre inesperado de la ventana
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });

    // Monitorear el estado del canal
    const channelStateCheck = setInterval(() => {
      this.isChannelHealthy().then((healthy) => {
        if (!healthy) {
          console.error("El canal no está saludable.");
          this.recreateChannel();
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            clearInterval(channelStateCheck);
            this.handleError("No se pudo mantener la comunicación con la ventana de presentación.");
          }
        }
      });
    }, 10000); // Verificar cada 10 segundos
  }

  private recreateChannel(): void {
    try {
      // Cerrar el canal existente
      this.channel.close();

      // Crear un nuevo canal
      this.channel = new BroadcastChannel("presentation");

      // Reinicializar los listeners
      this.initializeListeners();

      console.log("Canal recreado exitosamente");

      // Reintentar la conexión
      if (this.isWindowOpen()) {
        this.sendInitialState();
      }
    } catch (error) {
      console.error("Error al recrear el canal:", error);
      this.handleError("Error al restablecer la comunicación");
    }
  }

  // Método auxiliar para verificar el estado del canal
  private async isChannelHealthy(): Promise<boolean> {
    try {
      // Intentar enviar un mensaje de prueba
      this.channel.postMessage({
        type: "healthCheck",
        timestamp: Date.now(),
        senderId: this.senderId,
      });
      return true;
    } catch (error) {
      console.error("Error en la verificación de salud del canal:", error);
      return false;
    }
  }

  private async preloadFonts(): Promise<void> {
    const fontsToLoad = [
      {
        family: "Roboto",
        source: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
      },
    ];

    try {
      await Promise.all(
        fontsToLoad.map((font) =>
          this.fontFaceService.loadFontsFromCss(font.source)
        )
      );
      await Promise.all(
        fontsToLoad.map((font) => this.fontFaceService.waitForFont(font.family))
      );
      console.log("Fuentes precargadas exitosamente");
    } catch (error) {
      console.error("Error al precargar fuentes:", error);
    }
  }

  // =========================
  // Sistema de Heartbeat
  // =========================
  private startHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.isWindowOpen()) {
        this.sendHeartbeat();
        this.checkHeartbeat();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private sendHeartbeat(): void {
    this.channel.postMessage({
      type: "heartbeat",
      timestamp: Date.now(),
      senderId: this.senderId,
    });
  }

  private checkHeartbeat(): void {
    if (!this.isConnected) return;

    this.heartbeatMissed++;
    if (this.heartbeatMissed >= this.MAX_MISSED_HEARTBEATS) {
      console.warn(
        `${this.MAX_MISSED_HEARTBEATS} heartbeats perdidos. Reconectando...`
      );
      this.handleConnectionLost();
    }
  }

  private resetHeartbeat(): void {
    this.heartbeatMissed = 0;
  }

  /**
   * Actualiza el contenido actual mostrado
   */
  public updateCurrentContent(newContent: PresentationContent | null): void {
    console.log("Actualizando contenido en el store (Ventana):", newContent); // DEBUG

    presentationStore.update((state) => ({
      ...state,
      currentContent: newContent,
    }));
    this.saveState();
  }

  // =========================
  // Manejo de Conexión
  // =========================
  private initializeListeners(): void {
    this.channel.onmessage = (event) => {
      const { type, senderId } = event.data;

      if (senderId === this.senderId) return;

      this.resetHeartbeat();
      this.resetReconnectionTimer();

      if (!this.isConnected && type === "pong") {
        this.isConnected = true;
        this.sendInitialState();
      }

      this.handleChannelMessage(event);
    };
  }

  public applyConfig(config: Partial<PresentationConfig>): void {
    presentationStore.update((state) => ({
      ...state,
      config: { ...state.config, ...config },
    }));
    this.saveState();
  }

  // ==================================================
  // Manejo de la ventana secundaria y comunicación
  // ==================================================
  private sendInitialState(): void {
    if (!this.isConnected) {
      console.log("No se envía estado inicial porque no hay conexión.");
      return;
    }

    console.log("Enviando estado inicial"); // DEBUG
    const st = presentationStore.query((s) => s);
    this.channel.postMessage({
      type: "init",
      data: {
        config: st.config,
        content: st.currentContent,
      },
      senderId: this.senderId,
    });
  }

  private handleChannelMessage(event: MessageEvent): void {
    const { type, data, senderId } = event.data;

    if (senderId === this.senderId) return;

    switch (type) {
      case "ready":
        console.log("Ventana secundaria lista");
        this.isConnected = true;
        this.sendInitialState();
        break;
      case "heartbeat":
        this.channel.postMessage({
          type: "pong",
          timestamp: Date.now(),
          senderId: this.senderId,
        });
        break;
      case "pong":
        this.isConnected = true;
        break;
      case "content":
        this.handleContentUpdate(data);
        break;
      case "config":
        this.applyConfig(data);
        break;
      case "contentAck":
        // Manejar acknowledgment si es necesario
        break;
      case "error":
        console.error("Error recibido desde la ventana secundaria:", data.message);
        this.handleError(data.message);
        break;
      default:
        console.warn("Tipo de mensaje desconocido recibido:", type);
    }
  }

  private handleContentUpdate(content: PresentationContent): void {
    console.log("Contenido recibido:", content);

    // Validar el contenido recibido
    if (!this.isValidContent(content)) {
      console.error("Contenido inválido recibido:", content);
      this.handleError("Contenido inválido recibido");
      return;
    }

    try {
      // Agregar el contenido a la cola si no está ya presente
      if (!this.contentQueue.some(
        (queuedContent) => queuedContent.timestamp === content.timestamp
      )) {
        this.contentQueue.push(content);
      }

      // Procesar la cola si no hay una transición en curso
      if (!this.isTransitioning) {
        this.processContentQueue().catch((error) => {
          console.error("Error al procesar la cola de contenido:", error);
          this.handleError("Error al procesar el contenido en cola");
        });
      }
    } catch (error) {
      console.error("Error al procesar actualización de contenido:", error);
      this.handleError("Error al procesar el contenido");
    }
  }

  // Método auxiliar para validar el contenido
  private isValidContent(content: any): content is PresentationContent {
    return (
      content &&
      typeof content === "object" &&
      "type" in content &&
      "content" in content &&
      "timestamp" in content &&
      typeof content.timestamp === "number" &&
      content.type === "verse" &&
      typeof content.content === "object" &&
      "text" in content.content
    );
  }

  // Método para manejar errores de forma centralizada
  private handleError(message: string): void {
    this.setError(message);

    // Notificar el error a través del canal
    this.channel.postMessage({
      type: "error",
      data: {
        message,
        timestamp: Date.now(),
      },
      senderId: this.senderId,
    });

    // Si el error es crítico, intentar reconectar
    if (this.isWindowOpen() && !this.isConnected) {
      this.handleConnectionLost();
    }
  }

  private resetReconnectionTimer(): void {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
    }

    this.reconnectionTimer = setTimeout(() => {
      if (this.isWindowOpen() && !this.isConnected) {
        this.handleConnectionLost();
      }
    }, 5000);
  }

  private async handleConnectionLost(): Promise<void> {
    if (!this.isConnected) return; // Evitar múltiples reconexiones
    this.isConnected = false;

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      try {
        await this.reconnectPresentation();
      } catch (error) {
        console.error("Error en reconexión:", error);
        this.setError("Error de conexión con la ventana de presentación");
      }
    } else {
      this.setError("Se perdió la conexión permanentemente");
      this.cleanup();
    }
  }

  private async reconnectPresentation(): Promise<boolean> {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      return false;
    }
    
    await this.cleanup(); // Asegurarse de que la limpieza es completa
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 
    return this.openPresentationWindow();
  }

  // =========================
  // Manejo de Ventana
  // =========================
  public async openPresentationWindow(screenId?: number): Promise<boolean> {
    if (this.presentationWindow) {
      try {
        const test = this.presentationWindow.closed;
      } catch (error) {
        this.presentationWindow = null;
        this.isConnected = false;
      }
    }

    if (this.presentationWindow?.closed) {
      this.cleanup();
    }

    try {
      const screens = await this.getAvailableScreens();
      const targetScreen = screenId
        ? screens[screenId]
        : screens[screens.length - 1];

      const options = {
        left: targetScreen ? (screen.width - targetScreen.availWidth) / 2 : 0,
        top: targetScreen ? (screen.height - targetScreen.availHeight) / 2 : 0,
        width: targetScreen?.availWidth || 800,
        height: targetScreen?.availHeight || 600,
        menubar: "no",
        toolbar: "no",
        location: "no",
        status: "no",
      };

      this.presentationWindow = window.open(
        "/presentation",
        "PresentationWindow",
        Object.entries(options)
          .map(([k, v]) => `${k}=${v}`)
          .join(",")
      );

      if (!this.presentationWindow) {
        throw new Error("No se pudo abrir la ventana de presentación");
      }

      this.updateConfig({ isWindowOpen: true });
      this.watchWindowPosition();
      this.startHeartbeat();

      await this.waitForWindowReady();

      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("Error al abrir ventana:", error);
      this.cleanup();
      return false;
    }
  }

  private async waitForWindowReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      const interval = 100;

      const checkReady = () => {
        if (attempts >= maxAttempts) {
          reject(new Error("Timeout esperando ventana"));
          return;
        }

        if (this.isConnected) {
          resolve();
          return;
        }

        attempts++;
        setTimeout(checkReady, interval);
      };

      checkReady();
    });
  }

  public closePresentationWindow(): void {
    if (this.presentationWindow && !this.presentationWindow.closed) {
      this.presentationWindow.close();
    }
    this.cleanup();
  }

  // =========================
  // Manejo de Contenido
  // =========================
  private getUniqueTimestamp(): number {
    const now = Date.now();
    if (now > this.lastTimestamp) {
      this.lastTimestamp = now;
      this.timestampCounter = 0;
    } else {
      this.timestampCounter++;
    }
    return this.lastTimestamp + this.timestampCounter;
  }

  public async sendContent(
    content: Omit<PresentationContent, "timestamp">
  ): Promise<void> {
    if (!this.isWindowOpen()) {
      const opened = await this.openPresentationWindow();
      if (!opened) {
        this.setError("No se pudo abrir la ventana");
        return;
      }
    }

    if (!this.isConnected) {
      await this.waitForWindowReady();
    }

    const newContent: PresentationContent = {
      ...content,
      timestamp: this.getUniqueTimestamp(),
    };

    // Verificar si el contenido ya está en la cola
    if (!this.contentQueue.some(
      (queuedContent) => queuedContent.timestamp === newContent.timestamp
    )) {
      if (this.contentQueue.length >= 100) { // Límite de 100 contenidos en cola
        console.warn("La cola de contenido ha alcanzado su límite máximo.");
        this.contentQueue.shift(); // Eliminar el contenido más antiguo
      }

      if (this.isTransitioning) {
        this.contentQueue.push(newContent);
      } else {
        await this.transitionContent(newContent);
      }
    } else {
      console.warn("El contenido ya está en la cola:", newContent);
    }
  }

  private async transitionContent(content: PresentationContent): Promise<void> {
    if (this.isTransitioning) return; // Evita iniciar otra transición
  
    this.isTransitioning = true;
    this.pushToContentHistory(content);
  
    // Envía el contenido al canal
    this.channel.postMessage({
      type: "content",
      data: content,
      senderId: this.senderId,
    });
  
    // Espera el tiempo de transición
    await this.waitForTransition();
    this.updateCurrentContent(content);
    this.isTransitioning = false;
  
    // Procesar el siguiente contenido en la cola
    if (this.contentQueue.length > 0) {
      this.processContentQueue().catch((error) => {
        console.error("Error al procesar la cola de contenido:", error);
        this.handleError("Error al procesar el contenido en cola");
      });
    }
  }
  

  private async processContentQueue(): Promise<void> {
    if (this.isTransitioning) return; // Evita procesamiento simultáneo
    
    while (this.contentQueue.length > 0 && !this.isTransitioning) {
      const content = this.contentQueue[0]; // No remover hasta después de procesar
      try {
        await this.transitionContent(content); // Esperar la transición
        this.contentQueue.shift(); // Remover solo después de éxito
      } catch (error) {
        console.error("Error procesando contenido:", error);
        break; // Detener el procesamiento en caso de error
      }
    }
  }
  

  private async waitForTransition(): Promise<void> {
    const transitionTime = presentationStore.query(
      (state) => state.config.transition
    );
    return new Promise((resolve) => setTimeout(resolve, transitionTime));
  }

  // =========================
  // Observables y Estado
  // =========================
  get config$(): Observable<PresentationConfig> {
    return presentationStore.pipe(select((state) => state.config));
  }

  get windowState$(): Observable<WindowPosition> {
    return presentationStore.pipe(select((state) => state.windowState));
  }

  get currentContent$(): Observable<PresentationContent | null> {
    return presentationStore.pipe(select((state) => state.currentContent));
  }

  get error$(): Observable<string | null> {
    return presentationStore.pipe(select((state) => state.error));
  }

  public updateConfig(newConfig: Partial<PresentationConfig>): void {
    presentationStore.update((state) => ({
      ...state,
      config: { ...state.config, ...newConfig },
    }));
    this.saveState();
  }

  private updateWindowState(newWindowState: Partial<WindowPosition>): void {
    presentationStore.update((state) => ({
      ...state,
      windowState: { ...state.windowState, ...newWindowState },
    }));
    this.saveState();
  }

  private pushToContentHistory(content: PresentationContent): void {
    presentationStore.update((state) => {
      const updatedHistory = [...state.contentHistory, content];
      if (updatedHistory.length > 50) {
        updatedHistory.shift();
      }
      return {
        ...state,
        contentHistory: updatedHistory,
      };
    });
    this.saveState();
  }

  private setError(errorMsg: string | null): void {
    presentationStore.update((state) => ({
      ...state,
      error: errorMsg,
    }));
    this.saveState();
  }

  // =========================
  // Utilidades
  // =========================
  private watchWindowPosition(): void {
    if (!this.presentationWindow) return;

    const checkPosition = () => {
      if (this.presentationWindow && !this.presentationWindow.closed) {
        this.updateWindowState({
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

  private async getAvailableScreens(): Promise<Screen[]> {
    if ("getScreenDetails" in window.screen) {
      try {
        return await (window.screen as any).getScreenDetails();
      } catch (error) {
        console.error("Error obteniendo detalles de pantalla:", error);
        return [];
      }
    }
    return [];
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null; // Asegurarse de que se limpia
    }
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null; // Asegurarse de que se limpia
    }

    this.presentationWindow = null;
    this.isConnected = false;
    this.updateConfig({ isWindowOpen: false, isFullScreen: false });
    this.updateCurrentContent(null);
    this.contentQueue = [];
    this.saveState();
  }

  // ============================
  // Persistencia en localStorage
  // ============================
  private saveState(): void {
    const state = presentationStore.query((s) => s);
    localStorage.setItem("presentationState", JSON.stringify(state));
    //console.log("Estado guardado:", state); // DEBUG
  }

  private loadSavedState(): void {
    try {
      const saved = localStorage.getItem("presentationState");
      if (saved) {
        const state: PresentationState = JSON.parse(saved);
        presentationStore.update(() => state);
        //console.log("Estado cargado:", state); // DEBUG
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
    }
  }

  // =======================
  // Métodos auxiliares
  // =======================
  clearContent(): void {
    // Limpia contenido actual y cola
    this.updateCurrentContent(null);
    this.contentQueue = [];
    this.channel.postMessage({ type: "clear", senderId: this.senderId });
  }

  getContentHistory(): PresentationContent[] {
    return presentationStore.query((s) => s.contentHistory);
  }

  isWindowOpen(): boolean {
    const st = presentationStore.query((s) => s);
    return (
      this.presentationWindow !== null &&
      !this.presentationWindow.closed &&
      st.config.isWindowOpen
    );
  }

  // Enviar mensaje de ready con senderId
  sendReadyMessage(): void {
    console.log("Enviando mensaje ready");
    this.channel.postMessage({
      type: "ready",
      senderId: this.senderId,
    });
  }

  /**
   * Envía un mensaje genérico a través del canal con senderId
   * @param message El mensaje a enviar
   */
  public sendMessage(message: any): void {
    this.channel.postMessage({ ...message, senderId: this.senderId });
  }

  /**
   * Envía un acknowledgment de contenido
   * @param content El contenido a reconocer
   */
  public sendContentAcknowledgement(content: PresentationContent): void {
    this.channel.postMessage({
      type: "contentAck",
      data: {
        id: content.timestamp.toString(),
        status: "success",
      },
      senderId: this.senderId,
    });
  }
}
