import { Injectable } from "@angular/core";
import { Book, Version } from "../constants";
import { BehaviorSubject, Observable } from "rxjs";

interface BibleState {
  selectedBook: Book | null;
  selectedVersion: Version | null;
  selectedChapter: number | null;
  availableChapters: number[];
}

@Injectable({
  providedIn: "root",
})
export class BibleStateService {
  private initialState: BibleState = {
    selectedBook: null,
    selectedVersion: null,
    selectedChapter: null,
    availableChapters: [],
  };

  constructor() {}
  private state = new BehaviorSubject<BibleState>(this.initialState);

  getState(): Observable<BibleState> {
    return this.state.asObservable();
  }

  updateState(newState: Partial<BibleState>): void {
    const currentState = this.state.value;
    this.state.next({ ...currentState, ...newState });
  }

  resetState(): void {
    this.state.next(this.initialState);
  }
}
