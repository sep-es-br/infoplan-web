import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  IDashSuccessPlannedResponse,
  IIndicatorExecutionFilter,
} from "../../../../../core/interfaces/indicator-execution/indicator-execution";
import { of, Subject } from "rxjs";
import { ExportDataService } from "../../../../../core/service/export-data";
import { UtilitiesService } from "../../../../../core/service/utilities.service";
import { ChartDataProcessorService } from "../../../../../core/service/budget-panel/chart-data-processor.service";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { IndicatorExecutionService } from "../../../../../core/service/indicator-execution-service/indicator-execution.service";
import { ComunicationCardsService } from "../../../../../core/service/comunication-cards/comunication-cards.service";
import { ChartDataConfig } from "../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../../strategic-projects/strategicProjects.component";
import {
  FlipTableAlignment,
  FlipTableContent,
  TreeNode,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import { IChartOptions } from "../../../../../shared/models/budget-panel/IChartOptions";
import { finalize, takeUntil } from "rxjs/operators";
import {
  converterToNumber,
  replacePorcentage,
} from "../../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-success-planned",
  templateUrl: "./success-planned.component.html",
  styleUrls: ["./success-planned.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPlannedComponent implements OnChanges, OnDestroy {
  @Input() filter!: IIndicatorExecutionFilter;
  readonly title: string = "Sucesso do Planejamento";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(
    IndicatorExecutionService,
  );
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _charProcessor = inject(ChartDataProcessorService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  allColumnsNames: string[] = [];
  distinctYears: number[] = [];
  groupedHeaderColumns: string[] = [];

  groupingMode: "GND" | "YEAR_GND" = "GND";

  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };

  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "3%",
      right: "5%",
      bottom: "0%",
      containLabel: true,
    },
  };

  public tableMetrics = [
    { id: "budgeted", label: "Orçado" },
    { id: "authorized", label: "Autorizado" },
    { id: "committed", label: "Empenhado" },
    { id: "liquidated", label: "Liquidado" },
    { id: "liquidatedBarAuthorized", label: "Liq / Autorizado (%)" },
    { id: "committedBarAuthorized", label: "Emp / Autorizado (%)" },
  ];

  chartHeight: number = 350;
  private fullResponseData: IDashSuccessPlannedResponse[] = [];
  private dashSuccessOfSuccess: IDashSuccessPlannedResponse[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"].currentValue) {
      this.getDashSuccessOfSuccess();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getDashSuccessOfSuccess(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._indicatorExecutionService
      .getDashSuccessPlanned(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashSuccessOfSuccess
            ? RequestStatus.SUCCESS
            : RequestStatus.ERROR;
          this._cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (res: IDashSuccessPlannedResponse[]) => {
          const mostRecentYear = this.getMostRecentYear(res);
          this.dashSuccessOfSuccess = res
            .filter((item) => item.year === mostRecentYear)
            .sort((a, b) => b.year - a.year);

          this.chartHeight = Math.max(
            400,
            this.dashSuccessOfSuccess.length * 50 + 80,
          );

          this.fullResponseData = res;
          this.processChartData(res);
          this.processTableData(res);
          this._cdr.markForCheck();
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejamento:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashSuccessOfSuccess = of(
            [],
          ) as unknown as IDashSuccessPlannedResponse[]; // Garante que seja um array vazio, mesmo em caso de erro
        },
      });
  }

  private getMostRecentYear(
    data: IDashSuccessPlannedResponse[],
  ): number | null {
    if (!data.length) return null;

    return Math.max(...data.map((item) => item.year));
  }

  private processChartData(
    response: IDashSuccessPlannedResponse[],
  ): IChartOptions {
    if (!response || response.length === 0)
      return (this.chartData = { data: { labels: [], datasets: [] } });

    const extraData = response.map((item) => ({
      budgeted: item.budgeted,
      authorized: item.authorized,
      committed: item.committed,
      liquidated: item.liquidated,
      percCom: item.committedBarAuthorized,
      percLiq: item.liquidatedBarAuthorized,
    }));

    return (this.chartData = {
      data: {
        labels: response.map(
          (item: IDashSuccessPlannedResponse) =>
            `${item.year}|#|${item.codGnd} - ${item.nameGnd}`,
        ),
        datasets: [
          {
            label: "Empenhado",
            data: response.map(
              (item: IDashSuccessPlannedResponse) =>
                item.committedBarAuthorized,
            ),
            extra: extraData,
          },
          {
            label: "Liquidado",
            data: response.map(
              (item: IDashSuccessPlannedResponse) =>
                item.liquidatedBarAuthorized,
            ),
            extra: extraData,
          },
        ],
      },
    });
  }

  onGroupingModeChange(mode: "GND" | "YEAR_GND") {
    this.groupingMode = mode;
    if (this.fullResponseData && this.fullResponseData.length > 0) {
      this.processTableData(this.fullResponseData);
    }
    this._cdr.markForCheck();
  }

  private processTableData(response: IDashSuccessPlannedResponse[]): void {
    this.tableContent = null;
    if (!response || response.length === 0) {
      this._cdr.markForCheck();
      return;
    }

    // 1. Mapeamento e ocultação do primeiro ano para cálculos de variação
    const allYears = this.extractSortedYears(response);
    this.distinctYears = allYears.length > 1 ? allYears.slice(1) : allYears;

    // 2. Agrupamentos e cálculos consolidados de apoio
    const gndGroups = this.groupDataByGnd(response);
    const totalsByYear = this.calculateTotalsByYear(response);

    // 3. Geração das linhas de dados (TreeNodes) e do Total Geral
    const treeNodes = this.buildTreeNodes(gndGroups, allYears);
    const grandTotalData = this.buildGrandTotalRow(totalsByYear, allYears);

    treeNodes.push({ data: grandTotalData, children: [], expanded: false });
    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    // 4. Configuração dinâmica das colunas dependendo do groupingMode
    this.configureTableColumns(this.tableMetrics, this.distinctYears);

    // 5. Atualização da estrutura do FlipTable
    this.tableContent = {
      customColumn: {
        propertyName: "nameGnd",
        displayName: "Grupo de Despesa",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      groupedColumns: this.buildGroupedColumns(
        this.tableMetrics,
        this.distinctYears,
      ),
      defaultColumns: this.buildDefaultColumns(
        this.tableMetrics,
        this.distinctYears,
      ),
      data: treeNodes,
    };

    this._cdr.markForCheck();
  }

  // ==========================================
  // MÉTODOS AUXILIARES (Funções Especialistas)
  // ==========================================

  private extractSortedYears(
    response: IDashSuccessPlannedResponse[],
  ): number[] {
    return Array.from(new Set(response.map((item) => item.year))).sort(
      (a, b) => a - b,
    );
  }

  private groupDataByGnd(
    response: IDashSuccessPlannedResponse[],
  ): Map<string, IDashSuccessPlannedResponse[]> {
    const gndGroups = new Map<string, IDashSuccessPlannedResponse[]>();
    response.forEach((item) => {
      const gndKey = `${item.codGnd} - ${item.nameGnd}`;
      if (!gndGroups.has(gndKey)) gndGroups.set(gndKey, []);
      gndGroups.get(gndKey)!.push(item);
    });
    return gndGroups;
  }

  private calculateTotalsByYear(
    response: IDashSuccessPlannedResponse[],
  ): Map<number, any> {
    const totalsByYear = new Map<number, any>();
    response.forEach((item) => {
      if (!totalsByYear.has(item.year)) {
        totalsByYear.set(item.year, {
          budgeted: 0,
          authorized: 0,
          committed: 0,
          liquidated: 0,
        });
      }
      const t = totalsByYear.get(item.year);
      t.budgeted += item.budgeted;
      t.authorized += item.authorized;
      t.committed += item.committed;
      t.liquidated += item.liquidated;
    });
    return totalsByYear;
  }

  private buildTreeNodes(
    gndGroups: Map<string, IDashSuccessPlannedResponse[]>,
    allYears: number[],
  ): TreeNode[] {
    return Array.from(gndGroups.entries()).map(([gnd, items]) => {
      const rowData: any[] = [{ propertyName: "nameGnd", value: gnd }];
      const itemsMap = new Map(items.map((i) => [i.year, i]));

      this.tableMetrics.forEach((metric) => {
        this.distinctYears.forEach((year) => {
          const match = itemsMap.get(year);
          const value = this.calculateMetricValue(
            metric,
            year,
            match,
            items,
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
    items: any[],
    allYears: number[],
  ): string {
    // Tratamento de Variação contra Ano Anterior (Se houver a métrica baseada em 'liquidatedVariationPreviousYear')
    if (metric.id === "liquidatedVariationPreviousYear") {
      if (!match) return "0.0 %";
      const globalIndex = allYears.indexOf(year);
      if (globalIndex <= 0) return "0.0 %";

      const previousYear = allYears[globalIndex - 1];
      const prevMatch = items.find((item) => item.year === previousYear);

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

    // Tratamento de Percentuais nativos (bar / perc)
    const isPercentage =
      metric.id.toLowerCase().includes("bar") ||
      metric.id.toLowerCase().includes("perc");
    if (isPercentage) {
      return match ? (match[metric.id] ?? 0).toFixed(1) + " %" : "0.0 %";
    }

    // Tratamento de Moeda Padrão (R$)
    const rawValue = match ? match[metric.id] : 0;
    return this._utilitiesService.formatCurrencyUsingBrazilianStandards(
      rawValue,
      "R$",
    );
  }

  private buildGrandTotalRow(
    totalsByYear: Map<number, any>,
    allYears: number[],
  ): any[] {
    const grandTotalData: any[] = [{ propertyName: "nameGnd", value: "Total" }];

    this.tableMetrics.forEach((metric) => {
      this.distinctYears.forEach((year) => {
        const yearTotals = totalsByYear.get(year);
        let totalValue: string;

        if (metric.id === "liquidatedVariationPreviousYear") {
          const globalIndex = allYears.indexOf(year);
          let variation = "0.0 %";

          if (globalIndex > 0) {
            const previousYearTotals = totalsByYear.get(
              allYears[globalIndex - 1],
            );
            const currentLiq = yearTotals?.liquidated || 0;
            const prevLiq = previousYearTotals?.liquidated || 0;

            if (prevLiq !== 0) {
              variation =
                (((currentLiq - prevLiq) / prevLiq) * 100).toFixed(1) + " %";
            }
          }
          totalValue = variation;
        } else if (
          metric.id.toLowerCase().includes("bar") ||
          metric.id.toLowerCase().includes("perc")
        ) {
          const baseMetric = metric.id.split("Bar")[0];
          const totalAuthorized = yearTotals?.authorized || 0;
          const totalBase = yearTotals ? yearTotals[baseMetric] : 0;
          const perc =
            totalAuthorized > 0 ? (totalBase / totalAuthorized) * 100 : 0;
          totalValue = perc.toFixed(1) + " %";
        } else {
          const sum = yearTotals ? yearTotals[metric.id] : 0;
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

    const groupedCols = this.buildGroupedColumns(metrics, visibleYears);

    this.allColumnsNames = ["nameGnd", ...dynamicPropsNames];
    this.groupedHeaderColumns = [
      "nameGnd",
      ...groupedCols.map((c) => c.propertyName),
    ];
  }

  private buildGroupedColumns(metrics: any[], visibleYears: number[]): any[] {
    const dynamicGroupedColumns: any[] = [];

    if (this.groupingMode === "GND") {
      metrics.forEach((metric) => {
        dynamicGroupedColumns.push({
          propertyName: `header_${metric.id}`,
          metricLabel: metric.label,
        });
      });
    } else {
      visibleYears.forEach((year) => {
        dynamicGroupedColumns.push({
          propertyName: `header_year_${year}`,
          metricLabel: year.toString(),
        });
      });
    }

    return dynamicGroupedColumns;
  }

  private buildDefaultColumns(metrics: any[], visibleYears: number[]): any[] {
    const dynamicDefaultColumns: any[] = [];

    if (this.groupingMode === "GND") {
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
    } else {
      visibleYears.forEach((year) => {
        metrics.forEach((metric) => {
          dynamicDefaultColumns.push({
            propertyName: `${metric.id}_${year}`,
            yearLabel: metric.label,
            alignment: {
              header: FlipTableAlignment.CENTER,
              data: FlipTableAlignment.RIGHT,
            },
          });
        });
      });
    }

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
      let label = col.propertyName;
      if (this.groupingMode === "GND") {
        const metricId = col.propertyName.split("_")[0];
        const metric = this.tableMetrics.find((m) => m.id === metricId);
        label = metric
          ? `${metric.label} (${col.yearLabel})`
          : col.propertyName;
      } else {
        const parts = col.propertyName.split("_");
        const year = parts[parts.length - 1];
        label = `${year} (${col.yearLabel})`;
      }
      columns.push({ key: col.propertyName, label });
    });

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForExport,
      columns,
      `Sucesso_do_Planejamento_${new Date().getTime()}`,
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
