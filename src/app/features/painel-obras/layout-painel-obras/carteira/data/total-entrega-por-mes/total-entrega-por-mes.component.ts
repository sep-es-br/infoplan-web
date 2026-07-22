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
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import {
  IPainelObrasRequest,
  INumeroEntregasPorMunicipioStatus,
  ITotalEntregaPorMes,
} from "../../../../../../core/interfaces/painel-obras/painel-obras";
import { ChartMaximizeService } from "../../../../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../../../../core/service/export-data";
import { PainelObrasService } from "../../../../../../core/service/painel-obras/painel-obras.service";
import { UtilitiesService } from "../../../../../../core/service/utilities.service";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../../../strategic-projects/flip-table-model/flip-table.component";
import { RequestStatus } from "../../../../../strategic-projects/strategicProjects.component";
import { IChartOptions } from "../../../../../../shared/models/budget-panel/IChartOptions";
import { ChartDataConfig } from "../../../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { ChartDataProcessorService } from "../../../../../../core/service/budget-panel/chart-data-processor.service";
import { OrgChartVerticalComponent } from "../../../../../budget-panel/org-chart-bar/org-chart-vertical/org-chart-vertical.component";

@Component({
  selector: "ngx-total-entrega-por-mes",
  templateUrl: "./total-entrega-por-mes.component.html",
  styleUrls: ["./total-entrega-por-mes.component.scss"],
  standalone: true,
  imports: [FlipTableComponent, OrgChartVerticalComponent],
})
export class TotalEntregaPorMesComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() filter!: IPainelObrasRequest;
  @Output() maximizeButtonClick = new EventEmitter<boolean>();

  readonly title: string = "Entregas Concluídas por Mês (2026)";
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  selectedMaximize: boolean = false;

  chartData: IChartOptions = {} as IChartOptions;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private totalEntregasPorMes: ITotalEntregaPorMes[] = [];

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

    this._painelObrasService.getTotalEntregaPorMes(this.filter).subscribe({
      next: (response) => {
        this.totalEntregasPorMes = response || [];
        if (this.totalEntregasPorMes.length > 0) {
          this.assembleFlipTableContent(this.totalEntregasPorMes);
          this.chartData = this.processData(this.totalEntregasPorMes);
        } else {
          this.assembleFlipTableContent([]);
          this.chartData = this.processData([]);
        }
        this.requestStatus = response?.length ? RequestStatus.SUCCESS : RequestStatus.EMPTY;
      },
      error(err) {
        console.error("Erro ao carregar os dados das entregas por mês: ", err);
      },
    });
  }

  private processData(dados: ITotalEntregaPorMes[] | []): IChartOptions {
    if (!dados || dados.length === 0) {
      return {
        data: {
          labels: ["Sem Registros"],
          datasets: [
            {
              label: "Previsto (Total)",
              data: [0],
              backgroundColor: this._chartProcessor.colors[0],
            },
          ],
        },
      };
    }
    return {
      data: {
        labels: dados.map((res) => res.mesNome),
        datasets: [
          {
            label: "Previsto (Total)",
            data: dados.map((res) => res.planejado),
            backgroundColor: this._chartProcessor.colors[0],
          },
        ],
      },
    };
  }

  assembleFlipTableContent(
    data: ITotalEntregaPorMes[],
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
        displayName: "Quantidade de entregas",
        alignment: standardAlignment,
      },
      {
        propertyName: "entrega_maior_valor",
        displayName: "Entrega de maior valor",
        alignment: standardAlignment,
      },
      {
        propertyName: "municipio",
        displayName: "Município",
        alignment: standardAlignment,
      },
      {
        propertyName: "valor_medio_por_acao",
        displayName: "Valor médio por ação",
        alignment: standardAlignment,
      },
      {
        propertyName: "data_conclusao",
        displayName: "Data",
        alignment: standardAlignment,
      },
      {
        propertyName: "maior_valor_mes",
        displayName: "Maior valor no mês",
        alignment: standardAlignment,
      },
    ];

    // const sorted = [...data].sort(
    //   (a, b) => (b.maiorValorNoMes ?? 0) - (a.maiorValorNoMes ?? 0),
    // );

    const finalData: Array<TreeNode> = data.map((item) => ({
      data: [
        {
          originalPropertyName: "mes",
          propertyName: "firstColumn",
          value: item.mesNome,
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
          value: item.entregaNome,
        },
        {
          propertyName: "municipio",
          value: item.municipio,
        },
        {
          propertyName: "valor_medio_por_acao",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.valorMedioPorAcao,
            "R$",
          ),
        },
        {
          propertyName: "data_conclusao",
          value: item.dataConclusaoMaiorEntrega,
        },
        {
          propertyName: "maior_valor_mes",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.maiorValorNoMes,
            "R$",
          ),
        },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }));

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: "municipio",
        propertyName: "firstColumn",
        displayName: "Mês",
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
      const filteredData = this.totalEntregasPorMes.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.mesNome.toString().toLowerCase().includes(preparedSearchTerm),
      );
      this.assembleFlipTableContent(filteredData);
    } else {
      this.assembleFlipTableContent(this.totalEntregasPorMes);
    }
  }

  private executeSearch(search: string) {
    if (!search || search.length > 0) {
      const preparedSearchTerm = search.toLowerCase().trim();
      const filteredItems = this.totalEntregasPorMes.filter(
        (item) =>
          item.municipio.toLowerCase().includes(preparedSearchTerm) ||
          item.mesNome.toString().toLowerCase().includes(preparedSearchTerm),
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
        key: "mes",
        label: "Mês",
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
        key: "valor_medio_por_acao",
        label: "Valor médio por ação",
      },
      {
        key: "data_conclusao",
        label: "Data",
      },
      {
        key: "maior_valor_mes",
        label: "Maior valor no mês",
      },
    ];

    const dataToExport = this.totalEntregasPorMes.map((item) => ({
      mes: item.mesNome,
      planejado: item.planejado,
      quantidade_entregas: item.quantidadeEntregas,
      entrega_maior_valor: item.entregaNome,
      municipio: item.municipio,
      valor_medio_por_acao: item.valorMedioPorAcao,
      data_conclusao: item.dataConclusaoMaiorEntrega,
      maior_valor_mes: item.maiorValorNoMes,
    }));

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataToExport,
      columns,
      "Total_Entregas_Por_Mes.xlsx",
    );
  }
}
