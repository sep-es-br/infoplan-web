import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { NbIconLibraries } from '@nebular/theme';
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
export class PagesComponent{
  


  constructor (private iconsLibrary: NbIconLibraries
  ) {
    menulinks.map(item => item.icon).forEach(iconFile => {
      this.iconsLibrary.getPack("eva").icons.set(iconFile.split('.')[0], '<img src="assets/images/app/cinza-' + iconFile + '" width="25px" />');
    })

  }

  menu = MENU_ITEMS;

}
