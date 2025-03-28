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
export class PagesComponent implements OnInit {

    menu = []

    constructor(private iconsLibrary: NbIconLibraries) {}
  
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