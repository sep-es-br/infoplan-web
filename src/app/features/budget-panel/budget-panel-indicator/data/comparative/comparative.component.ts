import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  IDashComparativeResponse,
  IIndicatorExecutionFilter,
} from "../../../../../core/interfaces/indicator-execution/indicator-execution";
import { ComunicationCardsService } from "../../../../../core/service/comunication-cards/comunication-cards.service";
import { IndicatorExecutionService } from "../../../../../core/service/indicator-execution-service/indicator-execution.service";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { ChartDataProcessorService } from "../../../../../core/service/budget-panel/chart-data-processor.service";
import { UtilitiesService } from "../../../../../core/service/utilities.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../../shared/models/budget-panel/IChartOptions";
import {
  FlipTableAlignment,
  FlipTableContent,
  TreeNode,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import { RequestStatus } from "../../../../strategic-projects/strategicProjects.component";
import { finalize, takeUntil } from "rxjs/operators";
import { ChartDataConfig } from "../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import {
  converterToNumber,
  replacePorcentage,
} from "../../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-comparative",
  templateUrl: "./comparative.component.html",
  styleUrls: ["./comparative.component.scss"],
})
export class ComparativeComponent implements OnChanges, OnDestroy {
  @Input() filter!: IIndicatorExecutionFilter;
  readonly title: string = "Comparativo de Despesas";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(
    IndicatorExecutionService,
  );
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _charProcessor = inject(ChartDataProcessorService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly destroy$ = new Subject<void>();

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;

  private dashComparative: IDashComparativeResponse[] = [];
  allColumnsNames: string[] = [];
  groupedHeaderColumns: string[] = [];
  distinctYears: number[] = [];

  public tableMetrics = [
    { id: "budgeted", label: "Orçado" },
    { id: "authorized", label: "Autorizado" },
    { id: "committed", label: "Empenhado" },
    { id: "liquidated", label: "Liquidado" },
    {
      id: "liquidatedVariationPreviousYear",
      label: "Variação vs Anterior (%)",
    },
  ];

  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };

  chartHeight: number = 350;

  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "3%",
      right: "3%",
      bottom: "0%",
      containLabel: true,
    },
  };
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"].currentValue) {
      this.getDashComparative();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getDashComparative(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._indicatorExecutionService
      .getDashSuccessPlanned(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashComparative
            ? RequestStatus.SUCCESS
            : RequestStatus.ERROR;
        }),
      )
      .subscribe({
        next: (res: IDashComparativeResponse[]) => {
          this.dashComparative = res;
          this.chartHeight = Math.max(
            400,
            this.dashComparative.length * 50 + 80,
          );

          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejado:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashComparative = null;
        },
      });
  }

  private processChartData(
    response: IDashComparativeResponse[],
  ): IChartOptions {
    if (!response || response.length === 0) {
      return (this.chartData = { data: { labels: [], datasets: [] } });
    }

    const uniqueYears = [...new Set(response.map((item) => item.year))].sort(
      (a, b) => a - b,
    );
    const recentYears = uniqueYears.slice(-2); // Pega os dois anos mais recentes
    const uniqueGnds = [
      ...new Set(response.map((item) => `${item.codGnd} - ${item.nameGnd}`)),
    ];

    const datasets = recentYears.map((year, index) => ({
      label: `Liquidado ${year}`,
      data: uniqueGnds.map((gndKey) => {
        const item = response.find(
          (r) => r.year === year && `${r.codGnd} - ${r.nameGnd}` === gndKey,
        );
        return item ? item.liquidated : 0;
      }),
      backgroundColor:
        this._charProcessor.colors[index % this._charProcessor.colors.length],
    }));

    return (this.chartData = {
      data: {
        labels: uniqueGnds,
        datasets: datasets,
      },
    });
  }

  private processTableData(response: IDashComparativeResponse[]): void {
    this.tableContent = null;
    if (!response || response.length === 0) return;

    // 1. Extração e mapeamento dos anos (Visíveis vs Totais)
    const allYears = this.extractSortedYears(response);
    this.distinctYears = allYears.length > 1 ? allYears.slice(1) : allYears;

    // 2. Agrupamento dos dados por GND
    const gndGroups = this.groupDataByGnd(response);

    // 3. Geração das linhas planares (TreeNodes)
    const treeNodes = this.buildTreeNodes(gndGroups, allYears);

    // 4. Adição da linha de Total Geral
    const grandTotalData = this.buildGrandTotalRow(response, allYears);
    treeNodes.push({ data: grandTotalData, children: [], expanded: false });
    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    // 5. Configuração das Colunas do FlipTable
    this.configureTableColumns(this.tableMetrics, this.distinctYears);

    // 6. Atualização do estado da View
    setTimeout(() => {
      this.tableContent = {
        customColumn: {
          propertyName: "nameGnd",
          displayName: "Grupo de Despesa",
          alignment: {
            header: FlipTableAlignment.LEFT,
            data: FlipTableAlignment.LEFT,
          },
        },
        groupedColumns: this.groupedHeaderColumns
          .filter((c) => c !== "nameGnd")
          .map((col, idx) => ({
            propertyName: col,
            metricLabel: this.tableMetrics[idx].label,
          })),
        defaultColumns: this.buildDefaultColumns(
          this.tableMetrics,
          this.distinctYears,
        ),
        data: treeNodes,
      };
    });
  }

  private extractSortedYears(response: IDashComparativeResponse[]): number[] {
    return Array.from(new Set(response.map((item) => item.year))).sort(
      (a, b) => a - b,
    );
  }

  private groupDataByGnd(
    response: IDashComparativeResponse[],
  ): Map<string, IDashComparativeResponse[]> {
    const gndGroups = new Map<string, IDashComparativeResponse[]>();
    response.forEach((item) => {
      const gndKey = `${item.codGnd} - ${item.nameGnd}`;
      if (!gndGroups.has(gndKey)) gndGroups.set(gndKey, []);
      gndGroups.get(gndKey)!.push(item);
    });
    return gndGroups;
  }

  private buildTreeNodes(
    gndGroups: Map<string, IDashComparativeResponse[]>,
    allYears: number[],
  ): TreeNode[] {
    return Array.from(gndGroups.entries()).map(([gnd, items]) => {
      const sortedItems = items.sort((a, b) => a.year - b.year);
      const rowData: any[] = [{ propertyName: "nameGnd", value: gnd }];

      this.tableMetrics.forEach((metric) => {
        this.distinctYears.forEach((year) => {
          const match = sortedItems.find((item) => item.year === year);
          const value = this.calculateMetricValue(
            metric,
            year,
            match,
            sortedItems,
            allYears,
          );

          rowData.push({ propertyName: `${metric.id}_${year}`, value });
        });
      });

      return { data: rowData, children: [], expanded: false };
    });
  }

  private calculateMetricValue(
    metric: any,
    year: number,
    match: any,
    sortedItems: any[],
    allYears: number[],
  ): any {
    if (metric.id !== "liquidatedVariationPreviousYear") {
      const rawValue = match ? match[metric.id] : 0;
      return this._utilitiesService.formatCurrencyUsingBrazilianStandards(
        rawValue,
        "R$",
      );
    }

    if (!match) return "0.0 %";

    const globalIndex = allYears.indexOf(year);
    if (globalIndex <= 0) return "0.0 %";

    const previousYear = allYears[globalIndex - 1];
    const prevMatch = sortedItems.find((item) => item.year === previousYear);

    const currentLiquidated = Number(match.liquidated ?? 0);
    const previousLiquidated = prevMatch
      ? Number(prevMatch.liquidated ?? 0)
      : 0;

    if (previousLiquidated === 0) return "0.0 %";

    return (
      (
        ((currentLiquidated - previousLiquidated) / previousLiquidated) *
        100
      ).toFixed(1) + " %"
    );
  }

  private buildGrandTotalRow(
    response: IDashComparativeResponse[],
    allYears: number[],
  ): any[] {
    const grandTotalData: any[] = [{ propertyName: "nameGnd", value: "Total" }];

    this.tableMetrics.forEach((metric) => {
      this.distinctYears.forEach((year) => {
        let totalValue: any;

        if (metric.id === "liquidatedVariationPreviousYear") {
          const globalIndex = allYears.indexOf(year);
          let variation = "0.0 %";

          if (globalIndex > 0) {
            const previousYear = allYears[globalIndex - 1];
            const sumCurrent = response
              .filter((i) => i.year === year)
              .reduce((acc, curr) => acc + curr.liquidated, 0);
            const sumPrev = response
              .filter((i) => i.year === previousYear)
              .reduce((acc, curr) => acc + curr.liquidated, 0);

            if (sumPrev !== 0) {
              variation =
                (((sumCurrent - sumPrev) / sumPrev) * 100).toFixed(1) + " %";
            }
          }
          totalValue = variation;
        } else
        {
          const sum = response
            .filter((i) => i.year === year)
            .reduce((acc, curr) => acc + curr[metric.id], 0);
          totalValue =
            this._utilitiesService.formatCurrencyUsingBrazilianStandards(
              sum,
              "R$",
            );
        }

        grandTotalData.push({
          propertyName: `${metric.id}_${year}`,
          value: totalValue,
        });
      });
    });

    return grandTotalData;
  }

  private configureTableColumns(metrics: any[], visibleYears: number[]): void {
    const dynamicPropsNames: string[] = [];

    metrics.forEach((metric) => {
      visibleYears.forEach((year) => {
        dynamicPropsNames.push(`${metric.id}_${year}`);
      });
    });

    const dynamicGroupedColumns = metrics.map(
      (metric) => `header_${metric.id}`,
    );

    this.allColumnsNames = ["nameGnd", ...dynamicPropsNames];
    this.groupedHeaderColumns = ["nameGnd", ...dynamicGroupedColumns];
  }

  private buildDefaultColumns(metrics: any[], visibleYears: number[]): any[] {
    const dynamicDefaultColumns: any[] = [];

    metrics.forEach((metric) => {
      visibleYears.forEach((year) => {
        dynamicDefaultColumns.push({
          propertyName: `${metric.id}_${year}`,
          yearLabel: year.toString(),
          alignment: {
            header: FlipTableAlignment.CENTER,
            data: FlipTableAlignment.RIGHT,
          },
        });
      });
    });

    return dynamicDefaultColumns;
  }

  handleTableDownload(): void {
    if (!this.tableContent) return;

    const dataForExport = this.tableContent.data.map((node) => {
      const row: any = {};
      node.data.forEach((d) => {
        if (typeof d.value === "string" && d.value.includes("R$")) {
          row[d.propertyName] = converterToNumber(d.value);
        } else if (typeof d.value === "string" && d.value.includes("%")) {
          row[d.propertyName] = replacePorcentage(d.value);
        } else {
          row[d.propertyName] = d.value;
        }
      });
      return row;
    });

    const columns: Array<{ key: string; label: string }> = [
      {
        key: this.tableContent.customColumn.propertyName,
        label: this.tableContent.customColumn.displayName || "Grupo de Despesa",
      },
    ];

    this.tableContent.defaultColumns.forEach((col) => {
      const metricId = col.propertyName.split("_")[0];
      const metric = this.tableMetrics.find((m) => m.id === metricId);
      const label = metric
        ? `${metric.label} (${col.yearLabel})`
        : col.propertyName;
      columns.push({ key: col.propertyName, label });
    });

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForExport,
      columns,
      `Comparativo_${new Date().getTime()}`,
    );
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
}
