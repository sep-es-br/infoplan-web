import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NbTagModule, NbIconModule } from '@nebular/theme';

export const APP_ROUTES = {
  EXECUCAO: {
    RESUMO: '/pages/execucao-orcamentaria/resumo-executivo',
    INDICADOR: '/pages/execucao-orcamentaria/indicador'
  }
};

@Component({
  selector: 'ngx-navigation-budget-panel',
  templateUrl: './navigation-budget-panel.html',
  styleUrls: ['./navigation-budget-panel.scss'],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NavigationBudgetPanel implements OnInit, OnDestroy {

  readonly ROUTES = APP_ROUTES;
  isScrolled = false;

  private scrollHandler = (event: Event) => {
    const target = event.target as HTMLElement | Document;
    let newIsScrolled = this.isScrolled;

    if (target instanceof HTMLElement) {
      if (target.scrollHeight > window.innerHeight && target.scrollTop !== undefined) {
        newIsScrolled = target.scrollTop > 20;
      }
    } else if (target === document) {
      newIsScrolled = window.scrollY > 20;
    }

    if (newIsScrolled !== this.isScrolled) {
      this.isScrolled = newIsScrolled;
      this.cdr.detectChanges();
    }
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    window.addEventListener('scroll', this.scrollHandler, true);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler, true);
  }

}
