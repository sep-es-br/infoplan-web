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
  IPainelObrasRequest,
  ITotalMunicipioStatus,
} from "../../../../../../core/interfaces/painel-obras/painel-obras";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { converterToNumber } from "../../../../../../@core/utils/functionts/functionts";
import { ChartMaximizeService } from "../../../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../../../core/service/export-data";
import { PainelObrasService } from "../../../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../../../core/service/utilities.service";
import {
  FlipTableContent,
  FlipTableAlignment,
  TreeNode,
  FlipTableComponent,
} from "../../../../../strategic-projects/flip-table-model/flip-table.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";
import { OrgChartVerticalGroupedComponent } from "../../../org-chart-vertical-grouped/org-chart-vertical-grouped.component";
import { NgTemplateOutlet } from "@angular/common";
import { ChartDataConfig } from "../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { IChartOptions } from "../../../../../../shared/models/budget-panel/IChartOptions";

@Component({
  selector: "ngx-total-entregas-por-municipio-status",
  templateUrl: "./total-entregas-por-municipio-status.component.html",
  styleUrls: ["./total-entregas-por-municipio-status.component.scss"],
  standalone: true,
  imports: [
    FlipTableComponent,
    OrgChartVerticalGroupedComponent,
    NgTemplateOutlet,
  ],
})
export class TotalEntregasPorMunicipioStatusComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Valor total das entregas por município e status";

  groupingMode: "MUNICIPIO" | "STATUS" | string = "MUNICIPIO";
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  selectedMaximize: boolean = false;
  chartData!: IChartOptions;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "3%",
      right: "5%",
      bottom: "3%",
      containLabel: true,
    },
  };

  private totalEntregasPorMunicipioStatusResponse: ITotalMunicipioStatus[] = [];

  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);
  private readonly _cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executeSearch(query);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadData() {
    this.requestStatus = RequestStatus.LOADING;

    this._painelObrasService
      .getTotalEntregasPorMunicipioStatus(this.filter)
      .subscribe({
        next: (response) => {
          const sortedResponse = [...(response || [])].sort(
            (a, b) => Number(b.planejado ?? 0) - Number(a.planejado ?? 0),
          );
          this.totalEntregasPorMunicipioStatusResponse = sortedResponse;
          this.assembleFlipTableContent(sortedResponse);
          this.chartData = this.processChartData(sortedResponse);
          this.requestStatus = sortedResponse.length
            ? RequestStatus.SUCCESS
            : RequestStatus.EMPTY;
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

    private processChartData(
      response: ITotalMunicipioStatus[],
    ): IChartOptions {
      if (!response || response.length === 0)
        return { data: { labels: [], datasets: [] } } as IChartOptions;
  
      return {
        data: {
          labels: response.map(
            (item: ITotalMunicipioStatus) => `${item.municipio}|#|${item.status}`,
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

  onGroupingModeChange(
    group:
      | "MUNICIPIO_STATUS"
      | "STATUS_MUNICIPIO"
      | "MUNICIPIO"
      | "STATUS"
      | string,
  ) {
    this.groupingMode = group;
    if (
      this.totalEntregasPorMunicipioStatusResponse &&
      this.totalEntregasPorMunicipioStatusResponse.length > 0
    ) {
      this.assembleFlipTableContent(
        this.totalEntregasPorMunicipioStatusResponse,
      );
    }

    this._cdr.markForCheck();
  }

  handleUserTableSearch(search: string) {
    if (search.length > 0) {
      const preparedSearchTerm = search.toLowerCase();
      const filteredData = this.totalEntregasPorMunicipioStatusResponse.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.status.toString().toLowerCase().includes(preparedSearchTerm),
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(
        this.totalEntregasPorMunicipioStatusResponse,
      );
    }
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.totalEntregasPorMunicipioStatusResponse.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.status.toString().toLowerCase().includes(preparedSearchTerm),
      );

      this.assembleFlipTableContent(filteredItems, true);
    }
  }

  assembleFlipTableContent(
    data: ITotalMunicipioStatus[],
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


        const isGroupingByYear =
      (this.groupingMode && this.groupingMode.startsWith && this.groupingMode.startsWith('MUNICIPIO_')) ||
      (this.groupingMode && this.groupingMode.startsWith && this.groupingMode.startsWith('STATUS_')) ||
      this.groupingMode === 'MUNICIPIO';
    // use actual object keys (lowercase) — data items have 'municipio' and 'status'
    const groupField = isGroupingByYear ? 'municipio' : 'status';
    const childField = isGroupingByYear ? 'status' : 'municipio';


        const groupedData = data.reduce(
          (acc, current: any) => {
            const key = current[groupField];
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(current);
            return acc;
          },
          {} as Record<string, ITotalMunicipioStatus[]>,
        );

    // const groupedData = data.reduce(
    //   (acc, current) => {
    //     if (!acc[current.status]) {
    //       acc[current.status] = [];
    //     }
    //     acc[current.status].push(current);
    //     return acc;
    //   },
    //   {} as Record<string, ITotalMunicipioStatus[]>,
    // );

    const sortedGroups = Object.entries(groupedData).sort(
      ([, itemsA], [, itemsB]) => {
        const totalA = itemsA.reduce(
          (sum, item) => sum + item.planejado,
          0,
        );
        const totalB = itemsB.reduce(
          (sum, item) => sum + item.planejado,
          0,
        );
        return totalB - totalA;
      },
    );

    const finalData: Array<TreeNode> = sortedGroups.map(
      ([groupKey, items]) => {
        const totalPlanejado = items.reduce((sum, i) => sum + i.planejado, 0);
        const totalRealizado = items.reduce((sum, i) => sum + i.realizado, 0);

        const children = [...items]
          .sort(
            (a, b) => Number(b.planejado ?? 0) - Number(a.planejado ?? 0),
          )
          .map((item: any) => ({
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
              value: groupKey,
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
        displayName: groupField === 'municipio' ? 'Município' : 'Status',
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.LEFT,
        },
      },
      data: finalData,
    };
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string }> = [
      { key: "municipio", label: "Município" },
      { key: "status", label: "Status" },
      { key: "planejado", label: "Planejado" },
      { key: "realizado", label: "Realizado" },
      { key: "total", label: "Total" },
    ];

    const dataToExport = this.totalEntregasPorMunicipioStatusResponse.map(
      (item) => ({
        municipio: item.municipio,
        status: item.status,
        planejado: converterToNumber(String(item.planejado)),
        realizado: converterToNumber(String(item.realizado)),
        total: item.planejado + item.realizado
      }),
    );

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "total_entregas_por_municipio_status.xlsx",
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

  calcMaximizedChartHeight(): number {
    const controlsHeight = 50;
    return Math.max(this.calcMaximizedHeight() - controlsHeight, 200);
  }
}
