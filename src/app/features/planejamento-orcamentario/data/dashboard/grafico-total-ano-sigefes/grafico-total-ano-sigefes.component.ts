import {
  ISPOTotalAnoSigefes,
  ISPOTotalAutorizadoFilter,
} from "./../../../../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { ExportDataService } from "../../../../../core/service/export-data";
import { ChartDataProcessorService } from "../../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { PlanejamentoOrcamentarioService } from "../../../../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import { ChartDataConfig } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { OrgChartVerticalComponent } from "../../../../painel-orcamento/org-chart-bar/org-chart-vertical/org-chart-vertical.component";
import { RequestStatus } from "../../../planejamento-orcamentario.component";
import { UtilitiesService } from "../../../../../core/service/utilities.service";
import { converterToNumber } from "../../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-grafico-total-ano-sigefes",
  templateUrl: "./grafico-total-ano-sigefes.component.html",
  styleUrls: ["./grafico-total-ano-sigefes.component.scss"],
  standalone: true,
  imports: [OrgChartVerticalComponent, FlipTableComponent],
})
export class GraficoTotalAnoSigefesComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() filter!: ISPOTotalAutorizadoFilter;

  maximizedHeight: number = 500;

  @HostListener("window:resize")
  onResize() {
    if (this.isChartMaximized("grafico-total-ano")) {
      this.maximizedHeight = this._chartMaximizeService.calcMaximizedHeight();
    }
  }

  readonly title: string = "Evolução dos Valores por Ano";
  subTitulo: string = "";
  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  dasboardResponse: ISPOTotalAnoSigefes[] = [];
  chartDataConfig: ChartDataConfig = {
    legend: {
      fontSize: 12,
      itemHeight: 13,
      itemWidth: 13,
      itemGap: 20,
    },
    grid: {
      top: "10%",
      left: "2%",
      right: "2%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _planejamentoService = inject(
    PlanejamentoOrcamentarioService,
  );
  private readonly _utilitiesService = inject(UtilitiesService);

  private readonly destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly _zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executarFiltroTabela(query);
      });

    this.maximizedHeight = this._chartMaximizeService.calcMaximizedHeight();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["filter"] &&
      JSON.stringify(changes["filter"].previousValue) !==
        JSON.stringify(changes["filter"].currentValue)
    ) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.requestStatus = RequestStatus.LOADING;
    this.cdr.markForCheck();

    this._planejamentoService
      .getTotalAnoSigefes(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ISPOTotalAnoSigefes[]) => {
          this.dasboardResponse = res || [];
          if (this.dasboardResponse.length > 0) {
            this.processarDados(this.dasboardResponse);
          } else {
            this.chartData = null;
          }
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar dados Total Ano:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dasboardResponse = [];
        },
      });
  }

  private executarFiltroTabela(query: string): void {
    if (!query || query.length < 3) {
      this.processarDados(this.dasboardResponse);
      return;
    }

    const search = query.toLowerCase().trim();
    const filtered = this.dasboardResponse.filter((item) =>
      this.buscarEmTexto(search, item),
    );

    this.processarDados(filtered);
  }

  private processarDados(dados: ISPOTotalAnoSigefes[]): void {
    this._zone.runOutsideAngular(() => {

      const chartConfig: IChartOptions = {
        data: {
          labels: dados.map((d) => `${d.ano}`),

          datasets: [
            {
              label: "Pago",
              data: dados.map((d) => d.vlr_pago_sem_rap || 0),
              backgroundColor: this._chartProcessor.colors[20],
            },
            {
              label: "Pago com RAP",
              data: dados.map((d) => d.vlr_pago_com_rap || 0),
              backgroundColor: this._chartProcessor.colors[19],
            },
          ],
        },
      };
      this._zone.run(() => {
        this.chartData = chartConfig;
        this.processarTabela(dados);
        this.cdr.markForCheck();
      });
    });
  }

  private processarTabela(
    dados: ISPOTotalAnoSigefes | ISPOTotalAnoSigefes[],
  ): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];

    const linhasTabela = dadosArray.map((item) => ({
      data: [
        {
          propertyName: "ano",
          value: `${item.ano}`,
        },
        {
          propertyName: "pago",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.vlr_pago_sem_rap,
            "R$",
          ),
        },
        {
          propertyName: "pago_com_rap",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            item.vlr_pago_com_rap,
            "R$",
          ),
        },
      ],
    }));

    this.tableContent = {
      customColumn: {
        propertyName: "ano",
        displayName: "Ano",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: [
        {
          propertyName: "pago_com_rap",
          displayName: "Pago com RAP (R$)",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
        {
          propertyName: "pago",
          displayName: "Pago (R$)",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
      ],
      data: linhasTabela,
    };
  }

  handleTableSearch(query: string): void {
    this.searchSubject.next(query);
  }

  private buscarEmTexto(search: string, item: ISPOTotalAnoSigefes): boolean {
    return [item.ano?.toString()].some((campo) =>
      campo?.toLowerCase().includes(search),
    );
  }

  handleTableDownload(): void {
    const columns: Array<{ key: string; label: string }> = [
      { key: "ano", label: this.tableContent.customColumn.displayName },
      ...this.tableContent.defaultColumns.map((col) => ({
        key: col.propertyName,
        label: col.displayName,
      })),
    ];

    const dataForDownload = this.tableContent.data.map((node) => {
      const row: any = {};

      node.data.forEach((item) => {
        if (["pago", "pago_com_rap"].includes(item.propertyName)) {
          row[item.propertyName] = converterToNumber(item.value);
        } else {
          row[item.propertyName] = item.value;
        }
      });

      return row;
    });

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Evolução_dos_Valores_por_Ano_Sigefes.xlsx`,
    );
  }

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }
}
