import { Component, Input } from '@angular/core';
import { IPainelObrasRequest } from '../../../../../../core/interfaces/painel-obras/painel-obras';

@Component({
  selector: 'ngx-total-entregas-por-orgao',
  templateUrl: './total-entregas-por-orgao.component.html',
  styleUrls: ['./total-entregas-por-orgao.component.scss'],
  standalone: true,
})
export class TotalEntregasPorOrgaoComponent {
  @Input() filter!: IPainelObrasRequest;

}
