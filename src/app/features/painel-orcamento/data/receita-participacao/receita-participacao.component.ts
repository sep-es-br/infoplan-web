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
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";

@Component({
  selector: "ngx-receita-participacao",
  templateUrl: "./receita-participacao.component.html",
  styleUrls: ["./receita-participacao.component.scss"],
})
export class ReceitaParticipacaoComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "Participação ICMS - Receita Total";
  readonly showTableIcon: Boolean = true;

  chartData!: PieChartData[];
  tableContent: FlipTableContent | null = null;
  requestStatus: RequestStatus = RequestStatus.EMPTY;

  chartConfig = {
    showTitle: true,
    isDonut: true,
    legendPosition: "left",
    labelThreshold: 5,
    showLabels: false,
    radius: ["30%", "60%"],
    centerPosition: ["70%", "50%"],
  };

  private receitaICMSCharData:
    | IReceitaParticipacaoOrcamentariaResponse[]
    | null = [];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);

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

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }

  calcMaximizedHeight(): number {
    return this._chartMaximizeService.calcMaximizedHeight();
  }

  private loadData(): void {
    this.getReceitaICMS();
  }

  private getReceitaICMS(): void {
    this.requestStatus = RequestStatus.LOADING;
    this._painelService
      .getReceitaPorParticipacao(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IReceitaParticipacaoOrcamentariaResponse[]) => {
          this.receitaICMSCharData = response;
          console.log("Dados referente a Participação ICMS | ", response);
          this.processData();
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error(
            "Erro ao carregar receita Participação ICMS - Receita Total:",
            err
          );
          this.requestStatus = RequestStatus.ERROR;
        },
      });
  }

  private processData(): void {
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

  private processTableData(dados: IReceitaParticipacaoOrcamentariaResponse[]) {
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

    const mapaValores = new Map(
      dados.map((d) => [
        `${d.nome_item_patrimonial}_${d.ano}`,
        d.receitaLiquida,
      ])
    );

    const treeNodes: TreeNode[] = categorias.map((categoria) => {
      const nodeData: any[] = [{ propertyName: "categoria", value: categoria }];

      anos.forEach((ano) => {
        const valor = mapaValores.get(`${categoria}_${ano}`) || 0;

        nodeData.push({
          propertyName: `ano_${ano}`,
          value: valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        });
      });

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    // Estrutura da tabela consolidada
    this.tableContent = {
      customColumn: {
        propertyName: "categoria",
        displayName: "ICMS", // Sugestão: tornar este nome dinâmico depois
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: anos.map((ano) => ({
        propertyName: `ano_${ano}`,
        displayName: ano.toString(),
        alignment: {
          header: FlipTableAlignment.RIGHT,
          data: FlipTableAlignment.RIGHT,
        },
      })),
      data: treeNodes,
    };

    // const treeNodes: TreeNode[] = categorias.map((categoria) => {
    //   const nodeData: any[] = [
    //     {
    //       propertyName: "categoria",
    //       value: categoria,
    //     },
    //   ];
    //   // dados.map((res) => {
    //   //   console.log("Categoria: ", res);
    //   // });
    //   anos.forEach((ano) => {
    //     const item = dados.find(
    //       (d) => d.nome_item_patrimonial === categoria && d.ano === ano
    //     );
    //     const valor = item?.receitaLiquida || 0;

    //     nodeData.push({
    //       propertyName: `ano_${ano}`,
    //       value: ` ${
    //         valor.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0
    //       }`,
    //     });
    //     // dados.map((res) => {
    //     //   console.log("Categoria: APOS ", nodeData);
    //     // });
    //   });

    //   return {
    //     data: nodeData,
    //     children: [],
    //     expanded: false,
    //   };
    // });

    // const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
    //   propertyName: `ano_${ano}`,
    //   displayName: ano.toString(),
    //   alignment: {
    //     header: FlipTableAlignment.RIGHT,
    //     data: FlipTableAlignment.RIGHT,
    //   },
    // }));

    // const customColumn: FlipTableColumn = {
    //   propertyName: "categoria",
    //   displayName: "ICMS",
    //   alignment: {
    //     header: FlipTableAlignment.LEFT,
    //     data: FlipTableAlignment.LEFT,
    //   },
    // };

    // this.tableContent = {
    //   customColumn,
    //   defaultColumns,
    //   data: treeNodes,
    // };
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

  private filterYears(
    data: IReceitaParticipacaoOrcamentariaResponse[]
  ): number[] {
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
          ? `${item.receitaLiquida.toLocaleString("pt-BR")}`
          : "0";
      });

      return row;
    });
  }
}
