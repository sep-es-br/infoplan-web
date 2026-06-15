import { RequestStatus } from "./../../../strategic-projects/strategicProjects.component";
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  IBudgetExecutionRequest,
  IRevenueTaxesBudgetExecutionResponse,
} from "../../../../core/interfaces/budget-panel/budget-panel";
import { BudgetPanelService } from "../../../../core/service/budget-panel/budget-panel.service";
import { ChartDataProcessorService } from "../../../../core/service/budget-panel/chart-data-processor.service";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/budget-panel/IChartOptions";
import { finalize, takeUntil } from "rxjs/operators";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ExportDataService } from "../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import {
  ChartDataConfig,
  OrgChartHorizontalComponent,
} from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import {
  converterToNumber,
  replacePorcentage,
} from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-revenue-taxes",
  templateUrl: "./revenue-taxes.component.html",
  styleUrls: ["./revenue-taxes.component.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class RevenueTaxesComponent implements OnChanges, OnDestroy {
  @Input() filter: IBudgetExecutionRequest;

  readonly title: string = "Imposto, Taxas e Contribuições de Melhoria";

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "5%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private receitaImpostoCharData: IRevenueTaxesBudgetExecutionResponse[] = [];

  private readonly _painelService = inject(BudgetPanelService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
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

  private loadData() {
    this.requestStatus = RequestStatus.LOADING;
    this.getReceitaImposto();
  }

  private getReceitaImposto() {
    this._painelService
      .getRevenueByTaxes(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus =
            this.receitaImpostoCharData.length > 0
              ? RequestStatus.SUCCESS
              : RequestStatus.ERROR;
        }),
      )
      .subscribe({
        next: (response: IRevenueTaxesBudgetExecutionResponse[]) => {
          this.receitaImpostoCharData = response;
          this.procesData();
        },
      });
  }

  private procesData(): void {
    const chartData = this.processChatData();

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaImpostoCharData);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processChatData(): IChartOptions {
    return this._chartProcessor.processarDadosComparativo(
      this.receitaImpostoCharData,
      "patrimonialItemName",
      "Receita Líquida",
    );
  }

  private processTableData(dados: IRevenueTaxesBudgetExecutionResponse[]): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categorias = [
      ...new Set(dados.map((item) => item.patrimonialItemName)),
    ].filter(Boolean);

    const anos = [...new Set(dados.map((item) => item.year))]
      .filter((year) => year != null)
      .sort();

    if (categorias.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const treeNodes: TreeNode[] = categorias.map((categoria) => {
      const nodeData = [
        {
          propertyName: "categoria",
          value: categoria,
        },
      ];

      anos.forEach((year) => {
        const item = dados.find(
          (d) => d.patrimonialItemName === categoria && d.year === year,
        );
        const valor = item?.netRevenue || 0;
        nodeData.push({
          propertyName: `Arrecadação Líquida - ${year.toString()}`,
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            valor,
            "R$",
          ),
        });
      });

      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos, dados);
        nodeData.push({
          propertyName: "variação",
          value: `${variacao} %`,
        });
      }

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    const totalNodeData = [
      {
        propertyName: "categoria",
        value: "Total",
      },
    ];

    anos.forEach((year) => {
      const totalAno = dados
        .filter((d) => d.year === year)
        .reduce((sum, d) => sum + (d.netRevenue || 0), 0);

      totalNodeData.push({
        propertyName: `Arrecadação Líquida - ${year.toString()}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
          totalAno,
          "R$",
        ),
      });
    });

    if (anos.length >= 2) {
      const totalAnoAnterior = dados
        .filter((d) => d.year === anos[0])
        .reduce((sum, d) => sum + (d.netRevenue || 0), 0);

      const totalAnoAtual = dados
        .filter((d) => d.year === anos[anos.length - 1])
        .reduce((sum, d) => sum + (d.netRevenue || 0), 0);

      const variacaoTotal =
        totalAnoAnterior !== 0
          ? (
            ((totalAnoAtual - totalAnoAnterior) / totalAnoAnterior) *
            100
          ).toFixed(2)
          : "0.00";

      totalNodeData.push({
        propertyName: "variação",
        value: `${variacaoTotal} %`,
      });
    }

    treeNodes.push({
      data: totalNodeData,
      children: [],
      expanded: false,
    });

    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    const defaultColumns: FlipTableColumn[] = anos.map((year) => ({
      propertyName: `Arrecadação Líquida - ${year.toString()}`,
      displayName: `Arrecadação Líquida - ${year.toString()} (R$)`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "variação",
        displayName: "Variação",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      });
    }

    const customColumn: FlipTableColumn = {
      propertyName: "categoria",
      displayName: "Imposto, Taxas e Contribuições de Melhoria",
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

  private calcularVariacao(
    categoria: string,
    anos: number[],
    dados: IRevenueTaxesBudgetExecutionResponse[],
  ): number {
    if (anos.length < 2) return 0;

    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];

    const valorInicial =
      dados.find(
        (d) => d.patrimonialItemName === categoria && d.year === primeiroAno,
      )?.netRevenue ?? 0;

    const valorFinal =
      dados.find(
        (d) => d.patrimonialItemName === categoria && d.year === ultimoAno,
      )?.netRevenue ?? 0;

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;
    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.tableContent) {
      console.warn("Nenhum conteúdo de tabela disponível para download");
      return;
    }

    const anos = this.tableContent.defaultColumns
      .filter((col) => col.propertyName.startsWith("Arrecadação Líquida -"))
      .map((col) =>
        parseInt(col.propertyName.replace("Arrecadação Líquida -", "").trim()),
      )
      .sort((a, b) => a - b);

    const categorias = [
      ...new Set(
        this.receitaImpostoCharData.map((item) => item.patrimonialItemName),
      ),
    ].filter(Boolean);

    const temVariacao = this.tableContent.defaultColumns.some(
      (col) => col.propertyName === "variação",
    );

    const columns = [
      { key: "categoria", label: "Principais Origens de Receita" },
      ...anos.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação Líquida - ${ano} (R$)`,
      })),
    ];

    if (anos.length >= 2) {
      columns.push({ key: "variacao", label: "Variação" });
    }

    this._utilitiesService.sortTreeNodes(this.tableContent.data);

    const dataForDownload = this.tableContent.data.map((node: TreeNode) => {
      const row: any = {};

      node.data.forEach((prop: { propertyName: string; value: any }) => {
        const { propertyName, value } = prop;

        if (propertyName === "categoria") {
          row["categoria"] = value;
        } else if (propertyName.startsWith("Arrecadação Líquida -")) {
          const ano = propertyName.replace("Arrecadação Líquida -", "").trim();
          row[`ano_${ano}`] = converterToNumber(value);
        } else if (propertyName === "variação") {
          row["variacao"] = replacePorcentage(value);
        }
      });

      return row;
    });

    const anoInicial = anos[1];
    const fileName = `Receita_Realizada_Impostots_${anoInicial}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
  }
}
