import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { INumeroEntregasPorMunicipioStatus, IPainelObrasRequest, ITotalEntregasPorOrgao, ITotalMunicipioStatus } from '../../../../../../core/interfaces/painel-obras/painel-obras';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { converterToNumber } from '../../../../../../@core/utils/functionts/functionts';
import { ChartMaximizeService } from '../../../../../../core/service/chart-maximize/chart-maximize.service';
import { ExportDataService } from '../../../../../../core/service/export-data';
import { PainelObrasService } from '../../../../../../core/service/painel-obras/painel-obras.service';
import { UtilitiesService } from '../../../../../../core/service/utilities.service';
import { FlipTableContent, FlipTableAlignment, TreeNode, FlipTableComponent } from '../../../../../strategic-projects/flip-table-model/flip-table.component';
import { RequestStatus } from '../../../../../strategic-projects/strategicProjects.component';

@Component({
  selector: 'ngx-numero-entregas-por-municipio-status',
  templateUrl: './numero-entregas-por-municipio-status.component.html',
  styleUrls: ['./numero-entregas-por-municipio-status.component.scss'],
  standalone: true,
  imports: [
    FlipTableComponent
  ]
})
export class NumeroEntregasPorMunicipioStatusComponent implements OnChanges, OnDestroy, OnInit{
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Valor total das entregas por município e status";
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  selectedMaximize: boolean = false;

  private numeroEntregasPorMunicipioStatusResponse: INumeroEntregasPorMunicipioStatus[] = [];

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

    this._painelObrasService.getNumeroEntregasPorMunicipioStatus(this.filter).subscribe({
      next: (response) => {
        this.numeroEntregasPorMunicipioStatusResponse = response;
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
      const filteredData = this.numeroEntregasPorMunicipioStatusResponse.filter((item) =>
        item.municipio.toLowerCase().includes(preparedSearchTerm) ||
        item.status.toString().toLowerCase().includes(preparedSearchTerm)
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(this.numeroEntregasPorMunicipioStatusResponse);
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
    shouldStartExpanded: boolean = false,
  ): void {
    const standardAlignment = {
      header: FlipTableAlignment.CENTER,
      data: FlipTableAlignment.RIGHT,
    };

    const tableColumns = [
      {
        propertyName: "status",
        displayName: "Status",
        alignment: standardAlignment,
      },
      {
        propertyName: "quantidade_entregas",
        displayName: "Quantidade de Entregas",
        alignment: standardAlignment
      }
    ];

    const finalData: Array<TreeNode> = data.map((item) => ({
      data: [
        {
          originalPropertyName: "municipio",
          propertyName: "firstColumn",
          value: item.municipio,
        },
        {
          propertyName: "status",
          value: item.status,
        },
        {
          propertyName: "quantidade_entregas",
          value: item.quantidadeEntregas,
        },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }))

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
