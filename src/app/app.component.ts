/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { NbIconLibraries } from '@nebular/theme';
import { menulinks } from './@core/utils/menuLinks';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
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

  }


}
