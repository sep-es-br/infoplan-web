import { Component, Input } from '@angular/core';
import { IPainelObrasRequest } from '../../../../../../core/interfaces/painel-obras/painel-obras';

@Component({
  selector: 'ngx-total-entregas-fonte-recurso',
  templateUrl: './total-entregas-fonte-recurso.component.html',
  styleUrls: ['./total-entregas-fonte-recurso.component.scss'],
  standalone: true,
  imports: [

  ]
})
export class TotalEntregasFonteRecursoComponent {
  @Input() filter!: IPainelObrasRequest
}
