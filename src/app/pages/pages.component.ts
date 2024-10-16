import { AfterViewChecked, AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

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
export class PagesComponent {
  
  @ViewChild('menuElem')
  menuElem: ElementRef;

  iconColor : string;
  
  
  menu = MENU_ITEMS;

  
  constructor (private iconsLibrary: NbIconLibraries
  ) {

    menulinks.map(item => item.icon).forEach(iconFile => {
      
      if(iconFile.split('.')[1] == 'svg'){
        fetch("assets/images/app/" + iconFile).then(value => {
          let resp : Response = value;

          resp.text().then(innerText => {
            this.iconsLibrary.getPack("eva").icons.set(iconFile.split('.')[0], innerText);
            let nbIcon = document.querySelector('nb-menu nb-icon[ng-reflect-config="' + iconFile.split('.')[0] + '"]');
            nbIcon ? nbIcon.innerHTML = innerText : null;
            let elem = nbIcon ? nbIcon.querySelector('svg') : null;
            elem ? elem.setAttribute('width', '20px') : null;
            elem ? elem.setAttribute('height', '20px') : null;
            elem = elem ? nbIcon.querySelector('[fill]') : null;
            elem ? elem.setAttribute('fill', 'currentColor') : null;

          }).catch(reason => console.error(reason));

        }, reason => console.error(reason));
      } else {
        this.iconsLibrary.getPack("eva").icons.set(iconFile.split('.')[0], '<img src="assets/images/app/' + iconFile.split('.')[0] + '.png" width="20px" />');
      }
    });
    
  }



}
