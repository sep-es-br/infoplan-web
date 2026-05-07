import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
  styleUrls: ['./success-planned.component.scss']
})
export class SuccessPlannedComponent implements OnInit, OnChanges, OnDestroy {

  @Input() filter: IIndicatorExecutionFilter;
  readonly title: string = "Sucesso do Planejado";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(IndicatorExecutionService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _charProcessor = inject(ChartDataProcessorService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly destroy$ = new Subject<void>();

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;

  groupingMode: 'GND' | 'YEAR_GND' = 'YEAR_GND';

  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };

  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };


  chartHeight: number = 350;
  private dashSuccessOfSuccess: IDashSuccessPlannedResponse[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'].currentValue) {
      this.getDashSuccessOfSuccess();
    }
  }

  ngOnInit(): void {
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

          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Sucesso do Planejado:", err);
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

    // Pacote completo de dados para o tooltip
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
        labels: response.map((item: IDashSuccessPlannedResponse) => `${item.year} - ${item.nameGnd}`),
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
  }

  private processTableData(response: IDashSuccessPlannedResponse[]): void {
    if (!response || response.length === 0) {
      this.tableContent = null;
      return;
    }

    // Calcular Totais Gerais (Total de cada coluna na tabela)
    const grandTotalBudgeted = response.reduce((acc, curr) => acc + curr.budgeted, 0);
    const grandTotalAuthorized = response.reduce((acc, curr) => acc + curr.authorized, 0);
    const grandTotalCommitted = response.reduce((acc, curr) => acc + curr.committed, 0);
    const grandTotalLiquidated = response.reduce((acc, curr) => acc + curr.liquidated, 0);

    const grandTotalCommittedPerc = grandTotalAuthorized > 0 ? (grandTotalCommitted / grandTotalAuthorized) * 100 : 0;
    const grandTotalLiquidatedPerc = grandTotalAuthorized > 0 ? (grandTotalLiquidated / grandTotalAuthorized) * 100 : 0;

    // Agrupar por GND
    const groups = new Map<string, IDashSuccessPlannedResponse[]>();
    response.forEach(item => {
      if (!groups.has(item.nameGnd)) {
        groups.set(item.nameGnd, []);
      }
      groups.get(item.nameGnd)!.push(item);
    });

    const treeNodes: TreeNode[] = Array.from(groups.entries()).map(([gnd, items]) => {
      // Calcular Totais do Grupo (GND)
      const totalBudgeted = items.reduce((acc, curr) => acc + curr.budgeted, 0);
      const totalAuthorized = items.reduce((acc, curr) => acc + curr.authorized, 0);
      const totalCommitted = items.reduce((acc, curr) => acc + curr.committed, 0);
      const totalLiquidated = items.reduce((acc, curr) => acc + curr.liquidated, 0);

      // Calcular Porcentagens Baseadas nos Totais do Grupo
      const totalCommittedPerc = totalAuthorized > 0 ? (totalCommitted / totalAuthorized) * 100 : 0;
      const totalLiquidatedPerc = totalAuthorized > 0 ? (totalLiquidated / totalAuthorized) * 100 : 0;

      return {
        data: [
          { propertyName: "nameGnd", value: `${gnd}` },
          { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalBudgeted, "R$") },
          { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAuthorized, "R$") },
          { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalCommitted, "R$") },
          { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalLiquidated, "R$") },
          { propertyName: "liquidatedBarAuthorized", value: totalLiquidatedPerc.toFixed(1) + ' %' },
          { propertyName: "committedBarAuthorized", value: totalCommittedPerc.toFixed(1) + ' %' }
        ],
        children: items.map(item => ({
          data: [
            { propertyName: "nameGnd", value: `Ano: ${item.year}` },
            { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.budgeted, "R$") },
            { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.authorized, "R$") },
            { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.committed, "R$") },
            { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.liquidated, "R$") },
            { propertyName: "liquidatedBarAuthorized", value: item.liquidatedBarAuthorized.toFixed(1) + ' %' },
            { propertyName: "committedBarAuthorized", value: item.committedBarAuthorized.toFixed(1) + ' %' }
          ],
          children: []
        })),
        expanded: false,
      };
    });

    // Criar o nó do Total Geral
    const grandTotalNode: TreeNode = {
      data: [
        { propertyName: "nameGnd", value: "Total" },
        { propertyName: "budgeted", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalBudgeted, "R$") },
        { propertyName: "authorized", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalAuthorized, "R$") },
        { propertyName: "committed", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalCommitted, "R$") },
        { propertyName: "liquidated", value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(grandTotalLiquidated, "R$") },
        { propertyName: "liquidatedBarAuthorized", value: grandTotalLiquidatedPerc.toFixed(1) + ' %' },
        { propertyName: "committedBarAuthorized", value: grandTotalCommittedPerc.toFixed(1) + ' %' }
      ],
      children: [],
      expanded: false
    };

    // Adicionar Total Geral e ordenar para o topo
    treeNodes.push(grandTotalNode);
    this._utilitiesService.sortTreeNodes(treeNodes, "top");

    this._comunicationCardsService.sendCardPlannedSuccess(Number(grandTotalLiquidatedPerc.toFixed(1)));

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
          propertyName: "liquidatedBarAuthorized",
          displayName: "Liquidado/Autorizado (%)",
          alignment: { header: FlipTableAlignment.RIGHT, data: FlipTableAlignment.RIGHT },
        },
        {
          propertyName: "committedBarAuthorized",
          displayName: "Empenhado/Autorizado (%)",
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
      { key: 'liquidatedBarAuthorized', label: 'Liquidado (%)' },
      { key: 'committedBarAuthorized', label: 'Empenhado (%)' },
    ];

    this._exportDataService.exportXLSXWithCustomHeaders(dataForExport, columns, `Sucesso_do_Planejado_${new Date().getTime()}`);
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
