import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {

  private showExpensePanel: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  showExpensePanel$ = this.showExpensePanel.asObservable();

  updateYear(year: number) {
    const isVisible = (year >= 2014) && (year <= 2022);
    this.showExpensePanel.next(isVisible);
  }
}
