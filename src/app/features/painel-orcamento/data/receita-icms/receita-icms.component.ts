import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaICMSOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PieChartData } from "../../org-chart-pie/org-chart-pie.component";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { FlipTableAlignment, FlipTableColumn, FlipTableContent, TreeNode } from "../../../strategic-projects/flip-table-model/flip-table.component";

@Component({
  selector: "ngx-receita-icms",
  templateUrl: "./receita-icms.component.html",
  styleUrls: ["./receita-icms.component.scss"],
})
export class ReceitaICMSComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "ICMS";
  readonly showTableIcon: Boolean = true;

  chartData!: PieChartData[];
  tableContent: FlipTableContent | null = null
  loadingStatus: "loading" | "loaded" | "error" = "loading";
  chartConfig = {
    showTitle: true,
    isDonut: true,
    legendPosition: "left",
    labelThreshold: 5,
    showLabels: false,
    radius: ['30%', '60%'],
    centerPosition: ["70%", "50%"],
  };

  private receitaICMSCharData: IReceitaICMSOrcamentariaResponse[] | null = [];

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
      .getRceitaPorICMS(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaICMSCharData.length > 0 ? "loaded" : "error";
        })
      )
      .subscribe({
        next: (response: IReceitaICMSOrcamentariaResponse[]) => {
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
      this.processTableData(this.receitaICMSCharData);
    } else {
      this.chartData = [
        {
          value: 0,
          name: "",
        },
      ];
      this.tableContent = null;
    }
  }

  private processTableData(dados: IReceitaICMSOrcamentariaResponse[]) {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categorias = [
      ...new Set(dados.map((item) => item.nome_item_patrimonial)),
    ].filter(Boolean);

    const anos = [...new Set(dados.map((item) => item.ano))]
      .filter((ano) => ano != null)
      .sort();

    if (categorias.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const treeNodes: TreeNode[] = categorias.map((categoria) => {
      const nodeData: any[] = [
        {
          propertyName: "categoria",
          value: categoria,
        },
      ];

      anos.forEach((ano) => {
        const item = dados.find(
          (d) => d.nome_item_patrimonial === categoria && d.ano === ano
        );
        const valor = item?.receitaLiquida || 0;

        // Nome único para cada coluna de ano
        nodeData.push({
          propertyName: `ano_${ano}`, // Nome único para cada ano
          value: ` ${valor.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
        });
      });

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    // Colunas com propertyNames únicos
    const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
      propertyName: `ano_${ano}`, // Mesmo nome usado nos nodeData
      displayName: ano.toString(), // Mostra o ano como nome da coluna
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    const customColumn: FlipTableColumn = {
      propertyName: "categoria",
      displayName: "ICMS",
      alignment: {
        header: FlipTableAlignment.LEFT,
        data: FlipTableAlignment.LEFT,
      },
    };

    this.tableContent = {
      customColumn,
      defaultColumns,
      data: treeNodes,
    };
  }

  private processCharData(): PieChartData[] {
    return this._chartProcessor.processarDadosPieChart(
      this.receitaICMSCharData,
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

  private category(data: IReceitaICMSOrcamentariaResponse[]): string[] {
    return [...new Set(data.map(item => item.nome_item_patrimonial))].filter(Boolean);
  }

  private filterYears(data: IReceitaICMSOrcamentariaResponse[]): number[] {
    return [...new Set(data.map(item => item.ano))]
      .filter(ano => ano != null)
      .sort();
  }

  private columns(years: number[]): { key: string, label: string }[] {
    return [
      { key: "categoria", label: "Participação ICMS - Receita Total" },
      ...years.map(ano => ({
        key: `ano_${ano}`,
        label: `Arrecadação Líquida - ${ano}`,
      })),
    ];
  }

  private dataForDownload(categories: string[], years: number[], columns: { key: string, label: string }[]): any[] {
    return categories.map(categoria => {
      const row: any = { categoria };

      years.forEach(year => {
        const item = this.receitaICMSCharData.find(
          d => d.nome_item_patrimonial === categoria && d.ano === year
        );
        row[`ano_${year}`] = item?.receitaLiquida
          ? `${item.receitaLiquida.toLocaleString("pt-BR")}`
          : "0";
      });

      return row;
    });
  }


}
