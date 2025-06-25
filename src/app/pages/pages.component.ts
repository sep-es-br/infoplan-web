import { Component, OnInit } from '@angular/core';
import { CustomNbMenuItem, MENU_ITEMS } from './pages-menu';
import { NbIconLibraries, NbMenuService, NbThemeService } from '@nebular/theme';
import { menulinks } from '../@core/utils/menuLinks';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {
  menu = []

  private lastSelectedItem: CustomNbMenuItem;

  constructor(
    private iconsLibrary: NbIconLibraries,
    private nbMenuService: NbMenuService,
    private location: Location,
    private themeService: NbThemeService,
  ) {
    let currentTheme = localStorage.getItem('infoPlanCurrentTheme');

    if (currentTheme) {
      this.themeService.changeTheme(currentTheme);
    } else {
      currentTheme = this.themeService.currentTheme;
      localStorage.setItem('infoPlanCurrentTheme', currentTheme);
    }

    this.themeService.onThemeChange().subscribe((newTheme: { name: string; previous: string; }) => {
      localStorage.setItem('infoPlanCurrentTheme', newTheme.name);
    });
  }

  async ngOnInit() {
    const customIcons: { [key: string]: string } = {};

    await Promise.all(menulinks.map(async (item) => {
      const iconName = item.icon.split('.')[0]; 

      if (item.icon.endsWith('.svg')) {
        try {
          const response = await fetch(`assets/images/app/${item.icon}`);
          const svgContent = await response.text();
          
          customIcons[iconName] = svgContent;

        } catch (error) {
          console.error(`Erro ao carregar o ícone ${item.icon}:`, error);
        }
      } else {
        customIcons[iconName] = `<img src="assets/images/app/${iconName}.png" width="20px" />`;
      }
    }));

    this.iconsLibrary.registerSvgPack('custom-icons', customIcons);
    this.menu = MENU_ITEMS
    this.setIconStyles();
    this.setInitialActiveItem();

    this.nbMenuService.onItemSelect()
      .pipe(filter(({ tag }) => tag === 'menu'))
      .subscribe(({ item }) => {
        const menuItem = item as CustomNbMenuItem;
        if (!menuItem.isExternalUrl) {
          this.updateMenuState(menuItem);
          this.lastSelectedItem = menuItem;
        } else if (this.lastSelectedItem) {
          this.resetMenuSelection();
        }
      });
  }

  private setInitialActiveItem() {
    const currentPath = this.location.path().split('?')[0];
    
    const activeItem = this.menu.find(item => {
      if (!item.link) return false;
      const itemPath = item.link.startsWith('/') ? item.link : `/${item.link}`;
      return currentPath === itemPath || currentPath.startsWith(itemPath);
    });

    this.lastSelectedItem = activeItem || this.menu.find(item => item.link === '/pages/home');
    this.resetMenuSelection();
  }

  private updateMenuState(activeItem: CustomNbMenuItem) {
    this.menu = this.menu.map(item => ({
      ...item,
      selected: item.link === activeItem.link,
      expanded: item.link === activeItem.link
    }));
    
    this.menu = [...this.menu];
    this.setIconStyles()
  }

  private resetMenuSelection() {
    if (!this.lastSelectedItem) return;
    
    this.menu = this.menu.map(item => ({
      ...item,
      selected: item.link === this.lastSelectedItem.link,
      expanded: item.link === this.lastSelectedItem.link
    }));
    
    this.menu = [...this.menu];
    this.setIconStyles()
  }

  private setIconStyles() {
    setTimeout(() => {
      const icons = document.querySelectorAll('nb-icon svg');
      icons.forEach((icon: SVGElement) => {
        icon.setAttribute('width', '20px');
        icon.setAttribute('height', '20px');
        
        const paths = icon.querySelectorAll('[fill]');
        paths.forEach((path: SVGElement) => {
          path.setAttribute('fill', 'currentColor');
        });
      });

      const imgIcons = document.querySelectorAll('nb-icon img');
      imgIcons.forEach((img: HTMLImageElement) => {
        img.style.width = '20px';
        img.style.height = '20px';
      });
    });
  }
}