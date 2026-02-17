import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import {
  IBudgetExecutionRequest,
  IRevenueIcmsBudgetExecutionResponse,
} from "../../../../core/interfaces/budget-panel/budget-panel";
import { PieChartData } from "../../org-chart-pie/org-chart-pie.component";
import { BudgetPanelService } from "../../../../core/service/budget-panel/budget-panel.service";
import { ChartDataProcessorService } from "../../../../core/service/budget-panel/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import { converterToNumber } from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-revenue-icms",
  templateUrl: "./revenue-icms.component.html",
  styleUrls: ["./revenue-icms.component.scss"],
})
export class RevenueIcmsComponent implements OnChanges, OnDestroy {
  @Input() filter: IBudgetExecutionRequest;

  readonly title: string = "ICMS";
  readonly showTableIcon: Boolean = true;
  private RevenueIcmsCharData: IRevenueIcmsBudgetExecutionResponse[] | null = [];

  private readonly _painelService: BudgetPanelService = inject(
    BudgetPanelService,
  );
  private readonly _chartProcessor: ChartDataProcessorService = inject(
    ChartDataProcessorService,
  );
  private readonly _exportDataService =
    inject(ExportDataService);
  private readonly _chartMaximizeService =
    inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly destroy$ = new Subject<void>();

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
    this.getRevenueIcms();
  }

  private getRevenueIcms(): void {
    this.requestStatus = RequestStatus.LOADING;
    this._painelService
      .getRevenueByICMS(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IRevenueIcmsBudgetExecutionResponse[]) => {
          this.RevenueIcmsCharData = response;
          this.processData();
          this.requestStatus =
            this.RevenueIcmsCharData.length > 0
              ? RequestStatus.SUCCESS
              : RequestStatus.ERROR;
        },
        error: (err) => {
          console.error("Erro ao carregar receita ICMS:", err);
          this.requestStatus = RequestStatus.ERROR;
        },
      });
  }

  private processData(): void {
    const chartData = this.processCharData();

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.RevenueIcmsCharData);
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

  private processTableData(dados: IRevenueIcmsBudgetExecutionResponse[]) {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const anos = [...new Set(dados.map((item) => item.year))]
      .filter((year) => year != null)
      .sort((a, b) => a - b);

    const mapaBusca = new Map(
      dados.map((d) => [
        `${d.patrimonialItemName}_${d.year}`,
        d.netRevenue || 0,
      ]),
    );

    const categoriasUnicas = [
      ...new Set(dados.map((item) => item.patrimonialItemName)),
    ].filter(Boolean);

    const categoriasOrdenadas = categoriasUnicas.sort((a, b) => {
      const totalA = anos.reduce(
        (acc, year) => acc + (mapaBusca.get(`${a}_${year}`) || 0),
        0,
      );
      const totalB = anos.reduce(
        (acc, year) => acc + (mapaBusca.get(`${b}_${year}`) || 0),
        0,
      );
      return totalB - totalA;
    });

    if (categoriasOrdenadas.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const treeNodes: TreeNode[] = categoriasOrdenadas.map((categoria) => {
      const nodeData: any[] = [
        {
          propertyName: "categoria",
          value: categoria,
        },
      ];

      anos.forEach((year) => {
        const valor = mapaBusca.get(`${categoria}_${year}`) || 0;
        nodeData.push({
          propertyName: `ano_${year}`,
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(valor, "R$"),
        });
      });

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    const totalNodeData: any[] = [
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
        propertyName: `ano_${year}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAno, "R$"),
      });
    });

    treeNodes.push({
      data: totalNodeData,
      children: [],
      expanded: false,
    });

    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    const defaultColumns: FlipTableColumn[] = anos.map((year) => ({
      propertyName: `ano_${year}`,
      displayName: `${year.toString()} (R$)`,
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
      this.RevenueIcmsCharData,
      "patrimonialItemName",
      ["netRevenue", "netRevenueValue"],
    );
  }


  handleTableDownload(): void {
    const data = this.tableContent;

    if (!data) return;

    const years = this.filterYears(data);
    const columns = this.columns(years, data);

    const dataForDownload = this.dataForDownload(data);

    const anoInicial = years[1];
    const fileName = `Receita_Realizada_ICMS_${anoInicial}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
  }

  private filterYears(data: FlipTableContent): number[] {
    return data.defaultColumns
      .filter((col) => col.propertyName.startsWith("ano_"))
      .map((col) => parseInt(col.propertyName.replace("ano_", "").trim()))
      .sort((a, b) => a - b);
  }

  private columns(
    years: number[],
    content: FlipTableContent,
  ): { key: string; label: string }[] {
    return [
      {
        key: "categoria",
        label: content.customColumn.displayName || "Participação ICMS - Receita Total"
      },
      ...years.map((ano) => ({
        key: `ano_${ano}`,
        label:
          `Arrecadação Líquida - ${ano} (R$)`,
      })),
    ];
  }

  private dataForDownload(
    tableContent: FlipTableContent
  ): FlipTableContent[] {
    this._utilitiesService.sortTreeNodes(tableContent.data);

    return tableContent.data.map((node: TreeNode) => {
      const row: any = {};
      node.data.forEach((prop: {
        propertyName: string, value: string | null
      }) => {
        const { propertyName, value } = prop;

        if (propertyName === "categoria") {
          row["categoria"] = value;
        } else if (propertyName.startsWith("ano_")) {
          row[propertyName] = converterToNumber(value);
        }
      });

      return row;
    });
  }
}
