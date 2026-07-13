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
  IQuantidadeMaiorEntregaPrevista,
} from "../../../../../../core/interfaces/painel-obras/painel-obras";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { ChartDataProcessorService } from "../../../../../../core/service/budget-panel/chart-data-processor.service";
import { ChartMaximizeService } from "../../../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../../../core/service/export-data";
import { PainelObrasService } from "../../../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../../../core/service/utilities.service";
import { IChartOptions } from "../../../../../../shared/models/budget-panel/IChartOptions";
import {
  ChartDataConfig,
  OrgChartHorizontalComponent,
} from "../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../../../strategic-projects/flip-table-model/flip-table.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";

@Component({
  selector: "ngx-quantidade-maior-prevista",
  templateUrl: "./quantidade-maior-prevista.component.html",
  styleUrls: ["./quantidade-maior-prevista.component.scss"],
  standalone: true,
  imports: [FlipTableComponent, OrgChartHorizontalComponent],
})
export class QuantidadeMaiorPrevistaComponent
  implements OnInit, OnDestroy, OnChanges {
  @Input() filter!: IPainelObrasRequest;

  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string =
    "Maiores Entregas Previstas por Órgão (2026)";
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

  private quantidadeMaiorPorOrgao: IQuantidadeMaiorEntregaPrevista[] = [];

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

    this._painelObrasService
      .getQuantidadeMaiorEntregaPrevista(this.filter)
      .subscribe({
        next: (response) => {
        this.requestStatus = RequestStatus.SUCCESS;
        if (response && response.length > 0) {
          this.quantidadeMaiorPorOrgao = response;
          this.assembleFlipTableContent(response);
          this.processData(response);
        } else {
          this.requestStatus = RequestStatus.EMPTY;
          this.quantidadeMaiorPorOrgao = [];
          this.assembleFlipTableContent([]);
           this.processData([]);
        }
        },
        error(err) {
          console.error(
            "Erro ao carregar os dados das quantidade de entregras prevista por órgão: ",
            err,
          );
        },
      });
  }

  processData(response: IQuantidadeMaiorEntregaPrevista[]): IChartOptions {
    if (!response || response.length === 0)
      return { data: { labels: [], datasets: [] } } as IChartOptions;

    const top10 = [...response]
      .sort((a, b) => b.totalMaiorOrgao - a.totalMaiorOrgao)
      .slice(0, 10);

    const labels = top10.map((item) => item.orgao);
    const primary = top10.map((item) => item.totalMaiorOrgao);
    const secondary = top10.map((item) => item.planejado);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Órgão com maior valor",
            data: primary,
            backgroundColor: this._chartProcessor.colors[0],
          },
          {
            label: "planejado",
            data: secondary,
            backgroundColor: this._chartProcessor.colors[1],
          }
        ],
      },
    } as IChartOptions;
  }

  assembleFlipTableContent(
    data: IQuantidadeMaiorEntregaPrevista[],
    shouldStartExpanded: boolean = true,
  ): void {
    const standardAlignment = {
      header: FlipTableAlignment.CENTER,
      data: FlipTableAlignment.RIGHT,
    };

    const tableColumns = [
      {
        propertyName: "planejado",
        displayName: "Valor total Planejado",
        alignment: standardAlignment,
      },
      {
        propertyName: "quantidade_entregas",
        displayName: "Quantidade de Entregas",
        alignment: standardAlignment,
      },
      {
        propertyName: "entrega_maior_valor",
        displayName: "Entrega de Maior Valor",
        alignment: standardAlignment,
      },
      {
        propertyName: "municipio",
        displayName: "Município",
        alignment: standardAlignment,
      },
      {
        propertyName: "data_conclusao",
        displayName: "data",
        alignment: standardAlignment,
      },
      {
        propertyName: "maior_valor_orgao",
        displayName: "Maior valor òrgão",
        alignment: standardAlignment,
      },
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
          propertyName: "quantidade_entregas",
          value: item.quantidadeEntregas,
        },
        {
          propertyName: "entrega_maior_valor",
          value: item.nomeMaiorEntrega,
        },
        {
          propertyName: "municipio",
          value: item.municipio,
        },
        {
          propertyName: "data_conclusao",
          value: item.dataConclusao,
        },

        {
          propertyName: "maior_valor_orgao",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.totalMaiorOrgao,
            "R$",
          ),
        },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }));

    this.flipTableContent = {
      defaultColumns: tableColumns as FlipTableColumn[],
      customColumn: {
        originalPropertyName: "orgao",
        propertyName: "firstColumn",
        displayName: "Òrgão",
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
      const filteredData = this.quantidadeMaiorPorOrgao.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.orgao.toString().toLowerCase().includes(preparedSearchTerm),
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(this.quantidadeMaiorPorOrgao);
    }
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.quantidadeMaiorPorOrgao.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.orgao.toString().toLowerCase().includes(preparedSearchTerm),
      );

      this.assembleFlipTableContent(filteredItems, true);
    }
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

  handleTableDownload() {
    const columns: Array<{ key: string; label: string }> = [
      {
        key: "orgao",
        label: "Òrgão",
      },
      {
        key: "planejado",
        label: "Planejado",
      },
      {
        key: "quantidade_entregas",
        label: "Quantidade de Entregas",
      },
      {
        key: "entrega_maior_valor",
        label: "Entrega de maior valor",
      },
      {
        key: "municipio",
        label: "Município",
      },
      {
        key: "data_conclusao",
        label: "Data",
      },
      {
        key: "maior_valor_orgao",
        label: "Maior valor por órgão",
      },
    ];

    const dataToExport = this.quantidadeMaiorPorOrgao.map((item) => ({
      orgao: item.orgao,
      planejado: item.planejado,
      quantidade_entregas: item.quantidadeEntregas,
      entrega_maior_valor: item.nomeMaiorEntrega,
      municipio: item.municipio,
      data_conclusao: item.dataConclusao,
      maior_valor_orgao: item.totalMaiorOrgao,
    }));

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "Quantidade_Maior_Entrega_Por_Òrgão.xlsx",
    );
  }
}
