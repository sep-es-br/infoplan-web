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
import { finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  searchSubject = new Subject<string>();

  allColumnsNames: string[] = [];
  groupedHeaderColumns: string[] = [];
  distinctYears: number[] = [];

  public tableMetrics = [
    { id: 'budgeted', label: 'Orçado' },
    { id: 'authorized', label: 'Autorizado' },
    { id: 'committed', label: 'Empenhado' },
    { id: 'liquidated', label: 'Liquidado' },
    { id: 'liquidatedVariationPreviousYear', label: 'Variação Liquidado (%)' }
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
      left: "0%",
      right: "3%",
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
    this.tableContent = null;
    if (!response || response.length === 0) return;

    // 1. Anos únicos ordenados
    this.distinctYears = Array.from(new Set(response.map(item => item.year))).sort();

    // 2. Agrupar por PO
    const poGroups = new Map<string, IDashPlannedBudgetResponse[]>();
    response.forEach(item => {
      const poKey = `${item.codPo} - ${item.namePo}`;
      if (!poGroups.has(poKey)) poGroups.set(poKey, []);
      poGroups.get(poKey)!.push(item);
    });

    // 3. Criar as linhas planares
    const allTreeNodes: TreeNode[] = Array.from(poGroups.entries()).map(([poName, items]) => {
      const sortedItems = items.sort((a, b) => a.year - b.year);
      const rowData: any[] = [{ propertyName: "namePo", value: poName }];

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

      // Helper para ordenação pelo valor liquidado mais recente
      const lastLiq = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].liquidated : 0;

      return { data: rowData, children: [], expanded: false, liquidatedValueRaw: lastLiq };
    });

    // Ordenar por Liquidado desc e pegar top 50
    allTreeNodes.sort((a, b) => (b as any).liquidatedValueRaw - (a as any).liquidatedValueRaw);
    const displayedTreeNodes = allTreeNodes.slice(0, 50);

    // 4. Totais
    const grandTotalData: any[] = [{ propertyName: "namePo", value: "Total" }];
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

    displayedTreeNodes.push({ data: grandTotalData, children: [], expanded: false });
    this._utilitiesService.sortTreeNodes(displayedTreeNodes, "top");

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

    this.allColumnsNames = ["namePo", ...dynamicPropsNames];
    this.groupedHeaderColumns = ["namePo", ...dynamicGroupedColumns.map(c => c.propertyName)];

    setTimeout(() => {
      this.tableContent = {
        customColumn: {
          propertyName: "namePo",
          displayName: "Plano Orçamentário",
          alignment: { header: FlipTableAlignment.LEFT, data: FlipTableAlignment.LEFT },
        },
        groupedColumns: dynamicGroupedColumns,
        defaultColumns: dynamicDefaultColumns,
        data: displayedTreeNodes,
      };
    });
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


  handleSearch(search: string): void {
    this.searchSubject.next(search);
  }

  executarFiltroTabela(search: string): void {
    if (!this.dashPlannedBudget) return;

    const searchTerm = search ? search.toLowerCase() : '';
    const filtered = this.dashPlannedBudget.filter((item) => {
      const nameMatch = item.namePo ? item.namePo.toLowerCase().includes(searchTerm) : false;
      const codMatch = item.codPo ? item.codPo.toString().toLowerCase().includes(searchTerm) : false;
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
