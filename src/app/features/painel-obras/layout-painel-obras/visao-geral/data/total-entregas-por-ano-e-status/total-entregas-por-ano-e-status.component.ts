import {
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
  OrgChartHorizontalComponent,
} from "../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";
import { Subject } from "rxjs";
import { ChartDataProcessorService } from "../../../../../../core/service/budget-panel/chart-data-processor.service";
import { ChartMaximizeService } from "../../../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../../../core/service/export-data";
import { PainelObrasService } from "../../../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../../../core/service/utilities.service";
import { OrgChartVerticalComponent } from "../../../../../budget-panel/org-chart-bar/org-chart-vertical/org-chart-vertical.component";
import { getStatusCategory } from "../../../../../../shared/models/painel-obras/obra-status-groups";
import { converterToNumber } from "../../../../../../@core/utils/functionts/functionts";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

@Component({
  selector: "ngx-total-entregas-por-ano-e-status",
  templateUrl: "./total-entregas-por-ano-e-status.component.html",
  styleUrls: ["./total-entregas-por-ano-e-status.component.scss"],
  standalone: true,
  imports: [
    FlipTableComponent,
    OrgChartHorizontalComponent,
    OrgChartVerticalComponent,
  ],
})
export class TotalEntregasPorAnoEStatusComponent
  implements OnChanges, OnDestroy, OnInit
{
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();
  readonly title: string = "Valor total das entregas por ano e status";
  charData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "20%",
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

  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);

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

  currentParams!: IPainelObrasRequest;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.requestStatus = RequestStatus.LOADING;
    this.chartData = [];
    this.chartColors = [];

    this._painelObrasService
      .getTotalEntregasPorAnoEStatus(this.filter)
      .subscribe({
        next: (response) => {
          this.quantidadePorAnStatusResponse = response;
          this.assembleFlipTableContent(response);
          this.processChartData(response);
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

    const groupedData = data.reduce(
      (acc, current) => {
        if (!acc[current.status]) {
          acc[current.status] = [];
        }
        acc[current.status].push(current);
        return acc;
      },
      {} as Record<string, IQuantidadePorAnoEStatus[]>,
    );

    console.log(groupedData);

    const finalData: Array<TreeNode> = Object.entries(groupedData).map(
      ([status, items]) => {
        const totalPlanejado = items.reduce((sum, i) => sum + i.planejado, 0);
        const totalRealizado = items.reduce((sum, i) => sum + i.realizado, 0);

        const children = items.map((item) => ({
          data: [
            {
              originalPropertyName: "ano",
              propertyName: "firstColumn",
              value: item.ano,
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
              originalPropertyName: "status",
              propertyName: "firstColumn",
              value: status,
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
        originalPropertyName: "status",
        propertyName: "firstColumn",
        displayName: "Status / Ano",
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
      return (this.charData = { data: { labels: [], datasets: [] } });

    const years = [...new Set(response.map((r) => r.ano))].sort();
    const categories = [...years, "Total"];

    // Agrupa os dados pelo status mapeado
    const groupedByStatusCategory = response.reduce(
      (acc, current) => {
        const category = getStatusCategory(current.status);
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(current);
        return acc;
      },
      {} as Record<string, IQuantidadePorAnoEStatus[]>,
    );

    const statuses = Object.keys(groupedByStatusCategory);

    const datasets = statuses.map((statusCategory, index) => ({
      label: statusCategory,
      data: categories.map((cat) => {
        const items = groupedByStatusCategory[statusCategory];

        if (cat === "Total") {
          return items.reduce((sum, item) => sum + item.planejado, 0);
        }

        return items
          .filter((item) => item.ano === cat)
          .reduce((sum, item) => sum + item.planejado, 0);
      }),
      backgroundColor:
        this.chartColorPalette[index % this.chartColorPalette.length],
    }));

    return (this.charData = {
      data: {
        labels: categories,
        datasets: datasets,
      },
    });
  }

  handleUserTableSearch(search: string) {
    this.searchSubject.next(search);
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      console.log("Search term too short, resetting table content.", preparedSearchTerm);
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
