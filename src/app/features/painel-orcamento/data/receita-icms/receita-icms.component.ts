import { Component, Input, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  IPainelOrcamentoRequest,
  IReceitaICMSOrcamentoResponse
} from '../../../../core/interfaces/painel-orcamento/painel-orcamento';
import { PieChartData } from '../../org-chart-pie/org-chart-pie.component';
import { PainelOrcamentoService } from '../../../../core/service/painel-orcamento/painel-orcamento.service';
import { ChartDataProcessorService } from '../../../../core/service/painel-orcamento/chart-data-processor.service';

interface ITableRow {
  categoria: string;
  valor: number;
  percentual: number;
}

@Component({
  selector: 'ngx-receita-icms',
  templateUrl: './receita-icms.component.html',
  styleUrls: ['./receita-icms.component.scss'],
})
export class ReceitaICMSComponent implements OnChanges, OnDestroy {
  @Input() filter!: IPainelOrcamentoRequest;

  private readonly painelService = inject(PainelOrcamentoService);
  private readonly chartProcessor = inject(ChartDataProcessorService);


  private readonly destroy$ = new Subject<void>();

  readonly title: string = 'Receita ICMS por Categoria';

  chartData: PieChartData[] = [];
  tableContent: ITableRow[] = [];
  loadingStatus: 'loading' | 'loaded' | 'error' = 'loading';

  chartConfig = {
    showTitle: true,
    isDonut: false,
    legendPosition: 'bottom' as const,
    labelThreshold: 5,
  };

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

    // this.painelService
    //   .getRceitaPorICMS(this.filter)
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     finalize(() => {
    //       this.loadingStatus = this.chartData.length > 0 ? 'loaded' : 'error';
    //     })
    //   )
    //   .subscribe({
    //     next: (response: IReceitaICMSOrcamentoResponse) => {
    //       this.processData([response]);
    //     },
    //     error: (err) => {
    //       console.error('Erro ao carregar receita ICMS:', err);
    //       this.loadingStatus = 'error';
    //     },
    //   });
  }

  private processData(dados: IReceitaICMSOrcamentoResponse[]): void {
    // Processa dados para o gráfico de pizza
    this.chartData = this.chartProcessor.processarDadosPieChart(
      dados,
      'nome_item_patrimonial',
      ['receitaLiquida', 'vlr_receita_liquida']
    );

    // Processa dados para a tabela
    this.tableContent = this.chartProcessor.criarTabelaPieChart(this.chartData);
  }

  handleTableSearch(query: string): void {
    if (!query.trim()) {
      // Restaura dados originais
      this.processData([]); // Recarregar ou usar cache
      return;
    }

    // Filtra tabela
    this.tableContent = this.tableContent.filter(row =>
      row.categoria.toLowerCase().includes(query.toLowerCase())
    );
  }

  handleTableDownload(): void {
    console.log('Download ICMS:', this.tableContent);
    // Implementar download CSV/Excel
  }
}
