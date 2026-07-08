import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterHUDService {
  private activeFiltersCount = new BehaviorSubject<number>(0);
  activeFiltersCount$ = this.activeFiltersCount.asObservable();

  private selectedYear = new BehaviorSubject<string>('2026');
  selectedYear$ = this.selectedYear.asObservable();

  private openModalSource = new BehaviorSubject<boolean>(false);
  openModal$ = this.openModalSource.asObservable();

  updateFilterCount(count: number) {
    this.activeFiltersCount.next(count);
  }

  updateYear(year: string | number) {
    this.selectedYear.next(year.toString());
  }

  triggerOpenModal() {
    this.openModalSource.next(true);
  }
}
