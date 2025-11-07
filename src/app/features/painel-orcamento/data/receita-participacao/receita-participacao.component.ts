import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { PieChartData } from '../../org-chart-pie/org-chart-pie.component';
import { IPainelOrcamentoRequest, IReceitaParticipacaoOrcamentoResponse } from '../../../../core/interfaces/painel-orcamento/painel-orcamento';
import { finalize, takeUntil } from 'rxjs/operators';
import { PainelOrcamentoService } from '../../../../core/service/painel-orcamento/painel-orcamento.service';
import { ChartDataProcessorService } from '../../../../core/service/painel-orcamento/chart-data-processor.service';
import { ExportDataService } from '../../../../core/service/export-data';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-receita-participacao',
  templateUrl: './receita-participacao.component.html',
  styleUrls: ['./receita-participacao.component.scss']
})
export class ReceitaParticipacaoComponent implements OnChanges, OnDestroy {
  @Input() filter: IPainelOrcamentoRequest;

    readonly title: string = "Participação ICMS - Receita Total";

    chartData!: PieChartData[];
    tableContent: any[] = [];
    loadingStatus: "loading" | "loaded" | "error" = "loading";

    chartConfig = {
      showTitle: true,
      isDonut: true,
      legendPosition: "bottom",
      labelThreshold: 5,
      showLabels: true
    };

    private receitaICMSCharData: IReceitaParticipacaoOrcamentoResponse[] | null = [];

    private readonly _painelService = inject(PainelOrcamentoService);
    private readonly _chartProcessor = inject(ChartDataProcessorService);
    private readonly _exportExcelService = inject(ExportDataService);

    private readonly destroy$ = new Subject<void>();

    ngOnChanges(changes: SimpleChanges): void {
      if (changes["filter"] && this.filter) {
        this.loadData();
      }
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    private loadData(): void {
      this.loadingStatus = "loading";
      this.getReceitaICMS();
    }

    private getReceitaICMS(): void {
      this._painelService
        .getReceitaPorParticipacao(this.filter)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.loadingStatus =
              this.receitaICMSCharData.length > 0 ? "loaded" : "error";
          })
        )
        .subscribe({
          next: (response: IReceitaParticipacaoOrcamentoResponse[]) => {
            this.receitaICMSCharData = response
            this.processData();
          },
          error: (err) => {
            console.error("Erro ao carregar receita ICMS:", err);
            this.loadingStatus = "error";
          },
        });
    }

    private processData(): void {
      // Processa dados para o gráfico de pizza
      const chartData = this.processCharData();

      if (chartData) {
        this.chartData = chartData;
        this.processTable(this.chartData);
      } else {
        this.chartData = [
          {
            value: 0,
            name: "",
          },
        ];
        this.tableContent = [];
      }
      // Processa dados para a tabela
      // this.tableContent = this._chartProcessor.criarTabelaPieChart(this.chartData);
    }

    private processCharData(): PieChartData[] {
      return this._chartProcessor.processarDadosPieChart(
        this.receitaICMSCharData,
        "nome_item_patrimonial",
        ["receitaLiquida", "vlr_receita_liquida"]
      );
    }

    private processTable(charData: PieChartData[]) {
      this.tableContent = this._chartProcessor.criarTabelaComparativo(
        charData,
        "nome_item_patrimonial",
        ["receitaLiquida", "vlr_receita_liquida"]
      );
    }

    handleTableSearch(query: string): void {
      // if (!query.trim()) {
      //   // Restaura dados originais
      //   // this.processData([]); // Recarregar ou usar cache
      //   return;
      // }
      // // Filtra tabela
      // this.tableContent = this.tableContent.filter((row) =>
      //   row.categoria.toLowerCase().includes(query.toLowerCase())
      // );
    }

    handleTableDownload(): void {
      console.log("Download ICMS:", this.tableContent);
    }

}
