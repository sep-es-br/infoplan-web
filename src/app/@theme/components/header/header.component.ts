import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuComponent, NbMenuItem, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: { name: string; email: string };

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

  @ViewChild(NbMenuComponent) menuComponent: NbMenuComponent | undefined;

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService) 
              {
                this.menuService.onItemClick()
                .pipe(
                  filter(({ item }) => !!item.data?.theme || !!item.data?.action)
                )
                .subscribe(({ item }) => {
                  if (item.data?.theme) {
                    this.changeTheme(item.data.theme);
                  } else if (item.data?.action === 'logout') {
                    this.logout();
                  }
                });
                
              }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

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
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    window.location.href = 'https://acessocidadao.es.gov.br/is/logout';
  }
}
