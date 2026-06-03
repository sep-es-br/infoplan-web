import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FilterState {
  year?: number | null;
  orgao?: string | null;
  [key: string]: any;
}

const STORAGE_KEY = 'infoplan.filterState';

@Injectable({
  providedIn: 'root',
})
export class FilterStateService {
  private readonly _state = new BehaviorSubject<FilterState>(this.loadFromStorage());
  readonly state$ = this._state.asObservable();

  private showExpensePanel: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly showExpensePanel$ = this.showExpensePanel.asObservable();

  constructor() {
    // initialize derived values based on loaded state
    const s = this._state.value;
    if (s && typeof s.year === 'number') {
      this.updateYear(s.year);
    }
  }

  getState(): FilterState {
    return this._state.value;
  }

  setState(partial: Partial<FilterState>) {
    const next = { ...(this._state.value || {}), ...partial } as FilterState;
    this._state.next(next);
    this.saveToStorage(next);

    // update derived observables
    if (partial.year !== undefined) {
      const year = partial.year as number;
      if (typeof year === 'number') this.updateYear(year);
    }
  }

  clear() {
    this._state.next({});
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    this.showExpensePanel.next(false);
  }

  private saveToStorage(state: FilterState) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
  }

  private loadFromStorage(): FilterState {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // backward-compatible helper
  updateYear(year: number) {
    const isVisible = (year >= 2014) && (year <= 2022);
    this.showExpensePanel.next(isVisible);
  }
}
