import { DatePipe } from '@angular/common';
import { ImplicitReceiver } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div id="footer">
      <p>Central de Informações de Planejamento</p>
      <div>
        <span>Fonte: {{ dataSrc }}</span>
        <span *ngIf="timestamp"> - {{ timestamp | date:'dd MMM HH:mm':'pt-BR' }}</span>
      </div>
    </div>
  `,
})
export class FooterComponent{

  @Input() timestamp: string;

  dataSrc : string;

  constructor(private route : ActivatedRoute,  private datePipe: DatePipe) {  
    this.dataSrc = this.route.snapshot.data['dataSource'];
  }


}
