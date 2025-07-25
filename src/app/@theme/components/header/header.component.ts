import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuComponent, NbMenuItem, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { LayoutService } from '../../../@core/utils';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild(NbMenuComponent) menuComponent: NbMenuComponent | undefined;

  private destroy$: Subject<void> = new Subject<void>();

  userPictureOnly: boolean = false;

  user: { name: string; email: string };

  imageLogoSrc: string;

  themes = [
    {
      value: 'default',
      name: 'Claro',
    },
    {
      value: 'dark',
      name: 'Escuro',
    },
    {
      value: 'cosmic',
      name: 'Cosmico',
    },
    // {
    //   value: 'corporate',
    //   name: 'Corporativo',
    // },
  ];

  currentTheme = 'default';

  userMenu: NbMenuItem[] = [
    {
      title: 'Temas',
      children: this.themes.map(theme => ({
        title: theme.name,
        data: { theme: theme.value },
      })),
    },
    { title: 'Sair',
      data: { action: 'logout' } ,
      link: '#'
     },
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
  ) {
    this.menuService.onItemClick()
    .pipe(filter(({ item }) => !!item.data?.theme || !!item.data?.action))
    .subscribe(({ item }) => {
      if (item.data?.theme) {
        this.changeTheme(item.data.theme);
        this.menuService.collapseAll();
      } else if (item.data?.action === 'logout') {
        this.logout();
      }
    });
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    this.setImageForTheme(this.currentTheme);

    const userData = sessionStorage.getItem('user-profile'); 
    if (userData) {
      this.user = JSON.parse(userData);
    }

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.currentTheme = themeName
        this.setImageForTheme(themeName)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setImageForTheme(themeName: string): void {
    switch (themeName) {
      case 'default':
        this.imageLogoSrc = 'assets/images/app/icone-info-plan.png';
        break;
      case 'dark':
        this.imageLogoSrc = 'assets/images/app/icone-info-plan.png';
        break;
      case 'cosmic':
        this.imageLogoSrc = 'assets/images/app/icone-info-plan.png';
        break;
      case 'corporate':
        this.imageLogoSrc = 'assets/images/app/icone-info-plan.png';
        break;
      default:
        this.imageLogoSrc = 'assets/images/app/icone-info-plan-cinza.png';
    }
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  logout() {
    localStorage.removeItem('infoPlanCurrentTheme');
    window.location.href = 'https://acessocidadao.es.gov.br/is/logout';
  }
}
