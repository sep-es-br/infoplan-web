import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private _isScrolled$ = new BehaviorSubject<boolean>(false);

  isScrolled$ = this._isScrolled$.asObservable();
  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll', { capture: true })
        .pipe(
          throttleTime(20),
          map((event: Event) => {
            const target = event.target;

            if (target instanceof Document) {
              return window.scrollY > 20 || document.documentElement.scrollTop > 20;
            }

            if (target instanceof HTMLElement) {
              if (target.classList.contains('layout-container') || target.classList.contains('scrollable-container') || target.tagName === 'HTML' || target.tagName === 'BODY') {
                return target.scrollTop > 20;
              }

              const scrollableContainer = document.querySelector('.scrollable-container') || document.querySelector('.layout-container');
              if (scrollableContainer) {
                return scrollableContainer.scrollTop > 20;
              }

              return window.scrollY > 20 || document.documentElement.scrollTop > 20;
            }

            return window.scrollY > 20;
          }),
          distinctUntilChanged()
        )
        .subscribe(isScrolled => {
          this.ngZone.run(() => {
            this._isScrolled$.next(isScrolled);
          });
        });
    });
  }

  get isScrolled(): boolean {
    return this._isScrolled$.value;
  }
}
