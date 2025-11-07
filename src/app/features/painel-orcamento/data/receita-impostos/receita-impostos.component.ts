import { Component, Input } from '@angular/core';
import { IPainelOrcamentoRequest } from '../../../../core/interfaces/painel-orcamento/painel-orcamento';

@Component({
  selector: 'ngx-receita-impostos',
  templateUrl: './receita-impostos.component.html',
  styleUrls: ['./receita-impostos.component.scss']
})
export class ReceitaImpostosComponent {
  @Input() filter: IPainelOrcamentoRequest;

}
