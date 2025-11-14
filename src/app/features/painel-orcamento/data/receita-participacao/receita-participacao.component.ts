import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { PieChartData } from "../../org-chart-pie/org-chart-pie.component";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaParticipacaoOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { finalize, takeUntil } from "rxjs/operators";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { FlipTableContent } from "../../../strategic-projects/flip-table-model/flip-table.component";

@Component({
  selector: "ngx-receita-participacao",
  templateUrl: "./receita-participacao.component.html",
  styleUrls: ["./receita-participacao.component.scss"],
})
export class ReceitaParticipacaoComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "Participação ICMS - Receita Total";
  readonly showTableIcon: Boolean = false;

  chartData!: PieChartData[];
  tableContent: FlipTableContent | null = null;
  loadingStatus: "loading" | "loaded" | "error" = "loading";

  chartConfig = {
    // showTitle: true,
    // isDonut: true,
    // legendPosition: "bottom",
    // labelThreshold: 5,
    // centerPosition: ["40%","60%"],
    // showLabels: false,
    // radius: ['0%', '70%'],
    // legendOrient: "vertical"
    showTitle: true,
    isDonut: true,
    legendPosition: "left",
    labelThreshold: 5,
    showLabels: false,
    radius: ['30%', '60%'],
    centerPosition: ["70%","50%"],
  };

  private receitaICMSCharData: IReceitaParticipacaoOrcamentariaResponse[] | null =
    [];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);

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
        next: (response: IReceitaParticipacaoOrcamentariaResponse[]) => {
          this.receitaICMSCharData = response;
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
    } else {
      this.chartData = [
        {
          value: 0,
          name: "",
        },
      ];
      this.tableContent = null;
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

  handleTableDownload(): void {
    const data = this.receitaICMSCharData;

    if (!data.length) return;

    const categories = this.category(data);
    const years = this.filterYears(data);
    const columns = this.columns(years);

    const dataForDownload = this.dataForDownload(categories, years, columns);

    const anoAtual = new Date().getFullYear();
    const fileName = `Receita_Realizada_ICMS_${anoAtual}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName
    );
  }

  private category(data: IReceitaParticipacaoOrcamentariaResponse[]): string[] {
    return [...new Set(data.map((item) => item.nome_item_patrimonial))].filter(
      Boolean
    );
  }

  private filterYears(data: IReceitaParticipacaoOrcamentariaResponse[]): number[] {
    return [...new Set(data.map((item) => item.ano))]
      .filter((ano) => ano != null)
      .sort();
  }

  private columns(years: number[]): { key: string; label: string }[] {
    return [
      { key: "categoria", label: "Participação ICMS - Receita Total" },
      ...years.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação LI - ${ano}`,
      })),
    ];
  }

  private dataForDownload(
    categories: string[],
    years: number[],
    columns: { key: string; label: string }[]
  ): any[] {
    return categories.map((categoria) => {
      const row: any = { categoria };

      years.forEach((year) => {
        const item = this.receitaICMSCharData.find(
          (d) => d.nome_item_patrimonial === categoria && d.ano === year
        );
        row[`ano_${year}`] = item?.receitaLiquida
          ? `R$ ${item.receitaLiquida.toLocaleString("pt-BR")}`
          : "R$ 0";
      });

      return row;
    });
  }

  handleTableSearch(query: string): void {}
}
