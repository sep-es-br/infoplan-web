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
  IQuantidadeMaiorEntrega,
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
  FlipTableContent,
  FlipTableAlignment,
  TreeNode,
  FlipTableColumn,
  FlipTableComponent,
} from "../../../../../strategic-projects/flip-table-model/flip-table.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";

@Component({
  selector: "ngx-quantidade-maior-entrega",
  templateUrl: "./quantidade-maior-entrega.component.html",
  styleUrls: ["./quantidade-maior-entrega.component.scss"],
  standalone: true,
  imports: [FlipTableComponent, OrgChartHorizontalComponent],
})
export class QuantidadeMaiorEntregaComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() filter!: IPainelObrasRequest;

  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string =
    "Maiores Entregas por Município (2026)";
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  selectedMaximize: boolean = false;

  chartData: IChartOptions = {} as IChartOptions;;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "3%",
      right: "5%",
      bottom: "3%",
      containLabel: true,
    },
  };
  private quantidadeMaiorPorMunicipio: IQuantidadeMaiorEntrega[] = [];

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

    this._painelObrasService.getQuantidadeMaiorEntrega(this.filter).subscribe({
      next: (response) => {
        this.quantidadeMaiorPorMunicipio = response || [];

        if (this.quantidadeMaiorPorMunicipio.length > 0) {
          this.assembleFlipTableContent(this.quantidadeMaiorPorMunicipio);
          this.chartData = this.processData(this.quantidadeMaiorPorMunicipio);
        } else {
          this.assembleFlipTableContent([]);
          this.chartData = this.processData([]);
        }
        this.requestStatus = RequestStatus.SUCCESS;
      },
      error: (err) => {
        console.error(
          "Erro ao carregar os dados das quantidade de entregas prevista por órgão: ",
          err,
        );
        this.requestStatus = RequestStatus.ERROR;
      },
    });
  }

  processData(response: IQuantidadeMaiorEntrega[] | []): IChartOptions {
    if (!response || response.length === 0) {
      return {
        data: {
          labels: ["Sem Registros"],
          datasets: [
            {
              label: "Município com maior valor",
              data: [0],
              backgroundColor: this._chartProcessor.colors[0],
            },
            {
              label: "Planejado",
              data: [0],
              backgroundColor: this._chartProcessor.colors[1],
            },
          ],
        },
      } as IChartOptions;
    }

    const top10 = [...response]
      .sort((a, b) => b.totalMaiorMunicipio - a.totalMaiorMunicipio)
      .slice(0, 10);

    const labels = top10.map((item) => item.orgao);
    const primary = top10.map((item) => item.totalMaiorMunicipio);
    const secondary = top10.map((item) => item.planejado);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Município com maior valor",
            data: primary,
            backgroundColor: this._chartProcessor.colors[0],
          },
          {
            label: "Planejado",
            data: secondary,
            backgroundColor: this._chartProcessor.colors[1],
          },
        ],
      },
    } as IChartOptions;
  }

  assembleFlipTableContent(
    data: IQuantidadeMaiorEntrega[],
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
        propertyName: "orgao",
        displayName: "Órgão",
        alignment: standardAlignment,
      },
      {
        propertyName: "data_conclusao",
        displayName: "data",
        alignment: standardAlignment,
      },
      {
        propertyName: "maior_valor_municipio",
        displayName: "Maior valor município",
        alignment: standardAlignment,
      },
    ];

    const finalData: Array<TreeNode> = data.map((item) => ({
      data: [
        {
          originalPropertyName: "municipio",
          propertyName: "firstColumn",
          value: item.municipio,
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
          value: item.quantidadeEntrega,
        },
        {
          propertyName: "entrega_maior_valor",
          value: item.nomeMaiorEntrega,
        },
        {
          propertyName: "orgao",
          value: item.orgao,
        },
        {
          propertyName: "data_conclusao",
          value: item.dataConclusao,
        },

        {
          propertyName: "maior_valor_municipio",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.totalMaiorMunicipio,
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

  handleUserTableSearch(search: string) {
    if (search.length > 0) {
      const preparedSearchTerm = search.toLowerCase();
      const filteredData = this.quantidadeMaiorPorMunicipio.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.orgao.toString().toLowerCase().includes(preparedSearchTerm),
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(this.quantidadeMaiorPorMunicipio);
    }
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.quantidadeMaiorPorMunicipio.filter(
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
        key: "municipio",
        label: "Município",
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
        key: "orgao",
        label: "Órgão",
      },
      {
        key: "data_conclusao",
        label: "Data",
      },
      {
        key: "maior_valor_municipio",
        label: "Maior valor por município",
      },
    ];

    const dataToExport = this.quantidadeMaiorPorMunicipio.map((item) => ({
      municipio: item.municipio,
      planejado: item.planejado,
      quantidade_entregas: item.quantidadeEntrega,
      entrega_maior_valor: item.nomeMaiorEntrega,
      orgao: item.orgao,
      data_conclusao: item.dataConclusao,
      maior_valor_municipio: item.totalMaiorMunicipio,
    }));

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "Quantidade_Maior_Entrega_Por_Município.xlsx",
    );
  }
}
