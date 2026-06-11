import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../../../strategic-projects/flip-table-model/flip-table.component";
import {
  IPainelObrasRequest,
  IQuantidadePorAnoEStatus,
} from "../../../../../../core/interfaces/painel-obras/painel-obras";
import { IChartOptions } from "../../../../../../shared/models/budget-panel/IChartOptions";
import {
  ChartDataConfig,
} from "../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";
import { Subject } from "rxjs";
import { ChartDataProcessorService } from "../../../../../../core/service/budget-panel/chart-data-processor.service";
import { ChartMaximizeService } from "../../../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../../../core/service/export-data";
import { PainelObrasService } from "../../../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../../../core/service/utilities.service";
import { converterToNumber } from "../../../../../../@core/utils/functionts/functionts";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { OrgChartOppositeComponent } from "../../../../../budget-panel/budget-panel-indicator/data/org-chart-opposite/org-chart-opposite.component";
import { OrgChartVerticalGroupedComponent } from "../../../../../budget-panel/budget-panel-indicator/data/org-chart-vertical-grouped/org-chart-vertical-grouped.component";
import { CommonModule, NgTemplateOutlet } from "@angular/common";

@Component({
  selector: "ngx-total-entregas-por-ano-e-status",
  templateUrl: "./total-entregas-por-ano-e-status.component.html",
  styleUrls: ["./total-entregas-por-ano-e-status.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FlipTableComponent,
    OrgChartOppositeComponent,
    OrgChartVerticalGroupedComponent,
    NgTemplateOutlet
  ],
})
export class TotalEntregasPorAnoEStatusComponent
  implements OnChanges, OnDestroy, OnInit {
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Valor total das entregas por ano e status";

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
  chartData!: IChartOptions;
  groupingMode: "STATUS" | "ANO" | string = "STATUS";


  private readonly chartColorPalette: string[] = [
    "#42726F",
    "#00A261",
    "#0081C1",
    "#F38B1D",
    "#EFCB45",
    "#DD6B49",
    "#6B5B95",
    "#88B04B",
    "#5B5EA6",
    "#9B2335",
  ];

  private quantidadePorAnStatusResponse: {
    ano: string;
    status: string;
    planejado: number;
    realizado: number;
  }[] = [];

  currentParams!: IPainelObrasRequest;


  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);
  private readonly _cdr = inject(ChangeDetectorRef);

  constructor() {

  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.executeSearch(query);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.currentParams = { ...this.filter };
      this.loadData();
    }
    this.chartDataConfig.showMaximizeButton = this.isChartMaximized(
      "total-entregas-por-ano-e-status",
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.requestStatus = RequestStatus.LOADING;
    this.chartData = { data: { labels: [], datasets: [] } } as IChartOptions;
    this.chartColors = [];

    this._painelObrasService
      .getTotalEntregasPorAnoEStatus(this.filter)
      .subscribe({
        next: (response) => {
          this.quantidadePorAnStatusResponse = response;
          this.assembleFlipTableContent(response);
          this.chartData = this.processChartData(response);
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error(err) {
          console.error(
            "Erro ao carregar os dados das entregas por ano e status:",
            err,
          );
          // this.requestStatus = RequestStatus.ERROR;
        },
      });
  }

  onGroupingModeChange(group: "YEAR_STATUS" | "YEAR_ANO" | "ANO" | "STATUS" | string) {
    this.groupingMode = group;
    if (this.quantidadePorAnStatusResponse && this.quantidadePorAnStatusResponse.length > 0) {
      this.assembleFlipTableContent(this.quantidadePorAnStatusResponse);
    }

    this._cdr.markForCheck();
  }

  assembleFlipTableContent(
    data: IQuantidadePorAnoEStatus[],
    shouldStartExpanded: boolean = true,
  ): void {
    const standardAlignment = {
      header: FlipTableAlignment.CENTER,
      data: FlipTableAlignment.RIGHT,
    };

    const tableColumns = [
      {
        propertyName: "planejado",
        displayName: "Planejado",
        alignment: standardAlignment,
      },
      {
        propertyName: "realizado",
        displayName: "Realizado",
        alignment: standardAlignment,
      },
      {
        propertyName: "total",
        displayName: "Total",
        alignment: standardAlignment,
      },
    ];

    const isGroupingByYear = this.groupingMode.startsWith('YEAR_') || this.groupingMode === 'ANO';
    const groupField = isGroupingByYear ? 'ano' : 'status';
    const childField = isGroupingByYear ? 'status' : 'ano';

    const groupedData = data.reduce(
      (acc, current: any) => {
        const key = current[groupField];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {} as Record<string, IQuantidadePorAnoEStatus[]>,
    );

    const finalData: Array<TreeNode> = Object.entries(groupedData).map(
      ([groupValue, items]) => {
        const totalPlanejado = items.reduce((sum, i) => sum + i.planejado, 0);
        const totalRealizado = items.reduce((sum, i) => sum + i.realizado, 0);

        const children = items.map((item: any) => ({
          data: [
            {
              originalPropertyName: childField,
              propertyName: "firstColumn",
              value: item[childField],
            },
            {
              propertyName: "planejado",
              value:
                this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  item.planejado,
                  "R$",
                ),
            },
            {
              propertyName: "realizado",
              value:
                this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  item.realizado,
                  "R$",
                ),
            },
            {
              propertyName: "total",
              value:
                this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  item.planejado + item.realizado,
                  "R$",
                ),
            },
          ],
          children: [],
          expanded: false,
        }));

        return {
          data: [
            {
              originalPropertyName: groupField,
              propertyName: "firstColumn",
              value: groupValue,
            },
            {
              propertyName: "planejado",
              value:
                this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  totalPlanejado,
                  "R$",
                ),
            },
            {
              propertyName: "realizado",
              value:
                this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  totalRealizado,
                  "R$",
                ),
            },
            {
              propertyName: "total",
              value:
                this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  totalPlanejado + totalRealizado,
                  "R$",
                ),
            },
          ],
          children: children,
          expanded: shouldStartExpanded,
        };
      },
    );

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: groupField,
        propertyName: "firstColumn",
        displayName: isGroupingByYear ? "Ano / Status" : "Status / Ano",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.LEFT,
        },
      },
      data: finalData,
    };
  }

  private processChartData(
    response: IQuantidadePorAnoEStatus[],
  ): IChartOptions {
    if (!response || response.length === 0)
      return { data: { labels: [], datasets: [] } } as IChartOptions;

    return {
      data: {
        labels: response.map(
          (item: IQuantidadePorAnoEStatus) => `${item.ano}|#|${item.status}`,
        ),
        datasets: [
          {
            label: "Planejado",
            data: response.map((item) => item.planejado),
          },
          {
            label: "Realizado",
            data: response.map((item) => item.realizado),
          },
        ],
      },
    };
  }

  handleUserTableSearch(search: string) {
    this.searchSubject.next(search);
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.quantidadePorAnStatusResponse.filter(
        (item) =>
          item.ano.toLowerCase().includes(preparedSearchTerm) ||
          item.status.toLowerCase().includes(preparedSearchTerm),
      );

      this.assembleFlipTableContent(filteredItems, true);
    }
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string }> = [
      { key: "ano", label: "Ano" },
      { key: "status", label: "Status" },
      { key: "planejado", label: "Planejado" },
      { key: "realizado", label: "Realizado" },
    ];

    const dataToExport = this.quantidadePorAnStatusResponse.map((item) => ({
      ano: item.ano,
      status: item.status,
      planejado: converterToNumber(String(item.planejado)),
      realizado: converterToNumber(String(item.realizado)),
    }));

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "total_entregas_por_ano_e_status.xlsx",
    );
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
