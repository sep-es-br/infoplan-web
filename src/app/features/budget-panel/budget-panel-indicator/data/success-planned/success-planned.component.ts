import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { IDashSuccessPlannedResponse, IIndicatorExecutionFilter } from '../../../../../core/interfaces/indicator-execution/indicator-execution';
import { of, Subject } from 'rxjs';
import { ExportDataService } from '../../../../../core/service/export-data';
import { UtilitiesService } from '../../../../../core/service/utilities.service';
import { ChartDataProcessorService } from '../../../../../core/service/budget-panel/chart-data-processor.service';
import { ChartMaximizeService } from '../../../../../core/service/chart-maximize/chart-maximize.service';
import { IndicatorExecutionService } from '../../../../../core/service/indicator-execution-service/indicator-execution.service';
import { ComunicationCardsService } from '../../../../../core/service/comunication-cards/comunication-cards.service';
import { ChartDataConfig } from '../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { RequestStatus } from '../../../../strategic-projects/strategicProjects.component';
import { FlipTableAlignment, FlipTableContent, TreeNode } from '../../../../strategic-projects/flip-table-model/flip-table.component';
import { IChartOptions } from '../../../../../shared/models/budget-panel/IChartOptions';
import { finalize, takeUntil } from 'rxjs/operators';
import { converterToNumber, replacePorcentage } from '../../../../../@core/utils/functionts/functionts';

@Component({
  selector: 'ngx-success-planned',
  templateUrl: './success-planned.component.html',
  styleUrls: ['./success-planned.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessPlannedComponent implements OnChanges, OnDestroy {

  @Input() filter: IIndicatorExecutionFilter;
  readonly title: string = "Sucesso do Planejamento";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(IndicatorExecutionService);
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

  groupingMode: 'GND' | 'YEAR_GND' = 'YEAR_GND';

  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };

  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "2%",
      bottom: "0%",
      containLabel: true,
    },
  };

  public tableMetrics = [
    { id: 'budgeted', label: 'Orçado' },
    { id: 'authorized', label: 'Autorizado' },
    { id: 'committed', label: 'Empenhado' },
    { id: 'liquidated', label: 'Liquidado' },
    { id: 'liquidatedBarAuthorized', label: 'Liquidado / Autorizado (%)' },
    { id: 'committedBarAuthorized', label: 'Empenhado / Autorizado (%)' }
  ];

  chartHeight: number = 350;
  private fullResponseData: IDashSuccessPlannedResponse[] = [];
  private dashSuccessOfSuccess: IDashSuccessPlannedResponse[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'].currentValue) {
      this.getDashSuccessOfSuccess();
    }
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getDashSuccessOfSuccess(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._indicatorExecutionService.getDashSuccessPlanned(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashSuccessOfSuccess ? RequestStatus.SUCCESS : RequestStatus.ERROR;
          this._cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res: IDashSuccessPlannedResponse[]) => {
          const mostRecentYear = this.getMostRecentYear(res);
          this.dashSuccessOfSuccess = res
            .filter(item => item.year === mostRecentYear)
            .sort((a, b) => b.year - a.year);

          this.chartHeight = Math.max(
            400,
            this.dashSuccessOfSuccess.length * 50 + 80
          );

          this.fullResponseData = res;
          this.processChartData(res);
          this.processTableData(res);
          this._cdr.markForCheck();
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejamento:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashSuccessOfSuccess = null;
        }
      })
  }

  private getMostRecentYear(data: IDashSuccessPlannedResponse[]): number | null {
    if (!data.length) return null;

    return Math.max(...data.map(item => item.year));
  }

  private processChartData(response: IDashSuccessPlannedResponse[]): IChartOptions {
    if (!response || response.length === 0) return this.chartData = { data: { labels: [], datasets: [] } };

    const extraData = response.map(item => ({
      budgeted: item.budgeted,
      authorized: item.authorized,
      committed: item.committed,
      liquidated: item.liquidated,
      percCom: item.committedBarAuthorized,
      percLiq: item.liquidatedBarAuthorized
    }));

    return this.chartData = {
      data: {
        labels: response.map((item: IDashSuccessPlannedResponse) => `${item.year}|#|${item.codGnd} - ${item.nameGnd}`),
        datasets: [
          {
            label: "Empenhado",
            data: response.map((item: IDashSuccessPlannedResponse) => item.committedBarAuthorized),
            extra: extraData
          },
          {
            label: "Liquidado",
            data: response.map((item: IDashSuccessPlannedResponse) => item.liquidatedBarAuthorized),
            extra: extraData
          }
        ]
      }
    }
  }



  onGroupingModeChange(mode: 'GND' | 'YEAR_GND') {
    this.groupingMode = mode;
    if (this.fullResponseData && this.fullResponseData.length > 0) {
      this.processTableData(this.fullResponseData);
    }
    this._cdr.markForCheck();
  }

  // private processTableData(response: IDashSuccessPlannedResponse[]): void {
  //   if (!response || response.length === 0) {
  //     this.tableContent = null;
  //     return;
  //   }

  //   // Calcular Totais Gerais (Total de cada coluna na tabela)
  //   const grandTotalAuthorized = response.reduce((acc, curr) => acc + curr.authorized, 0);
  //   const grandTotalCommitted = response.reduce((acc, curr) => acc + curr.committed, 0);
  //   const grandTotalLiquidated = response.reduce((acc, curr) => acc + curr.liquidated, 0);

  //   const grandTotalCommittedPerc = grandTotalAuthorized > 0 ? (grandTotalCommitted / grandTotalAuthorized) * 100 : 0;
  //   const grandTotalLiquidatedPerc = grandTotalAuthorized > 0 ? (grandTotalLiquidated / grandTotalAuthorized) * 100 : 0;

  //   // Agrupar por GND
  //   const groups = new Map<string, IDashSuccessPlannedResponse[]>();
  //   response.forEach(item => {
  //     const gndKey = `${item.codGnd} - ${item.nameGnd}`;
  //     if (!groups.has(gndKey)) {
  //       groups.set(gndKey, []);
  //     }
  //     groups.get(gndKey)!.push(item);
  //   });

  //   const treeNodes: TreeNode[] = Array.from(groups.entries()).map(([gnd, items]) => {
  //     const totalBudgeted = items.reduce((acc, curr) => acc + curr.budgeted, 0);
  //     const totalAuthorized = items.reduce((acc, curr) => acc + curr.authorized, 0);
  //     const totalCommitted = items.reduce((acc, curr) => acc + curr.committed, 0);
  //     const totalLiquidated = items.reduce((acc, curr) => acc + curr.liquidated, 0);

  //     const totalCommittedPerc = totalAuthorized > 0 ? (totalCommitted / totalAuthorized) * 100 : 0;
  //     const totalLiquidatedPerc = totalAuthorized > 0 ? (totalLiquidated / totalAuthorized) * 100 : 0;

  //     return {
  //       data: [
  //         { propertyName: "nameGnd", value: `${gnd}` },
  //         // { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalBudgeted, "R$") },
  //         // { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAuthorized, "R$") },
  //         // { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalCommitted, "R$") },
  //         // { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalLiquidated, "R$") },
  //         // { propertyName: "liquidatedBarAuthorized", value: totalLiquidatedPerc.toFixed(1) + ' %' },
  //         // { propertyName: "committedBarAuthorized", value: totalCommittedPerc.toFixed(1) + ' %' }
  //       ],
  //       children: items.map(item => ({
  //         data: [
  //           { propertyName: "nameGnd", value: `Ano: ${item.year}` },
  //           { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.budgeted, "R$") },
  //           { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.authorized, "R$") },
  //           { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.committed, "R$") },
  //           { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.liquidated, "R$") },
  //           { propertyName: "liquidatedBarAuthorized", value: item.liquidatedBarAuthorized.toFixed(1) + ' %' },
  //           { propertyName: "committedBarAuthorized", value: item.committedBarAuthorized.toFixed(1) + ' %' }
  //         ],
  //         children: []
  //       })),
  //       expanded: true,
  //     };
  //   });

  //   const grandTotalNode: TreeNode = {
  //     data: [
  //       { propertyName: "nameGnd", value: "Total" },
  //       // { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalBudgeted, "R$") },
  //       // { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalAuthorized, "R$") },
  //       // { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalCommitted, "R$") },
  //       // { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalLiquidated, "R$") },
  //       // { propertyName: "liquidatedBarAuthorized", value: grandTotalLiquidatedPerc.toFixed(1) + ' %' },
  //       // { propertyName: "committedBarAuthorized", value: grandTotalCommittedPerc.toFixed(1) + ' %' }
  //     ],
  //     children: [],
  //     expanded: true
  //   };

  //   treeNodes.push(grandTotalNode);
  //   this._utilitiesService.sortTreeNodes(treeNodes, "top");

  //   // this._comunicationCardsService.sendCardPlannedSuccess(Number(grandTotalLiquidatedPerc.toFixed(1)));

  //   this.tableContent = {
  //     customColumn: {
  //       propertyName: "nameGnd",
  //       displayName: "Grupo de Despesa",
  //       alignment: {
  //         header: FlipTableAlignment.LEFT,
  //         data: FlipTableAlignment.LEFT,
  //       },
  //     },
  //     defaultColumns: [
  //       {
  //         propertyName: "budgeted",
  //         displayName: "Orçado (R$)",
  //         isHtml: true,
  //         alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
  //       },
  //       {
  //         propertyName: "authorized",
  //         displayName: "Autorizado (R$)",
  //         alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
  //       },
  //       {
  //         propertyName: "committed",
  //         displayName: "Empenhado (R$)",
  //         alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
  //       },
  //       {
  //         propertyName: "liquidated",
  //         displayName: "Liquidado (R$)",
  //         alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
  //       },
  //       {
  //         propertyName: "liquidatedBarAuthorized",
  //         displayName: "Liquidado / Autorizado (%)",
  //         alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
  //       },
  //       {
  //         propertyName: "committedBarAuthorized",
  //         displayName: "Empenhado / Autorizado (%)",
  //         alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
  //       }
  //     ],
  //     data: treeNodes,
  //   };
  // }


  private processTableData(response: IDashSuccessPlannedResponse[]): void {
    this.tableContent = null;
    if (!response || response.length === 0) {
      this._cdr.markForCheck();
      return;
    }

    // 1. Prepara dados básicos
    const years = Array.from(new Set(response.map(item => item.year))).sort();
    this.distinctYears = years;

    const gndGroups = new Map<string, IDashSuccessPlannedResponse[]>();
    response.forEach(item => {
      const gndKey = `${item.codGnd} - ${item.nameGnd}`;
      if (!gndGroups.has(gndKey)) gndGroups.set(gndKey, []);
      gndGroups.get(gndKey)!.push(item);
    });

    // 2. Pré-calcula Totais por Ano para O(1) no loop de totais
    const totalsByYear = new Map<number, any>();
    response.forEach(item => {
      if (!totalsByYear.has(item.year)) {
        totalsByYear.set(item.year, { budgeted: 0, authorized: 0, committed: 0, liquidated: 0 });
      }
      const t = totalsByYear.get(item.year);
      t.budgeted += item.budgeted;
      t.authorized += item.authorized;
      t.committed += item.committed;
      t.liquidated += item.liquidated;
    });

    const dynamicDefaultColumns: any[] = [];
    const dynamicPropsNames: string[] = [];
    let dynamicGroupedColumns: any[] = [];

    // MODO 1: AGRUPAR POR MÉTRICA (Ex: Orçado -> 2025, 2026)
    if (this.groupingMode === 'GND') {
      this.tableMetrics.forEach(metric => {
        years.forEach(year => {
          const propName = `${metric.id}_${year}`;
          dynamicPropsNames.push(propName);
          dynamicDefaultColumns.push({
            propertyName: propName,
            yearLabel: year.toString(),
            alignment: { header: FlipTableAlignment.CENTER, data: FlipTableAlignment.RIGHT }
          });
        });
        dynamicGroupedColumns.push({ propertyName: `header_${metric.id}`, metricLabel: metric.label });
      });
    }
    // MODO 2: AGRUPAR POR ANO (Ex: 2025 -> Orçado, Autorizado, ...)
    else {
      years.forEach(year => {
        this.tableMetrics.forEach(metric => {
          const propName = `${metric.id}_${year}`;
          dynamicPropsNames.push(propName);
          dynamicDefaultColumns.push({
            propertyName: propName,
            yearLabel: metric.label,
            alignment: { header: FlipTableAlignment.CENTER, data: FlipTableAlignment.RIGHT }
          });
        });
        dynamicGroupedColumns.push({ propertyName: `header_year_${year}`, metricLabel: year.toString() });
      });
    }

    // 3. Processa cada GND (O(GND * Metrics * Years))
    const treeNodes: TreeNode[] = Array.from(gndGroups.entries()).map(([gnd, items]) => {
      const rowData: any[] = [{ propertyName: "nameGnd", value: gnd }];
      // Mapa de itens do GND por ano para lookup rápido
      const itemsMap = new Map(items.map(i => [i.year, i]));

      this.tableMetrics.forEach(metric => {
        years.forEach(year => {
          const match = itemsMap.get(year);
          const rawValue = match ? match[metric.id] : 0;
          const isPercentage = metric.id.toLowerCase().includes('bar') || metric.id.toLowerCase().includes('perc');
          
          let value: string;
          if (isPercentage) {
            value = match ? (match[metric.id] ?? 0).toFixed(1) + ' %' : '0.0 %';
          } else {
            value = this._utilitiesService.formatCurrencyUsingBrazilianStandards(rawValue, "R$");
          }

          rowData.push({ propertyName: `${metric.id}_${year}`, value: value });
        });
      });
      return { data: rowData, children: [], expanded: false };
    });

    // 4. Processa Total Geral (O(Metrics * Years))
    const grandTotalData: any[] = [{ propertyName: "nameGnd", value: "Total" }];
    this.tableMetrics.forEach(metric => {
      years.forEach(year => {
        const isPercentage = metric.id.toLowerCase().includes('bar') || metric.id.toLowerCase().includes('perc');
        const yearTotals = totalsByYear.get(year);
        
        let totalValue: string;
        if (isPercentage) {
          const baseMetric = metric.id.split('Bar')[0];
          const totalAuthorized = yearTotals?.authorized || 0;
          const totalBase = yearTotals ? yearTotals[baseMetric] : 0;
          const perc = totalAuthorized > 0 ? (totalBase / totalAuthorized) * 100 : 0;
          totalValue = perc.toFixed(1) + ' %';
        } else {
          const sum = yearTotals ? yearTotals[metric.id] : 0;
          totalValue = this._utilitiesService.formatCurrencyUsingBrazilianStandards(sum, "R$");
        }
        grandTotalData.push({ propertyName: `${metric.id}_${year}`, value: totalValue });
      });
    });

    treeNodes.push({ data: grandTotalData, children: [], expanded: false });
    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    this.allColumnsNames = ["nameGnd", ...dynamicPropsNames];
    this.groupedHeaderColumns = ["nameGnd", ...dynamicGroupedColumns.map(c => c.propertyName)];

    // Atualiza o objeto de conteúdo da tabela
    this.tableContent = {
      customColumn: {
        propertyName: "nameGnd",
        displayName: "Grupo de Despesa",
        alignment: { header: FlipTableAlignment.LEFT, data: FlipTableAlignment.LEFT },
      },
      groupedColumns: dynamicGroupedColumns,
      defaultColumns: dynamicDefaultColumns,
      data: treeNodes,
    };
    
    this._cdr.markForCheck();
  }
  handleTableDownload(): void {
    if (!this.tableContent) return;

    const dataForExport = this.tableContent.data.map(node => {
      const row: any = {};
      node.data.forEach(d => {
        if (typeof d.value === 'string' && d.value.includes('R$')) {
          row[d.propertyName] = converterToNumber(d.value);
        } else if (typeof d.value === 'string' && d.value.includes('%')) {
          row[d.propertyName] = replacePorcentage(d.value);
        } else {
          row[d.propertyName] = d.value;
        }
      });
      return row;
    });

    const columns = [
      { key: 'nameGnd', label: 'Grupo de Despesa' },
      { key: 'budgeted', label: 'Orçado (R$)' },
      { key: 'authorized', label: 'Autorizado (R$)' },
      { key: 'committed', label: 'Empenhado (R$)' },
      { key: 'liquidated', label: 'Liquidado (R$)' },
      { key: 'liquidatedBarAuthorized', label: 'Liquidado / Autorizado (%)' },
      { key: 'committedBarAuthorized', label: 'Empenhado / Autorizado (%)' },
    ];

    this._exportDataService.exportXLSXWithCustomHeaders(dataForExport, columns, `Sucesso_do_Planejamento_${new Date().getTime()}`);
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
