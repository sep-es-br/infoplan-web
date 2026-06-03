import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs-compat';

@Injectable({
  providedIn: 'root'
})
export class FilterManagementService {
  private filterSubject = new BehaviorSubject<any>(null);

  filter$: Observable<any> = this.filterSubject.asObservable();

  updateFilter(params: any): void {
    this.filterSubject.next(params);
  }

  getLatestFilter(): any {
    return this.filterSubject.getValue();
  }
}
