import { Subject } from "rxjs";
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from "../../../strategic-projects/flip-table-model/flip-table.component";
import { PieChartModelComponent } from "../../../strategic-projects/pie-chart-model/pieChartModel.component";
import { IPainelObrasRequest } from "../../../../core/interfaces/painel-obras/painel-obras";
import { ChartDataProcessorService } from "../../../../core/service/budget-panel/chart-data-processor.service";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { PainelObrasService } from "../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import { IChartOptions } from "../../../../shared/models/budget-panel/IChartOptions";
import { ChartDataConfig } from "../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { Component, OnChanges, OnDestroy, Input, inject, SimpleChanges } from "@angular/core";

@Component({
  selector: "ngx-visao-geral",
  templateUrl: "./visao-geral.component.html",
  standalone: true,
  imports: [FlipTableComponent, PieChartModelComponent],
  styleUrls: ["./visao-geral.component.scss"],
})
export class VisaoGeralComponent implements OnChanges, OnDestroy {
  @Input() filter!: IPainelObrasRequest;

  readonly title: string = "Quantidade de iniciativas por status";
  charData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "3%",
      bottom: "0%",
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
        this.chartData = this.quantidadePoStatusResponse.map((item) => ({
          value: item.quantidadeEntregas,
          name: item.status,
        }));
        this.chartColors = this.getChartColors(this.chartData.length);
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

  private getChartColors(count: number): string[] {
    return Array.from({ length: count }, (_, index) =>
      this.chartColorPalette[index % this.chartColorPalette.length],
    );
  }

  handleUserTableSearch(search: string) {}

  handleUserTableDownload() {}

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
