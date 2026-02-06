import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { ChartProgressBarComponent } from "../chart-progress-bar/chart-progress-bar.component";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import {
  ISPOTotalAutorizadoFilter,
  ISPOTotalAutorizadoProgressUo,
} from "../../../../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";
import { ChartDataProcessorService } from "../../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import { PlanejamentoOrcamentarioService } from "../../../../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
import { ChartDataConfig } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../planejamento-orcamentario.component";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { replacePorcentage } from "../../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-progress-bar-uo",
  templateUrl: "./progress-bar-uo.component.html",
  styleUrls: ["./progress-bar-uo.component.scss"],
  standalone: true,
  imports: [ChartProgressBarComponent, FlipTableComponent],
})
export class ProgressBarUoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filter: ISPOTotalAutorizadoFilter;

  readonly title: string = "Empenhado, Liquidado e Pago sem RAP (% Autorizado)";

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  responseTotalAutorizadoUo: ISPOTotalAutorizadoProgressUo[] = [];
  private readonly _planejamentoOrcamentarioService = inject(
    PlanejamentoOrcamentarioService,
  );
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  chartDataConfig: ChartDataConfig = {
    legend: {
      itemWidth: 13,
      itemHeight: 13,
      itemGap: 20,
      fontSize: 10,
    },
    grid: {
      top: "10%",
      left: "3%",
      right: "3%",
      bottom: "0%",
      containLabel: true,
    },
  };

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executarFiltroTabela(query);
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
    this._planejamentoOrcamentarioService
      .getTotalAutorizadoUoList(this.filter)
      .subscribe({
        next: (data) => {
          this.responseTotalAutorizadoUo.push(...data);
          if (this.responseTotalAutorizadoUo.length > 0) {
            this.processarDados(data);
          }
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (error) => {
          this.requestStatus = RequestStatus.ERROR;
          console.error("Error loading data:", error);
        },
      });
  }

  handleTableSearch(query: string): void {
    this.searchSubject.next(query);
  }

  private buscarEmTexto(
    search: string,
    item: ISPOTotalAutorizadoProgressUo,
  ): boolean {
    return [item.nome_uo, item.cod, item.sigla?.toString()].some((campo) =>
      campo?.toLowerCase().includes(search),
    );
  }

  private executarFiltroTabela(query: string): void {
    if (!query || query.length < 3) {
      this.processarDados(this.responseTotalAutorizadoUo);
      return;
    }

    const search = query.toLowerCase().trim();
    const filtered = this.responseTotalAutorizadoUo.filter((item) =>
      this.buscarEmTexto(search, item),
    );

    this.processarDados(filtered);
  }

  processarDados(dados: ISPOTotalAutorizadoProgressUo[]): void {
    const top5Uo = dados
      .sort((a, b) => (b.vlr_previsto || 0) - (a.vlr_previsto || 0))
      .slice(0, 5)
      .reverse();
    this.chartData = {
      data: {
        labels: top5Uo.map((d) =>
          d.cod || d.sigla != null
            ? `${d.cod} - ${d.sigla}`
            : "Valor indefinido",
        ),
        nomeUO: top5Uo.map((d) => d.nome_uo || "Nome não disponível"),
        tipoTooltip: "UO",
        datasets: [
          {
            label: "Empenhado (% Autorizado)",
            data: top5Uo.map((d) => d.porcentagem_empenhado),
            backgroundColor: "#1bbc9c",
          },
          {
            label: "Liquidado (% Autorizado)",
            data: top5Uo.map((d) => d.porcentagem_liquidado),
            backgroundColor: "#d9ac22",
          },
          {
            label: "Pago (% Autorizado)",
            data: top5Uo.map((d) => d.porcentagem_pago_sem_rap),
            backgroundColor: "#F77D00",
          },
        ],
      },
    };
    this.processarTabela(dados);
  }

  private processarTabela(
    dados: ISPOTotalAutorizadoProgressUo | ISPOTotalAutorizadoProgressUo[],
  ): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];

    const linhasTabela = dadosArray.map((item) => ({
      data: [
        {
          propertyName: "nome",
          value: `${item.cod} - ${item.nome_uo}`,
        },
        {
          propertyName: "Empenhado",
          value: `${item.porcentagem_empenhado}%`,
        },
        {
          propertyName: "Liquidado",
          value: `${item.porcentagem_liquidado}%`,
        },
        {
          propertyName: "Pago",
          value: `${item.porcentagem_pago_sem_rap}%`,
        },
      ],
    }));

    this.tableContent = {
      customColumn: {
        propertyName: "nome",
        displayName: "UO - Unidade Orçamentária",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: [
        {
          propertyName: "Empenhado",
          displayName: "Empenhado",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
        {
          propertyName: "Liquidado",
          displayName: "Liquidado",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
        {
          propertyName: "Pago",
          displayName: "Pago",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
      ],
      data: linhasTabela,
    };
  }

  handleTableDownload(): void {
    if (!this.tableContent) return;

    const columns = [
      {
        key: this.tableContent.customColumn.propertyName,
        label:
          this.tableContent.customColumn.displayName ||
          "UO - Unidade orçamentária",
      },
    ];

    this.tableContent.defaultColumns.forEach((col) => {
      columns.push({
        key: col.propertyName,
        label: col.displayName,
      });
    });


    const dataForDownload = this.tableContent.data.map((node: TreeNode) => {
      const row: any = {};

      node.data.forEach(
        (prop: { propertyName: string; value: string | "" }) => {
          const { propertyName, value } = prop;

          const cleanValue =
            typeof value === "string" && value.includes("%")
              ? replacePorcentage(value)
              : value;

          row[propertyName] = cleanValue;
        },
      );

      return row;
    });

    const fileName = `Empenhado_Liquidado_E_Pago_Sem_RAP_(% Autorizado)_OU.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
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
}
