import { Component, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Central de Informações de Planejamento
    </span>
    <div class="gov-logo">
      <img class="logo-gov" [src]="imageSrc" alt="">
    </div>
  `,
})
export class FooterComponent implements OnInit{
  imageSrc: string;

  constructor(private themeService: NbThemeService) { }

  ngOnInit(): void {
    this.themeService.onThemeChange()
      .subscribe(theme => {
        this.setImageForTheme(theme.name);
      });

    const currentTheme = this.themeService.currentTheme;
    this.setImageForTheme(currentTheme);
  }

  setImageForTheme(themeName: string): void {
    switch (themeName) {
      case 'default':
        this.imageSrc = 'assets/images/app/logo-gov.png';
        break;
      case 'dark':
        this.imageSrc = 'assets/images/app/logo-gov-branco.png';
        break;
      case 'cosmic':
        this.imageSrc = 'assets/images/app/logo-gov-branco.png';
        break;
      case 'corporate':
        this.imageSrc = 'assets/images/app/logo-gov.png';
        break;
      default:
        this.imageSrc = 'assets/images/app/logo-gov-branco.png';
    }
  }
}
