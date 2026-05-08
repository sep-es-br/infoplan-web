import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { IDashComparativeResponse, IDashPlannedBudgetResponse, IIndicatorExecutionFilter } from '../../../../../core/interfaces/indicator-execution/indicator-execution';
import { ComunicationCardsService } from '../../../../../core/service/comunication-cards/comunication-cards.service';
import { IndicatorExecutionService } from '../../../../../core/service/indicator-execution-service/indicator-execution.service';
import { ChartMaximizeService } from '../../../../../core/service/chart-maximize/chart-maximize.service';
import { ChartDataProcessorService } from '../../../../../core/service/budget-panel/chart-data-processor.service';
import { UtilitiesService } from '../../../../../core/service/utilities.service';
import { ExportDataService } from '../../../../../core/service/export-data';
import { FlipTableAlignment, FlipTableContent, TreeNode } from '../../../../strategic-projects/flip-table-model/flip-table.component';
import { IChartOptions } from '../../../../../shared/models/budget-panel/IChartOptions';
import { RequestStatus } from '../../../../strategic-projects/strategicProjects.component';
import { ChartDataConfig } from '../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { converterToNumber, replacePorcentage } from '../../../../../@core/utils/functionts/functionts';

@Component({
  selector: 'ngx-planned-budgetary',
  templateUrl: './planned-budgetary.component.html',
  styleUrls: ['./planned-budgetary.component.scss']
})
export class PlannedBudgetaryComponent implements OnInit, OnChanges, OnDestroy {


  @Input() filter: IIndicatorExecutionFilter;
  readonly title: string = "Plano Orçamentário";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(IndicatorExecutionService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _charProcessor = inject(ChartDataProcessorService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly destroy$ = new Subject<void>();

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;

  private dashPlannedBudget: IDashPlannedBudgetResponse[] = [];

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
    if (changes['filter']?.currentValue) {
      this.getDashPlannedBudget();
    }
  }

  ngOnInit(): void {
    if (this.filter) {
      this.getDashPlannedBudget();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getDashPlannedBudget(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._indicatorExecutionService.getDashPlannedBudget(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashPlannedBudget ? RequestStatus.SUCCESS : RequestStatus.ERROR;
        })
      )
      .subscribe({
        next: (res: IDashPlannedBudgetResponse[]) => {
          this.dashPlannedBudget = res;
          this.chartHeight = Math.max(
            400,
            this.dashPlannedBudget.length * 50 + 80
          );

          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejado:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashPlannedBudget = null;
        }
      })
  }

  private processChartData(response: IDashPlannedBudgetResponse[]): void {
    if (!response || response.length === 0) {
      this.chartData = { data: { labels: [], datasets: [] } };
      return;
    }

    const uniqueYears = [...new Set(response.map(item => item.year))].sort((a, b) => a - b);
    const mostRecentYear = uniqueYears[uniqueYears.length - 1];
    const dataForRecentYear = response.filter(item => item.year === mostRecentYear);

    // Agrupar e somar valores por PO para o ano atual para rankeamento
    const poTotals = new Map<string, { codPo: string, namePo: string, nameUo: string, liquidated: number, budgeted: number, authorized: number, committed: number }>();
    dataForRecentYear.forEach(item => {
      const key = `${item.codPo} - ${item.namePo}`;
      if (!poTotals.has(key)) {
        poTotals.set(key, {
          codPo: item.codPo,
          namePo: item.namePo,
          nameUo: item.nameUo || '',
          liquidated: 0,
          budgeted: 0,
          authorized: 0,
          committed: 0
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

    const labels = top5Pos.map(entry => entry[0]);

    const datasets = [
      {
        label: `Orçado ${mostRecentYear}`,
        data: top5Pos.map(entry => entry[1].budgeted),
        backgroundColor: this._charProcessor.colors[0],
      },
      {
        label: `Autorizado ${mostRecentYear}`,
        data: top5Pos.map(entry => entry[1].authorized),
        backgroundColor: this._charProcessor.colors[1],
      },
      {
        label: `Empenhado ${mostRecentYear}`,
        data: top5Pos.map(entry => entry[1].committed),
        backgroundColor: this._charProcessor.colors[2],
      },
      {
        label: `Liquidado ${mostRecentYear}`,
        data: top5Pos.map(entry => entry[1].liquidated),
        backgroundColor: this._charProcessor.colors[3],
      }
    ];

    this.chartHeight = Math.max(400, labels.length * 50 + 80);

    this.chartData = {
      data: {
        labels: labels,
        tipoTooltip: 'PO',
        nomePO: top5Pos.map(entry => `${entry[1].codPo} - ${entry[1].namePo}`),
        datasets: datasets,
      },
    };
  }

  private processTableData(response: IDashPlannedBudgetResponse[]): void {
    if (!response || response.length === 0) {
      this.tableContent = null;
      return;
    }

    const grandTotalBudgeted = response.reduce((acc, curr) => acc + curr.budgeted, 0);
    const grandTotalAuthorized = response.reduce((acc, curr) => acc + curr.authorized, 0);
    const grandTotalCommitted = response.reduce((acc, curr) => acc + curr.committed, 0);
    const grandTotalLiquidated = response.reduce((acc, curr) => acc + curr.liquidated, 0);

    const groups = new Map<string, IDashPlannedBudgetResponse[]>();
    response.forEach(item => {
      if (!groups.has(item.namePo)) {
        groups.set(item.namePo, []);
      }
      groups.get(item.namePo)!.push(item);
    });

    const allTreeNodes: TreeNode[] = Array.from(groups.entries()).map(([poName, items]) => {
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
          { propertyName: "namePo", value: `${poName}` },
          { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalBudgeted, "R$") },
          { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAuthorized, "R$") },
          { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalCommitted, "R$") },
          { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalLiquidated, "R$") },
          { propertyName: "liquidatedVariationPreviousYear", value: totalVariation },
          { propertyName: "liquidatedValueRaw", value: totalLiquidated } // Helper for sorting
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
              { propertyName: "namePo", value: `Ano: ${item.year}` },
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

    allTreeNodes.sort((a, b) => {
      const valA = (a.data.find(d => d.propertyName === 'liquidatedValueRaw')?.value as number) || 0;
      const valB = (b.data.find(d => d.propertyName === 'liquidatedValueRaw')?.value as number) || 0;
      return valB - valA;
    });

    const displayedTreeNodes = allTreeNodes.slice(0, 50);

    const grandTotalNode: TreeNode = {
      data: [
        { propertyName: "namePo", value: "Total" },
        { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalBudgeted, "R$") },
        { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalAuthorized, "R$") },
        { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalCommitted, "R$") },
        { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalLiquidated, "R$") },
        { propertyName: "liquidatedVariationPreviousYear", value: "" }
      ],
      children: [],
      expanded: false
    };

    displayedTreeNodes.push(grandTotalNode);
    this._utilitiesService.sortTreeNodes(displayedTreeNodes, "top");

    this.tableContent = {
      customColumn: {
        propertyName: "namePo",
        displayName: "Plano Orçamentário",
        alignment: { header: FlipTableAlignment.LEFT, data: FlipTableAlignment.LEFT },
      },
      defaultColumns: [
        { propertyName: "budgeted", displayName: "Orçado (R$)", alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT } },
        { propertyName: "authorized", displayName: "Autorizado (R$)", alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT } },
        { propertyName: "committed", displayName: "Empenhado (R$)", alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT } },
        { propertyName: "liquidated", displayName: "Liquidado (R$)", alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT } },
        { propertyName: "liquidatedVariationPreviousYear", displayName: "Var. Liquidado (%)", alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT } }
      ],
      data: displayedTreeNodes,
    };
  }

  handleTableDownload(): void {
    if (!this.dashPlannedBudget || this.dashPlannedBudget.length === 0) return;

    const dataForExport = this.dashPlannedBudget.map(item => ({
      year: item.year,
      namePo: `${item.codPo} - ${item.namePo}`,
      budgeted: item.budgeted,
      authorized: item.authorized,
      committed: item.committed,
      liquidated: item.liquidated
    }));

    // Ordenar por Ano e depois por Liquidado desc
    dataForExport.sort((a, b) => b.year - a.year || b.liquidated - a.liquidated);

    const columns = [
      { key: 'year', label: 'Ano' },
      { key: 'namePo', label: 'Plano Orçamentário' },
      { key: 'budgeted', label: 'Orçado (R$)' },
      { key: 'authorized', label: 'Autorizado (R$)' },
      { key: 'committed', label: 'Empenhado (R$)' },
      { key: 'liquidated', label: 'Liquidado (R$)' },
    ];

    this._exportDataService.exportXLSXWithCustomHeaders(dataForExport, columns, `Plano_Orcamentario_Completo_${new Date().getTime()}`);
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
