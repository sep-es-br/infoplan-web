import { Component, Input } from '@angular/core';
import { IPainelObrasRequest } from '../../../../../../core/interfaces/painel-obras/painel-obras';

@Component({
  selector: 'ngx-total-entregas-por-orgao-execucao',
  templateUrl: './total-entregas-por-orgao-execucao.component.html',
  styleUrls: ['./total-entregas-por-orgao-execucao.component.scss'],
  standalone: true,
})
export class TotalEntregasPorOrgaoExecucaoComponent {

  @Input() filter!: IPainelObrasRequest;

}
