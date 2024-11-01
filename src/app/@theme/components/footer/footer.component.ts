import { ImplicitReceiver } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div id="footer">
      <p>Central de Informações de Planejamento</p>
      <p class="font-italic">Fonte: {{dataSrc}}</p>
    </div>
  `,
})
export class FooterComponent{

  dataSrc : string;

  constructor(private route : ActivatedRoute) {  
    this.dataSrc = this.route.snapshot.data['dataSource'];
  }


}
