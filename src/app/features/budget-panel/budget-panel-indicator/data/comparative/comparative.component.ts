import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { IDashComparativeResponse, IIndicatorExecutionFilter } from '../../../../../core/interfaces/indicator-execution/indicator-execution';
import { ComunicationCardsService } from '../../../../../core/service/comunication-cards/comunication-cards.service';
import { IndicatorExecutionService } from '../../../../../core/service/indicator-execution-service/indicator-execution.service';
import { ChartMaximizeService } from '../../../../../core/service/chart-maximize/chart-maximize.service';
import { ChartDataProcessorService } from '../../../../../core/service/budget-panel/chart-data-processor.service';
import { UtilitiesService } from '../../../../../core/service/utilities.service';
import { ExportDataService } from '../../../../../core/service/export-data';
import { Subject } from 'rxjs';
import { IChartOptions } from '../../../../../shared/models/budget-panel/IChartOptions';
import { FlipTableAlignment, FlipTableContent, TreeNode } from '../../../../strategic-projects/flip-table-model/flip-table.component';
import { RequestStatus } from '../../../../strategic-projects/strategicProjects.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { ChartDataConfig } from '../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { converterToNumber, replacePorcentage } from '../../../../../@core/utils/functionts/functionts';

@Component({
  selector: 'ngx-comparative',
  templateUrl: './comparative.component.html',
  styleUrls: ['./comparative.component.scss']
})
export class ComparativeComponent implements OnChanges, OnDestroy {

  @Input() filter: IIndicatorExecutionFilter;
  readonly title: string = "Comparativo de Despesas";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(IndicatorExecutionService);
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
    { id: 'budgeted', label: 'Orçado' },
    { id: 'authorized', label: 'Autorizado' },
    { id: 'committed', label: 'Empenhado' },
    { id: 'liquidated', label: 'Liquidado' },
    { id: 'liquidatedVariationPreviousYear', label: 'Variação vs Anterior (%)' }
  ];

  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };

  chartHeight: number = 350;

  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'].currentValue) {
      this.getDashComparative();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getDashComparative(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._indicatorExecutionService.getDashSuccessPlanned(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashComparative ? RequestStatus.SUCCESS : RequestStatus.ERROR;
        })
      )
      .subscribe({
        next: (res: IDashComparativeResponse[]) => {
          this.dashComparative = res;
          this.chartHeight = Math.max(
            400,
            this.dashComparative.length * 50 + 80
          );

          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejado:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashComparative = null;
        }
      })
  }

  private processChartData(response: IDashComparativeResponse[]): IChartOptions {
    if (!response || response.length === 0) {
      return this.chartData = { data: { labels: [], datasets: [] } };
    }

    const uniqueYears = [...new Set(response.map(item => item.year))].sort((a, b) => a - b);
    const recentYears = uniqueYears.slice(-2); // Pega os dois anos mais recentes
    const uniqueGnds = [...new Set(response.map(item => `${item.codGnd} - ${item.nameGnd}`))];

    const datasets = recentYears.map((year, index) => ({
      label: `Liquidado ${year}`,
      data: uniqueGnds.map(gndKey => {
        const item = response.find(r => r.year === year && `${r.codGnd} - ${r.nameGnd}` === gndKey);
        return item ? item.liquidated : 0;
      }),
      backgroundColor: this._charProcessor.colors[index % this._charProcessor.colors.length],
    }));

    return this.chartData = {
      data: {
        labels: uniqueGnds,
        datasets: datasets,
      },
    };
  }

  private processTableData(response: IDashComparativeResponse[]): void {
    this.tableContent = null;
    if (!response || response.length === 0) return;

    // 1. Anos únicos ordenados
    this.distinctYears = Array.from(new Set(response.map(item => item.year))).sort();

    // 2. Agrupar por GND
    const gndGroups = new Map<string, IDashComparativeResponse[]>();
    response.forEach(item => {
      const gndKey = `${item.codGnd} - ${item.nameGnd}`;
      if (!gndGroups.has(gndKey)) gndGroups.set(gndKey, []);
      gndGroups.get(gndKey)!.push(item);
    });

    // 3. Criar as linhas planares
    const treeNodes: TreeNode[] = Array.from(gndGroups.entries()).map(([gnd, items]) => {
      const sortedItems = items.sort((a, b) => a.year - b.year);
      const rowData: any[] = [{ propertyName: "nameGnd", value: gnd }];

      this.tableMetrics.forEach(metric => {
        this.distinctYears.forEach((year, idx) => {
          const match = sortedItems.find(item => item.year === year);
          let value: any = match ? match[metric.id] : 0;

          if (metric.id === 'liquidatedVariationPreviousYear') {
            let variation = '0.0 %';
            if (idx > 0 && match) {
              const prevMatch = sortedItems.find(item => item.year === this.distinctYears[idx - 1]);
              if (prevMatch && prevMatch.liquidated !== 0) {
                variation = (((match.liquidated - prevMatch.liquidated) / prevMatch.liquidated) * 100).toFixed(1) + ' %';
              }
            }
            value = variation;
          } else {
            value = match ? this._utilitiesService.formatCurrencyUsingBrazilianStandards(value, "R$") : 'R$ 0,00';
          }

          rowData.push({ propertyName: `${metric.id}_${year}`, value: value });
        });
      });

      return { data: rowData, children: [], expanded: false };
    });

    // 4. Totais
    const grandTotalData: any[] = [{ propertyName: "nameGnd", value: "Total" }];
    this.tableMetrics.forEach(metric => {
      this.distinctYears.forEach((year, idx) => {
        let totalValue: any;
        if (metric.id === 'liquidatedVariationPreviousYear') {
          let variation = '0.0 %';
          if (idx > 0) {
            const sumCurrent = response.filter(i => i.year === year).reduce((acc, curr) => acc + curr.liquidated, 0);
            const sumPrev = response.filter(i => i.year === this.distinctYears[idx - 1]).reduce((acc, curr) => acc + curr.liquidated, 0);
            if (sumPrev !== 0) {
              variation = (((sumCurrent - sumPrev) / sumPrev) * 100).toFixed(1) + ' %';
            }
          }
          totalValue = variation;
        } else {
          const sum = response.filter(i => i.year === year).reduce((acc, curr) => acc + curr[metric.id], 0);
          totalValue = this._utilitiesService.formatCurrencyUsingBrazilianStandards(sum, "R$");
        }
        grandTotalData.push({ propertyName: `${metric.id}_${year}`, value: totalValue });
      });
    });

    treeNodes.push({ data: grandTotalData, children: [], expanded: false });
    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    // 5. Configuração de colunas para o FlipTable
    const dynamicDefaultColumns: any[] = [];
    const dynamicPropsNames: string[] = [];
    this.tableMetrics.forEach(metric => {
      this.distinctYears.forEach(year => {
        const propName = `${metric.id}_${year}`;
        dynamicPropsNames.push(propName);
        dynamicDefaultColumns.push({
          propertyName: propName,
          yearLabel: year.toString(),
          alignment: { header: FlipTableAlignment.CENTER, data: FlipTableAlignment.RIGHT }
        });
      });
    });

    const dynamicGroupedColumns = this.tableMetrics.map(metric => ({
      propertyName: `header_${metric.id}`,
      metricLabel: metric.label
    }));

    this.allColumnsNames = ["nameGnd", ...dynamicPropsNames];
    this.groupedHeaderColumns = ["nameGnd", ...dynamicGroupedColumns.map(c => c.propertyName)];

    setTimeout(() => {
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
    });
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
      { key: 'liquidatedVariationPreviousYear', label: 'Liquidado vs Anterior (%)' },
    ];

    this._exportDataService.exportXLSXWithCustomHeaders(dataForExport, columns, `Comparativo_${new Date().getTime()}`);
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
