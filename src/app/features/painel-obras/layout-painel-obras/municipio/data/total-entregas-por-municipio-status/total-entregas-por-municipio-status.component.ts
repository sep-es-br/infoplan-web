import {
  Component,
  EventEmitter,
  inject,
  Input,
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

@Component({
  selector: "ngx-total-entregas-por-municipio-status",
  templateUrl: "./total-entregas-por-municipio-status.component.html",
  styleUrls: ["./total-entregas-por-municipio-status.component.scss"],
  standalone: true,
  imports: [
    FlipTableComponent
  ],
})
export class TotalEntregasPorMunicipioStatusComponent {
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Valor total das entregas por município e status";
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  selectedMaximize: boolean = false;

  private totalEntregasPorMunicipioStatusResponse: ITotalMunicipioStatus[] = [];

  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);

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
          this.totalEntregasPorMunicipioStatusResponse = response;
          this.assembleFlipTableContent(response);
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

    const groupedData = data.reduce(
      (acc, current) => {
        if (!acc[current.status]) {
          acc[current.status] = [];
        }
        acc[current.status].push(current);
        return acc;
      },
      {} as Record<string, ITotalMunicipioStatus[]>,
    );

    const finalData: Array<TreeNode> = Object.entries(groupedData).map(
      ([status, items]) => {
        const totalPlanejado = items.reduce((sum, i) => sum + i.planejado, 0);
        const totalRealizado = items.reduce((sum, i) => sum + i.realizado, 0);

        const children = items.map((item) => ({
          data: [
            {
              originalPropertyName: "municipio",
              propertyName: "firstColumn",
              value: item.municipio,
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
        displayName: "Status",
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
}
