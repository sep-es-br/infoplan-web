import { Component, Input, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  IPainelOrcamentoRequest,
  IReceitaTotalOrcamentoResponse
} from '../../../../core/interfaces/painel-orcamento/painel-orcamento';
import { IChartOptions } from '../../../../shared/models/painel-orcamento/IChartOptions';
import { PainelOrcamentoService } from '../../../../core/service/painel-orcamento/painel-orcamento.service';
import { ChartDataProcessorService } from '../../../../core/service/painel-orcamento/chart-data-processor.service';

interface ITableRow {
  label: string;
  previsao: number;
  arrecadacao: number;
  percentual: number;
}

@Component({
  selector: 'ngx-receita-total',
  templateUrl: './receita-total.component.html',
  styleUrls: ['./receita-total.component.scss'],
})
export class ReceitaTotalComponent implements OnChanges, OnDestroy {
  @Input() filter!: IPainelOrcamentoRequest;

  private readonly painelService = inject(PainelOrcamentoService);
  private readonly chartProcessor = inject(ChartDataProcessorService);
  private readonly destroy$ = new Subject<void>();

  readonly title: string = 'Receita Prevista x Realizada';

  chartData!: IChartOptions;
  tableContent: ITableRow[] = [];
  loadingStatus: 'loading' | 'loaded' | 'error' = 'loading';

  private responseData: IReceitaTotalOrcamentoResponse | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loadingStatus = 'loading';

    this.painelService
      .getReceitaTotal(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.responseData ? 'loaded' : 'error';
        })
      )
      .subscribe({
        next: (response) => {
          this.responseData = response;
          this.processData(response);
        },
        error: (err) => {
          console.error('Erro ao carregar receita total:', err);
          this.loadingStatus = 'error';
          this.responseData = null;
        },
      });
  }

  private processData(dados: IReceitaTotalOrcamentoResponse): void {
    // Processa dados para o gráfico
    this.chartData = {
      data: {
        labels: dados.ano ? [dados.ano.toString()] : [],
        datasets: [
          {
            label: 'Previsão Inicial Líquida',
            data: [dados.vlr_receita_prevista || 0],
            backgroundColor: this.chartProcessor.colors[0],
          },
          {
            label: 'Arrecadação Líquida',
            data: [dados.vlr_receita_liquida || 0],
            backgroundColor: this.chartProcessor.colors[1],
          },
        ],
      },
    };

    // Processa dados para a tabela
    this.processTableData(dados);
  }

  private processTableData(dados: IReceitaTotalOrcamentoResponse): void {
    const previsao = dados.vlr_receita_prevista || 0;
    const arrecadacao = dados.vlr_receita_liquida || 0;
    const percentual = previsao > 0 ? (arrecadacao / previsao) * 100 : 0;

    this.tableContent = [
      {
        label: `Ano ${dados.ano || 'N/A'}`,
        previsao,
        arrecadacao,
        percentual,
      },
    ];
  }

  handleTableSearch(query: string): void {
    console.log('Pesquisar:', query);
    // Implementar busca na tabela se necessário
  }

  handleTableDownload(): void {
    console.log('Download:', this.tableContent);
    // Implementar download CSV/Excel
  }
}
