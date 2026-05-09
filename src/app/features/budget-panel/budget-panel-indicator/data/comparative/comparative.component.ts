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
export class ComparativeComponent implements OnInit, OnChanges, OnDestroy {

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

  ngOnInit(): void {
    throw new Error('Method not implemented.');
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
          console.log(this.dashComparative, "dwqewqeeqw")
          // this._comunicationCardsService.sendCardPlannedSuccess(this.dashSuccessOfSuccess)
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
    if (!response || response.length === 0) {
      this.tableContent = null;
      return;
    }

    // Calcular Totais Gerais (Total de cada coluna na tabela)
    const grandTotalBudgeted = response.reduce((acc, curr) => acc + curr.budgeted, 0);
    const grandTotalAuthorized = response.reduce((acc, curr) => acc + curr.authorized, 0);
    const grandTotalCommitted = response.reduce((acc, curr) => acc + curr.committed, 0);
    const grandTotalLiquidated = response.reduce((acc, curr) => acc + curr.liquidated, 0);

    const grandTotalLiquidatedPerc = grandTotalAuthorized > 0 ? (grandTotalLiquidated / grandTotalAuthorized) * 100 : 0;

    const groups = new Map<string, IDashComparativeResponse[]>();
    response.forEach(item => {
      const gndKey = `${item.codGnd} - ${item.nameGnd}`;
      if (!groups.has(gndKey)) {
        groups.set(gndKey, []);
      }
      groups.get(gndKey)!.push(item);
    });

    const treeNodes: TreeNode[] = Array.from(groups.entries()).map(([gnd, items]) => {
      const sortedItems = items.sort((a, b) => a.year - b.year);

      const totalBudgeted = sortedItems.reduce((acc, curr) => acc + curr.budgeted, 0);
      const totalAuthorized = sortedItems.reduce((acc, curr) => acc + curr.authorized, 0);
      const totalCommitted = sortedItems.reduce((acc, curr) => acc + curr.committed, 0);
      const totalLiquidated = sortedItems.reduce((acc, curr) => acc + curr.liquidated, 0);
      let totalVariation = '0.00 %';
      if (sortedItems.length >= 2) {
        const firstLiq = sortedItems[0].liquidated;
        const lastLiq = sortedItems[sortedItems.length - 1].liquidated;
        if (firstLiq !== 0) {
          totalVariation = (((lastLiq - firstLiq) / firstLiq) * 100).toFixed(2) + ' %';
        }
      }

      return {
        data: [
          { propertyName: "nameGnd", value: `${gnd}` },
          { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalBudgeted, "R$") },
          { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAuthorized, "R$") },
          { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalCommitted, "R$") },
          { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalLiquidated, "R$") },
          { propertyName: "liquidatedVariationPreviousYear", value: totalVariation }
        ],
        children: sortedItems.map((item, idx) => {
          let variation = '0.00 %';
          if (idx > 0) {
            const prevLiq = sortedItems[idx - 1].liquidated;
            if (prevLiq !== 0) {
              variation = (((item.liquidated - prevLiq) / prevLiq) * 100).toFixed(2) + ' %';
            }
          }

          return {
            data: [
              { propertyName: "nameGnd", value: `Ano: ${item.year}` },
              { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.budgeted, "R$") },
              { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.authorized, "R$") },
              { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.committed, "R$") },
              { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.liquidated, "R$") },
              { propertyName: "liquidatedVariationPreviousYear", value: variation }
            ],
            children: []
          };
        }),
        expanded: false,
      };
    });

    const years = [...new Set(response.map(i => i.year))].sort();
    let cardVariation = 0;
    let grandTotalVariation = '0.00 %';

    if (years.length >= 2) {
      const lastYear = years[years.length - 1];
      const prevYear = years[years.length - 2];

      const sumLastYear = response.filter(i => i.year === lastYear).reduce((acc, curr) => acc + curr.liquidated, 0);
      const sumPrevYear = response.filter(i => i.year === prevYear).reduce((acc, curr) => acc + curr.liquidated, 0);

      if (sumPrevYear !== 0) {
        cardVariation = ((sumLastYear - sumPrevYear) / sumPrevYear) * 100;
        grandTotalVariation = cardVariation.toFixed(2) + ' %';
      }
    }

    const grandTotalNode: TreeNode = {
      data: [
        { propertyName: "nameGnd", value: "Total" },
        { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalBudgeted, "R$") },
        { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalAuthorized, "R$") },
        { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalCommitted, "R$") },
        { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalLiquidated, "R$") },
        { propertyName: "liquidatedVariationPreviousYear", value: grandTotalVariation }
      ],
      children: [],
      expanded: false
    };

    treeNodes.push(grandTotalNode);
    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    this._comunicationCardsService.sendCardComparative(Number(cardVariation.toFixed(2)));

    this.tableContent = {
      customColumn: {
        propertyName: "nameGnd",
        displayName: "Grupo de Despesa",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: [
        {
          propertyName: "budgeted",
          displayName: "Orçado (R$)",
          alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
        },
        {
          propertyName: "authorized",
          displayName: "Autorizado (R$)",
          alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
        },
        {
          propertyName: "committed",
          displayName: "Empenhado (R$)",
          alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
        },
        {
          propertyName: "liquidated",
          displayName: "Liquidado (R$)",
          alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
        },
        {
          propertyName: "liquidatedVariationPreviousYear",
          displayName: "Liquidado vs Anterior (%)",
          alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
        }
      ],
      data: treeNodes,
    };
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
