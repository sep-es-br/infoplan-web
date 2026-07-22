import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { INumeroEntregasPorMunicipioStatus, IPainelObrasRequest } from '../../../../../../core/interfaces/painel-obras/painel-obras';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ChartMaximizeService } from '../../../../../../core/service/chart-maximize/chart-maximize.service';
import { ExportDataService } from '../../../../../../core/service/export-data';
import { PainelObrasService } from '../../../../../../core/service/painel-obras/painel-obras.service';
import { UtilitiesService } from '../../../../../../core/service/utilities.service';
import { FlipTableContent, FlipTableAlignment, TreeNode, FlipTableComponent } from '../../../../../strategic-projects/flip-table-model/flip-table.component';
import { RequestStatus } from '../../../../../strategic-projects/strategicProjects.component';
import { IChartOptions } from '../../../../../../shared/models/budget-panel/IChartOptions';
import { ChartDataConfig } from '../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { OrgChartStackedHorizontalComponent } from '../../../org-chart-stacked-horizontal/org-chart-stacked-horizontal.component';

@Component({
  selector: 'ngx-numero-entregas-por-municipio-status',
  templateUrl: './numero-entregas-por-municipio-status.component.html',
  styleUrls: ['./numero-entregas-por-municipio-status.component.scss'],
  standalone: true,
  imports: [
    FlipTableComponent,
    OrgChartStackedHorizontalComponent,
  ]
})
export class NumeroEntregasPorMunicipioStatusComponent implements OnChanges, OnDestroy, OnInit {
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Número de entregas por município e status";
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  selectedMaximize: boolean = false;


  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "3%",
      right: "5%",
      bottom: "3%",
      containLabel: true,
    },
  };
  chartData!: IChartOptions;
  groupingMode: "STATUS" | "MUNICIPIO" | string = "STATUS";

  private numeroEntregasPorMunicipioStatusResponse: INumeroEntregasPorMunicipioStatus[] = [];

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

    this._painelObrasService.getNumeroEntregasPorMunicipioStatus(this.filter).subscribe({
      next: (response) => {
        this.numeroEntregasPorMunicipioStatusResponse = response;
        this.assembleFlipTableContent(response);
        this.chartData = this.processChartData(response);
        this.requestStatus = response?.length ? RequestStatus.SUCCESS : RequestStatus.EMPTY;
      },
      error(err) {
        console.error(
          "Erro ao carregar os dados das entregas por ano e status:",
          err,
        );
      },
    });
  }


  private processChartData(
    response: INumeroEntregasPorMunicipioStatus[],
  ): IChartOptions {
    if (!response || response.length === 0)
      return { data: { labels: [], datasets: [] } } as IChartOptions;

    // 1. Extrair Municípios únicos (Eixo Y) e Status únicos (Séries)
    const uniqueMunicipios = Array.from(new Set(response.map(item => item.municipio))).sort();
    const uniqueStatuses = Array.from(new Set(response.map(item => item.status))).sort();

    // 2. Criar um dataset para cada Status
    const datasets = uniqueStatuses.map(status => {
      return {
        label: status.toString(), // Converte para string para evitar erro de tipo
        data: uniqueMunicipios.map(municipio => {
          // Procura o valor para este Município e este Status
          const item = response.find(r => r.municipio === municipio && r.status === status);
          return item ? item.quantidadeEntregas : 0;
        })
      };
    });

    return {
      data: {
        labels: uniqueMunicipios,
        datasets: datasets
      },
    };
  }

  handleUserTableSearch(search: string) {
    if (search.length > 0) {
      const preparedSearchTerm = search.toLowerCase();
      const filteredData = this.numeroEntregasPorMunicipioStatusResponse.filter((item) =>
        item.municipio.toLowerCase().includes(preparedSearchTerm) ||
        item.status.toString().toLowerCase().includes(preparedSearchTerm)
      );
      this.assembleFlipTableContent(filteredData);
      this.chartData = this.processChartData(filteredData); // Atualiza o gráfico também
    } else {
      this.assembleFlipTableContent(this.numeroEntregasPorMunicipioStatusResponse);
      this.chartData = this.processChartData(this.numeroEntregasPorMunicipioStatusResponse);
    }
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.numeroEntregasPorMunicipioStatusResponse.filter((item) =>
        item.municipio.toLowerCase().includes(preparedSearchTerm) ||
        item.status.toString().toLowerCase().includes(preparedSearchTerm)
      );

      this.assembleFlipTableContent(filteredItems, true);
    }
  }

  assembleFlipTableContent(
    data: INumeroEntregasPorMunicipioStatus[],
    shouldStartExpanded: boolean = true,
  ): void {
    const standardAlignment = {
      header: FlipTableAlignment.CENTER,
      data: FlipTableAlignment.RIGHT,
    };

    const tableColumns = [
      {
        propertyName: "quantidade_entregas",
        displayName: "Quantidade de Entregas",
        alignment: standardAlignment
      }
    ];

    const groupedData = data.reduce(
      (acc, current) => {
        const key = current.municipio;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(current);
        return acc;
      },
      {} as Record<string, INumeroEntregasPorMunicipioStatus[]>,
    );

    const finalData: Array<TreeNode> = Object.entries(groupedData).map(
      ([municipio, items]) => {
        const totalEntregas = items.reduce((sum, i) => sum + i.quantidadeEntregas, 0);

        const children = items.map((item) => ({
          data: [
            {
              originalPropertyName: "status",
              propertyName: "firstColumn",
              value: item.status,
            },
            {
              propertyName: "quantidade_entregas",
              value: item.quantidadeEntregas,
            },
          ],
          children: [],
          expanded: false,
        }));

        return {
          data: [
            {
              originalPropertyName: "municipio",
              propertyName: "firstColumn",
              value: municipio,
            },
            {
              propertyName: "quantidade_entregas",
              value: totalEntregas,
            },
          ],
          children: children,
          expanded: shouldStartExpanded,
        };
      }
    );

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: "municipio",
        propertyName: "firstColumn",
        displayName: "Município",
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
      { key: "quantidade_entregas", label: "Quantidade de Entregas" },
    ];

    const dataToExport = this.numeroEntregasPorMunicipioStatusResponse.map((item) => ({
      municipio: item.municipio,
      status: item.status,
      quantidade_entregas: item.quantidadeEntregas,
    }));

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "numero_entregas_por_municipio_status.xlsx",
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
