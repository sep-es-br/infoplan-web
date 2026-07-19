import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../../../../strategic-projects/pie-chart-model/pieChartModel.component';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../../../../strategic-projects/flip-table-model/flip-table.component';
import { Subject } from 'rxjs';
import { IPainelObrasRequest } from '../../../../../../core/interfaces/painel-obras/painel-obras';
import { ChartDataProcessorService } from '../../../../../../core/service/budget-panel/chart-data-processor.service';
import { ChartMaximizeService } from '../../../../../../core/service/chart-maximize/chart-maximize.service';
import { ExportDataService } from '../../../../../../core/service/export-data';
import { PainelObrasService } from '../../../../../../core/service/painel-obras/painel-obras.service';
import { UtilitiesService } from '../../../../../../core/service/utilities.service';
import { IChartOptions } from '../../../../../../shared/models/budget-panel/IChartOptions';
import { ChartDataConfig } from '../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { RequestStatus } from '../../../../../strategic-projects/strategicProjects.component';
import { getChartColors } from '../../../../../../@core/utils/functionts/functionts';
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { PieChartComponent } from "../../../../../budget-panel/org-chart-pie/org-chart-pie.component";
import { getStatusCategory } from "../../../../../../shared/models/painel-obras/obra-status-groups";

@Component({
  selector: 'ngx-quantidade-por-status',
  templateUrl: './quantidade-por-status.component.html',
  styleUrls: ['./quantidade-por-status.component.scss'],
  standalone: true,
  imports: [
    FlipTableComponent,
    NgxChartsModule,
    PieChartModelComponent
  ]
})
export class QuantidadePorStatusComponent implements OnChanges, OnDestroy {
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Quantidade de iniciativas por status";
  charData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  chartDataConfig: ChartDataConfig = {
    minimized: {
      legend: {
        fontSize: 14,
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 10
      }
    },
    maximized: {
      legend: {
        fontSize: 16,
        itemWidth: 16,
        itemHeight: 16,
        itemGap: 12
      }
    },
    grid: {
      top: "10%",
      left: "3%",
      right: "5%",
      bottom: "3%",
      containLabel: true,
    },
  };
  selectedMaximize: boolean = false;
  chartColors: string[] = [];
  chartData: { value: number; name: string }[] = [];

  private readonly chartColorPalette: string[] = [
    '#42726F',
    '#00A261',
    '#0081C1',
    '#F38B1D',
    '#EFCB45',
    '#DD6B49',
    '#6B5B95',
    '#88B04B',
    '#5B5EA6',
    '#9B2335',
  ];

  private quantidadePoStatusResponse: {
    status: string;
    quantidadeEntregas: number;
  }[] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
    this.chartDataConfig.showMaximizeButton =
      this.isChartMaximized("quantidade-por-status");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.requestStatus = RequestStatus.LOADING;
    this.chartData = [];
    this.chartColors = [];

    this._painelObrasService.getQuantidadeStatus(this.filter).subscribe({
      next: (response) => {
        this.quantidadePoStatusResponse = response;
        this.assembleFlipTableContent(response);

        // Agrupa os dados para o gráfico de pizza
        const groupedData = response.reduce((acc, current) => {
          const category = getStatusCategory(current.status);
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += current.quantidadeEntregas;
          return acc;
        }, {} as Record<string, number>);

        this.chartData = Object.entries(groupedData).map(([name, value]) => ({
          value,
          name
        }));

        this.chartColors = getChartColors(this.chartData.length, this.chartColorPalette);
        this.requestStatus = RequestStatus.SUCCESS;
      },
      error(err) {
        console.error('Erro ao carregar os dados do investimento acumulado:', err);
        // this.requestStatus = RequestStatus.ERROR;
      },
    });
  }


  assembleFlipTableContent(data: { status: string; quantidadeEntregas: number }[], shouldStartExpanded: boolean = false): void {
    const standardAlignment = {
      header: FlipTableAlignment.CENTER,
      data: FlipTableAlignment.RIGHT,
    };

    const tableColumns = [
      {
        propertyName: 'quantidadeEntregas',
        displayName: 'Quantidade de entregas',
        alignment: standardAlignment,
      },
    ];

    const finalData: Array<TreeNode> = data.map((item) => ({
      data: [
        {
          originalPropertyName: 'status',
          propertyName: 'firstColumn',
          value: item.status,
        },
        {
          propertyName: 'quantidadeEntregas',
          value: new Intl.NumberFormat('pt-BR').format(item.quantidadeEntregas),
        },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }));

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'status',
        propertyName: 'firstColumn',
        displayName: 'Status',
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.LEFT,
        },
      },
      data: finalData,
    };
  }

  handleUserTableSearch(search: string) {
    if (search.length > 0) {
      const preparedSearchTerm = search.toLowerCase();
      const filteredData = this.quantidadePoStatusResponse.filter((item) =>
        item.status.toLowerCase().includes(preparedSearchTerm) ||
        item.quantidadeEntregas.toString().toLowerCase().includes(preparedSearchTerm)
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(this.quantidadePoStatusResponse);
    }
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string, label: string }> = [
      {
        key: 'status',
        label: 'Status',
      },
      {
        key: 'quantidadeEntregas',
        label: 'Quantidade de entregas',
      },
    ];

    this._exportDataService.exportXLSXWithCustomHeaders(this.quantidadePoStatusResponse, columns, 'quantidade-por-status');
  }

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
    this.maximizeButtonClick.emit(event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }

  calcMaximizedHeight(): number {
    return this._chartMaximizeService.calcMaximizedHeight();
  }
}
