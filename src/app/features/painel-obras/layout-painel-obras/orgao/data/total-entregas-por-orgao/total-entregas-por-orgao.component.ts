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
  IPainelObrasRequest,
  ITotalEntregasPorOrgao,
} from "../../../../../../core/interfaces/painel-obras/painel-obras";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../../../strategic-projects/flip-table-model/flip-table.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";
import { Subject } from "rxjs-compat";
import { ChartMaximizeService } from "../../../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../../../core/service/export-data";
import { PainelObrasService } from "../../../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../../../core/service/utilities.service";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { converterToNumber } from "../../../../../../@core/utils/functionts/functionts";
import { OrgChartVerticalComponent } from "../../../../../budget-panel/org-chart-bar/org-chart-vertical/org-chart-vertical.component";
import { ChartDataProcessorService } from "../../../../../../core/service/budget-panel/chart-data-processor.service";
import { IChartOptions } from "../../../../../../shared/models/budget-panel/IChartOptions";
import { ChartDataConfig, OrgChartHorizontalComponent } from "../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";

@Component({
  selector: "ngx-total-entregas-por-orgao",
  templateUrl: "./total-entregas-por-orgao.component.html",
  styleUrls: ["./total-entregas-por-orgao.component.scss"],
  standalone: true,
  imports: [
    FlipTableComponent,
    OrgChartVerticalComponent,
    OrgChartHorizontalComponent
  ],
})
export class TotalEntregasPorOrgaoComponent implements OnChanges, OnDestroy, OnInit {
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Valor total das entregas por órgão";
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
  private totalEntregasPorOrgaoResponse: ITotalEntregasPorOrgao[] = [];

  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);

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

    this._painelObrasService.getTotalEntregasPorOrgao(this.filter).subscribe({
      next: (response) => {
        this.totalEntregasPorOrgaoResponse = response;
        this.assembleFlipTableContent(response);
        this.processChart(response)
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
      const filteredData = this.totalEntregasPorOrgaoResponse.filter((item) =>
        item.orgao.toLowerCase().includes(preparedSearchTerm) ||
        item.quantidadeEntregas.toString().toLowerCase().includes(preparedSearchTerm)
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(this.totalEntregasPorOrgaoResponse);
    }
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.totalEntregasPorOrgaoResponse.filter((item) =>
        item.orgao.toLowerCase().includes(preparedSearchTerm),
      );

      this.assembleFlipTableContent(filteredItems, true);
    }
  }

  assembleFlipTableContent(
    data: ITotalEntregasPorOrgao[],
    shouldStartExpanded: boolean = false,
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
        alignment: standardAlignment
      }
    ];

    const finalData: Array<TreeNode> = data.map((item) => ({
      data: [
        {
          originalPropertyName: "orgao",
          propertyName: "firstColumn",
          value: item.orgao,
        },
        {
          propertyName: "planejado",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.planejado,
            "R$",
          ),
        },
        {
          propertyName: "realizado",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.realizado,
            "R$",
          ),
        },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }))

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: "orgao",
        propertyName: "firstColumn",
        displayName: "Órgão",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.LEFT,
        },
      },
      data: finalData,
    };
  }

  processChart(data: ITotalEntregasPorOrgao[]): void {
    const { labels, planejados, realizados } = data.reduce(
      (acc, item) => {
        acc.labels.push(item.orgao);
        acc.planejados.push(item.planejado);
        acc.realizados.push(item.realizado);
        return acc;
      },
      { labels: [] as string[], planejados: [] as number[], realizados: [] as number[] }
    );

    const [corPlanejado, corRealizado] = this._chartProcessor.colors;

    this.chartData = {
      data: {
        labels,
        datasets: [
          {
            label: 'Planejado',
            data: planejados,
            backgroundColor: corPlanejado,
          },
          {
            label: 'Realizado',
            data: realizados,
            backgroundColor: corRealizado,
          },
        ],
      },
    };
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string }> = [
      { key: "orgao", label: "Órgão" },
      { key: "planejado", label: "Planejado" },
      { key: "realizado", label: "Realizado" },
    ];

    const dataToExport = this.totalEntregasPorOrgaoResponse.map((item) => ({
      orgao: item.orgao,
      quantidadeEntregas: converterToNumber(String(item.quantidadeEntregas)),
      planejado: converterToNumber(String(item.planejado)),
      realizado: converterToNumber(String(item.realizado)),
    }));

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "total_entregas_por_orgao.xlsx",
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
