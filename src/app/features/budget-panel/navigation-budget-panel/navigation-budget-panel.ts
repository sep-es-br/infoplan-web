import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbTagModule } from '@nebular/theme';

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
export class NavigationBudgetPanel implements OnInit{

  readonly ROUTES = APP_ROUTES;

  constructor(
    private router: Router
  ) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() : void {

  }

}
