import { Component, Input, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  IPainelOrcamentoRequest,
  IReceitaOrigemOrcamentoResponse
} from '../../../../core/interfaces/painel-orcamento/painel-orcamento';
import { IChartOptions } from '../../../../shared/models/painel-orcamento/IChartOptions';
import { PainelOrcamentoService } from '../../../../core/service/painel-orcamento/painel-orcamento.service';
import { ChartDataProcessorService } from '../../../../core/service/painel-orcamento/chart-data-processor.service';

@Component({
  selector: 'ngx-receita-origem',
  templateUrl: './receita-origem.component.html',
  styleUrls: ['./receita-origem.component.scss'],
})
export class ReceitaOrigemComponent implements OnChanges, OnDestroy {
  @Input() filter: IPainelOrcamentoRequest;

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly destroy$ = new Subject<void>();

  readonly title: string = 'Receita por Origem';

  chartData!: IChartOptions;
  tableContent: any[] = [];
  loadingStatus: 'loading' | 'loaded' | 'error' = 'loading';
  private receitaOrigemCharData: IReceitaOrigemOrcamentoResponse[] = [];

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

    this._painelService
      .getReceitaOrigem(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.receitaOrigemCharData.length > 0 ? 'loaded' : 'error';
        })
      )
      .subscribe({
        next: (response) => {
          this.receitaOrigemCharData = response;
          this.processData();
        },
        error: (err) => {
          console.error('Erro ao carregar receita origem:', err);
          this.loadingStatus = 'error';
        },
      });
  }

  private processData(): void {
    // Processa dados para o gráfico
    const chartData = this._chartProcessor.processarDadosComparativo(
      this.receitaOrigemCharData,
      'origem',
      'Receita Líquida'
    );

    if (chartData) {
      this.chartData = chartData;

      // Processa dados para a tabela
      this.tableContent = this._chartProcessor.criarTabelaComparativo(
        this.receitaOrigemCharData,
        'origem',
        ['receitaLiquida', 'vlr_receita_liquida']
      );
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = [];
    }
  }

  handleTableSearch(query: string): void {
    console.log('Pesquisar origem:', query);
    // Implementar busca
  }

  handleTableDownload(): void {
    console.log('Download origem:', this.tableContent);
    // Implementar download
  }
}
