import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div class="d-flex flex-column flex-sm-row" id="footer">
      <p>Central de Informações de Planejamento</p>
      <div>
        <span>Fonte: {{ dataSrc }}</span>
        <span *ngIf="timestamp"> - {{ timestamp | date:'dd MMM HH:mm':'pt-BR' }}</span>
      </div>
    </div>
  `,
})
export class FooterComponent {
  @Input() timestamp: string;

  dataSrc : string;

  constructor(private route : ActivatedRoute) {  
    this.dataSrc = this.route.snapshot.data['dataSource'];
  }
}
