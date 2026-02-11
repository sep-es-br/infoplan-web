import {
  Component,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import {
  ISPOTotalAutorizadoFilter,
  ISPOTotalAutorizadoProgressPo,
} from "../../../../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import { PlanejamentoOrcamentarioService } from "../../../../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
import { ChartDataProcessorService } from "../../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { Subject } from "rxjs";
import { ChartDataConfig } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { ChartProgressBarComponent } from "../chart-progress-bar/chart-progress-bar.component";
import { RequestStatus } from "../../../planejamento-orcamentario.component";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { converterToNumber, replacePorcentage } from "../../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-progress-bar-po",
  templateUrl: "./progress-bar-po.component.html",
  styleUrls: ["./progress-bar-po.component.scss"],
  standalone: true,
  imports: [ChartProgressBarComponent, FlipTableComponent],
})
export class ProgressBarPoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filter: ISPOTotalAutorizadoFilter;

  @HostListener("window:resize")
  onResize() {
    if (this.isChartMaximized("progress-bar-po")) {
      this.maximizedHeight = this._chartMaximizeService.calcMaximizedHeight();
    }
  }

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
  maximizedHeight: number = 500;

  readonly title: string = "Empenhado, Liquidado e Pago sem RAP (% Autorizado)";

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  responseTotalAutorizadoPo: ISPOTotalAutorizadoProgressPo[] = [];

  private readonly _planejamentoOrcamentarioService = inject(
    PlanejamentoOrcamentarioService,
  );
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor() { }

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executarFiltroTabela(query);
      });
    this.maximizedHeight = this._chartMaximizeService.calcMaximizedHeight();
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
      .getTotalAutorizadoPoList(this.filter)
      .subscribe({
        next: (data) => {
          this.responseTotalAutorizadoPo.push(...data);
          if (this.responseTotalAutorizadoPo.length > 0) {
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

  processarDados(dados: ISPOTotalAutorizadoProgressPo[]): void {
    const top5Uo = dados
      .sort((a, b) => b.vlr_previsto - a.vlr_previsto)
      .slice(0, 5)
      .reverse();
    this.chartData = {
      data: {
        labels: top5Uo.map((d) =>
          d.sigla_uo || d.nome_po != null
            ? `${d.sigla_uo} - ${d.nome_po}`
            : "PO não identificado",
        ),
        nomePO: top5Uo.map((d) => d.nome_po || "PO não identificado"),
        nomeUO: top5Uo.map((d) => d.nome_uo || "UO não identificado"),
        tipoTooltip: "PO",
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
    dados: ISPOTotalAutorizadoProgressPo | ISPOTotalAutorizadoProgressPo[],
  ): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];

    const linhasTabela = dadosArray.map((item) => ({
      data: [
        {
          propertyName: "nome",
          value: `${item.sigla_uo} - ${item.nome_po}`,
        },
        {
          propertyName: "Empenhado",
          value: `${item.porcentagem_empenhado} %`,
        },
        {
          propertyName: "Liquidado",
          value: `${item.porcentagem_liquidado} %`,
        },
        {
          propertyName: "Pago",
          value: `${item.porcentagem_pago_sem_rap} %`,
        },
      ],
    }));

    this.tableContent = {
      customColumn: {
        propertyName: "nome",
        displayName: "PO - Unidade Orçamentária",
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

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }

  calcMaximizedHeight(): number {
    return this._chartMaximizeService.calcMaximizedHeight();
  }


  handleTableDownload(): void {
    if (!this.tableContent) return;

    // Definir as colunas baseadas no tableContent atual
    const columns = [
      {
        key: this.tableContent.customColumn.propertyName,
        label: this.tableContent.customColumn.displayName || "PO - Unidade orçamentária",
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

      node.data.forEach((prop: { propertyName: string; value: string | "" }) => {
        const { propertyName, value } = prop;

        const cleanValue = typeof value === 'string' && value.includes('%')
          ? replacePorcentage(value)
          : value;

        row[propertyName] = cleanValue;
      });

      return row;
    });

    const fileName = `Empenhado_Liquidado_E_Pago_Sem_RAP_(% Autorizado)_PO.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
  }

  handleTableSearch(query: string): void {
    this.searchSubject.next(query);
  }

  private buscarEmTexto(
    search: string,
    item: ISPOTotalAutorizadoProgressPo,
  ): boolean {
    return [
      item.nome_uo,
      item.cod_uo,
      item.cod_po,
      item.nome_po?.toString(),
    ].some((campo) => campo?.toLowerCase().includes(search));
  }

  private executarFiltroTabela(query: string): void {
    if (!query || query.length < 3) {
      this.processarDados(this.responseTotalAutorizadoPo);
      return;
    }

    const search = query.toLowerCase().trim();
    const filtered = this.responseTotalAutorizadoPo.filter((item) =>
      this.buscarEmTexto(search, item),
    );

    this.processarDados(filtered);
  }
}
