import { IChartData } from './../../painel-orcamento.component';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import { FlipTableComponent } from '../../../strategic-projects/flip-table-model/flip-table.component';
import { IPainelOrcamentoRequest, IReceitaTotalOrcamentoResponse } from '../../../../core/interfaces/painel-orcamento/painel-orcamento';
import { OrgChartVerticalComponent } from '../../org-chart-bar/org-chart-vertical/org-chart-vertical.component';
import { IChartOptions } from '../../../../shared/models/painel-orcamento/IChartOptions';
import { PainelOrcamentoService } from '../../../../core/service/painel-orcamento/painel-orcamento.service';
import { takeUntil } from 'rxjs-compat/operator/takeUntil';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-receita-total',
  templateUrl: "./receita-total.component.html",
  styleUrls: ['./receita-total.component.scss'],
})
export class ReceitaTotalComponent implements OnChanges {

  @Input() filter!: IPainelOrcamentoRequest;

  @Input() charData: IChartOptions;

  @Input() responseTable: IReceitaTotalOrcamentoResponse;

  readonly title: string = 'Receita Prevista x Realizada';

  readonly tableContent: FlipTableComponent;;

  loadingStatus: 'loading' | 'loaded' | 'error' = 'loaded';

  readonly _painelOrcamentoService = inject(PainelOrcamentoService);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['charData'] && changes['responseTable']) {
      this.loadData();
      console.log("Dados do chart", changes['responseTable'])
    }
  }

  loadData() {
      // const params = this._painelOrcamentoService.getRceitaPorDespesaGND(this.filter)
      // .subscribe({
      //   next(response) {

      //   },
      //   error(err) {

      //   },
      // })
  }

  handleTableSearch(query: string) {
    console.log(this.charData.data)

  }

  handleTableDownload() {

  }

}
