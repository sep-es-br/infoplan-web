import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';
import { NbIconLibraries, NbMenuComponent, NbThemeService } from '@nebular/theme';
import { menulinks } from '../@core/utils/menuLinks';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements AfterViewInit {
  menu = MENU_ITEMS;

  constructor() {}

  ngAfterViewInit() {
    this.setIconStyles();
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