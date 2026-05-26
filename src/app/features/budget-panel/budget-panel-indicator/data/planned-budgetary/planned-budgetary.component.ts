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
  IDashPlannedBudgetResponse,
  IIndicatorExecutionFilter,
} from "../../../../../core/interfaces/indicator-execution/indicator-execution";
import { ComunicationCardsService } from "../../../../../core/service/comunication-cards/comunication-cards.service";
import { IndicatorExecutionService } from "../../../../../core/service/indicator-execution-service/indicator-execution.service";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { ChartDataProcessorService } from "../../../../../core/service/budget-panel/chart-data-processor.service";
import { UtilitiesService } from "../../../../../core/service/utilities.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import {
  FlipTableAlignment,
  FlipTableContent,
  TreeNode,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import { IChartOptions } from "../../../../../shared/models/budget-panel/IChartOptions";
import { RequestStatus } from "../../../../strategic-projects/strategicProjects.component";
import { ChartDataConfig } from "../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { Subject } from "rxjs";
import {
  finalize,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import {
  converterToNumber,
  replacePorcentage,
} from "../../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-planned-budgetary",
  templateUrl: "./planned-budgetary.component.html",
  styleUrls: ["./planned-budgetary.component.scss"],
})
export class PlannedBudgetaryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filter!: IIndicatorExecutionFilter;
  readonly title: string = "Plano Orçamentário";

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
  searchSubject = new Subject<string>();

  allColumnsNames: string[] = [];
  groupedHeaderColumns: string[] = [];
  distinctYears: number[] = [];

  public tableMetrics = [
    { id: "budgeted", label: "Orçado" },
    { id: "authorized", label: "Autorizado" },
    { id: "committed", label: "Empenhado" },
    { id: "liquidated", label: "Liquidado" },
    { id: "liquidatedVariationPreviousYear", label: "Variação Liquidado (%)" },
  ];

  private dashPlannedBudget: IDashPlannedBudgetResponse[] = [];

  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };

  chartHeight: number = 350;

  chartDataConfig: ChartDataConfig = {
    legend: {
      fontSize: 8,
      itemHeight: 13,
      itemWidth: 13,
      itemGap: 20,
    },
    grid: {
      top: "12%",
      left: "3%",
      right: "3%",
      bottom: "0%",
      containLabel: true,
    },
  };
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"]?.currentValue) {
      this.getDashPlannedBudget();
    }
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executarFiltroTabela(query);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getDashPlannedBudget(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._indicatorExecutionService
      .getDashPlannedBudget(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashPlannedBudget
            ? RequestStatus.SUCCESS
            : RequestStatus.ERROR;
        }),
      )
      .subscribe({
        next: (res: IDashPlannedBudgetResponse[]) => {
          this.dashPlannedBudget = res;
          this.chartHeight = Math.max(
            400,
            this.dashPlannedBudget.length * 50 + 80,
          );

          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejado:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashPlannedBudget = null;
        },
      });
  }

  private processChartData(response: IDashPlannedBudgetResponse[]): void {
    if (!response || response.length === 0) {
      this.chartData = { data: { labels: [], datasets: [] } };
      return;
    }

    const uniqueYears = [...new Set(response.map((item) => item.year))].sort(
      (a, b) => a - b,
    );
    const mostRecentYear = uniqueYears[uniqueYears.length - 1];
    const dataForRecentYear = response.filter(
      (item) => item.year === mostRecentYear,
    );

    // Agrupar e somar valores por PO para o ano atual para rankeamento
    const poTotals = new Map<
      string,
      {
        codPo: string;
        namePo: string;
        nameUo: string;
        liquidated: number;
        budgeted: number;
        authorized: number;
        committed: number;
      }
    >();
    dataForRecentYear.forEach((item) => {
      const key = `${item.codPo} - ${item.namePo}`;
      if (!poTotals.has(key)) {
        poTotals.set(key, {
          codPo: item.codPo,
          namePo: item.namePo,
          nameUo: item.nameUo || "",
          liquidated: 0,
          budgeted: 0,
          authorized: 0,
          committed: 0,
        });
      }
      const total = poTotals.get(key)!;
      total.liquidated += item.liquidated;
      total.budgeted += item.budgeted;
      total.authorized += item.authorized;
      total.committed += item.committed;
    });

    const top5Pos = Array.from(poTotals.entries())
      .sort((a, b) => b[1].liquidated - a[1].liquidated)
      .slice(0, 5);

    const labels = top5Pos.map((entry) => entry[0]);

    const datasets = [
      {
        label: `Orçado ${mostRecentYear}`,
        data: top5Pos.map((entry) => entry[1].budgeted),
        backgroundColor: this._charProcessor.colors[0],
      },
      {
        label: `Autorizado ${mostRecentYear}`,
        data: top5Pos.map((entry) => entry[1].authorized),
        backgroundColor: this._charProcessor.colors[1],
      },
      {
        label: `Empenhado ${mostRecentYear}`,
        data: top5Pos.map((entry) => entry[1].committed),
        backgroundColor: this._charProcessor.colors[2],
      },
      {
        label: `Liquidado ${mostRecentYear}`,
        data: top5Pos.map((entry) => entry[1].liquidated),
        backgroundColor: this._charProcessor.colors[3],
      },
    ];

    this.chartHeight = Math.max(400, labels.length * 50 + 80);

    this.chartData = {
      data: {
        labels: labels,
        tipoTooltip: "PO",
        nomePO: top5Pos.map(
          (entry) => `${entry[1].codPo} - ${entry[1].namePo}`,
        ),
        datasets: datasets,
      },
    };
  }

  private processTableData(response: IDashPlannedBudgetResponse[]): void {
    this.tableContent = null;
    if (!response || response.length === 0) return;

    const allYears = this.extractSortedYears(response);
    this.distinctYears = allYears.length > 1 ? allYears.slice(1) : allYears;

    const poGroups = this.groupDataByPo(response);

    const allTreeNodes = this.buildTreeNodes(poGroups, allYears);
    allTreeNodes.sort(
      (a, b) => (b as any).liquidatedValueRaw - (a as any).liquidatedValueRaw,
    );
    const displayedTreeNodes = allTreeNodes.slice(0, 50);

    const grandTotalData = this.buildGrandTotalRow(response, allYears);
    displayedTreeNodes.push({
      data: grandTotalData,
      children: [],
      expanded: false,
    });
    this._utilitiesService.sortTreeNodes(displayedTreeNodes, "top");

    this.configureTableColumns(this.tableMetrics, this.distinctYears);

    setTimeout(() => {
      this.tableContent = {
        customColumn: {
          propertyName: "namePo",
          displayName: "Plano Orçamentário",
          alignment: {
            header: FlipTableAlignment.LEFT,
            data: FlipTableAlignment.LEFT,
          },
        },
        groupedColumns: this.groupedHeaderColumns
          .filter((c) => c !== "namePo")
          .map((col, idx) => ({
            propertyName: col,
            metricLabel: this.tableMetrics[idx].label,
          })),
        defaultColumns: this.buildDefaultColumns(
          this.tableMetrics,
          this.distinctYears,
        ),
        data: displayedTreeNodes,
      };
    });
  }

  private extractSortedYears(response: IDashPlannedBudgetResponse[]): number[] {
    return Array.from(new Set(response.map((item) => item.year))).sort(
      (a, b) => a - b,
    );
  }

  private groupDataByPo(
    response: IDashPlannedBudgetResponse[],
  ): Map<string, IDashPlannedBudgetResponse[]> {
    const poGroups = new Map<string, IDashPlannedBudgetResponse[]>();
    response.forEach((item) => {
      const poKey = `${item.codPo} - ${item.namePo}`;
      if (!poGroups.has(poKey)) poGroups.set(poKey, []);
      poGroups.get(poKey)!.push(item);
    });
    return poGroups;
  }

  private buildTreeNodes(
    poGroups: Map<string, IDashPlannedBudgetResponse[]>,
    allYears: number[],
  ): TreeNode[] {
    return Array.from(poGroups.entries()).map(([poName, items]) => {
      const sortedItems = items.sort((a, b) => a.year - b.year);
      const rowData: any[] = [{ propertyName: "namePo", value: poName }];

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

      const lastLiq =
        sortedItems.length > 0
          ? sortedItems[sortedItems.length - 1].liquidated
          : 0;

      return {
        data: rowData,
        children: [],
        expanded: false,
        liquidatedValueRaw: lastLiq,
      };
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
    response: IDashPlannedBudgetResponse[],
    allYears: number[],
  ): any[] {
    const grandTotalData: any[] = [{ propertyName: "namePo", value: "Total" }];

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
        } else {
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

    this.allColumnsNames = ["namePo", ...dynamicPropsNames];
    this.groupedHeaderColumns = ["namePo", ...dynamicGroupedColumns];
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
        label:
          this.tableContent.customColumn.displayName || "Plano Orçamentário",
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
      `Plano_Orcamentario_Completo_${new Date().getTime()}`,
    );
  }

  handleSearch(search: string): void {
    this.searchSubject.next(search);
  }

  executarFiltroTabela(search: string): void {
    if (!this.dashPlannedBudget) return;

    const searchTerm = search ? search.toLowerCase() : "";
    const filtered = this.dashPlannedBudget.filter((item) => {
      const nameMatch = item.namePo
        ? item.namePo.toLowerCase().includes(searchTerm)
        : false;
      const codMatch = item.codPo
        ? item.codPo.toString().toLowerCase().includes(searchTerm)
        : false;
      return nameMatch || codMatch;
    });

    this.processChartData(filtered);
    this.processTableData(filtered);
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
