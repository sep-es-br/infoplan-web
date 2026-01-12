import { RequestStatus } from './../../../../strategic-projects/strategicProjects.component';
import { PlanejamentoOrcamentarioService } from "../../../../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
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
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import {
  ChartDataConfig,
  OrgChartHorizontalComponent,
} from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import {
  ISPODashboardUo,
  ISPOTotalAutorizadoFilter,
} from "../../../../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import { ChartDataProcessorService } from "../../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from "rxjs/operators";

@Component({
  selector: "ngx-dashboard-uo",
  templateUrl: "./dashboard-uo.component.html",
  styleUrls: ["./dashboard-uo.component.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class DashboardUoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filter!: ISPOTotalAutorizadoFilter;

  maximizedHeight: number = 500;

  @HostListener("window:resize")
  onResize() {
    if (this.isChartMaximized("dashboard-po")) {
      this.maximizedHeight = this._chartMaximizeService.calcMaximizedHeight();
    }
  }

  title: string;
  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  dasboardResponse: ISPODashboardUo[] = [];
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    legend: {
      fontSize: 12,
      itemHeight: 13,
      itemWidth: 13,
      itemGap: 20,
    },
    grid: {
      top: "10%",
      left: "0%",
      right: "10%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _planejamentoService = inject(
    PlanejamentoOrcamentarioService
  );
  private readonly _zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Inicializa o ouvinte de busca com debounce
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executarFiltroTabela(query);
      });

    // Calcula altura inicial
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
      this.title = `UO - Unidade Orçamentária • Filtro anual ${this.filter?.ano}`;
    }
  }

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }

  private loadData(): void {
    this.requestStatus = RequestStatus.LOADING;
    this.cdr.markForCheck();

    this._planejamentoService
      .getDashboardUo(this.filter)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: ISPODashboardUo[]) => {
          this.dasboardResponse = res || [];
          if (this.dasboardResponse.length > 0) {
            this.processarDados(this.dasboardResponse);
          } else {
            this.chartData = null;
          }
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar dados UO:", err);
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
    const filtered = this.dasboardResponse.filter(
      (item) =>
        this.buscarEmTexto(search, item)
    );

    this.processarDados(filtered);
  }

  private processarDados(dados: ISPODashboardUo[]): void {
    this._zone.runOutsideAngular(() => {
      // Ordenação e processamento pesado fora da zona
      const top5 = [...dados]
        .sort((a, b) => (b.vlr_previsto || 0) - (a.vlr_previsto || 0))
        .slice(0, 5)
        .reverse();

      const chartConfig: IChartOptions = {
        data: {
          labels: top5.map((d) => `${d.uo} - ${d.nome}`),
          datasets: [
            {
              label: "Planejado",
              data: top5.map((d) => d.vlr_previsto || 0),
              backgroundColor: this._chartProcessor.colors[14],
            },
            {
              label: "Contratado",
              data: top5.map((d) => d.vlr_contratado || 0),
              backgroundColor: this._chartProcessor.colors[15],
            },
            {
              label: "Autorizado",
              data: top5.map((d) => d.vlr_autorizado || 0),
              backgroundColor: this._chartProcessor.colors[16],
            },
          ],
        },
      };

      // Volta para a zona apenas para atualizar a UI
      this._zone.run(() => {
        this.chartData = chartConfig;
        this.processarTabela(dados);
        this.cdr.markForCheck();
      });
    });
  }

  private processarTabela(dados: ISPODashboardUo | ISPODashboardUo[]): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];

    const linhasTabela = dadosArray.map((item) => ({
      data: [
        {
          propertyName: "nome",
          value: `${item.uo} - ${item.nome}`,
        },
        {
          propertyName: "planejado",
          value: this.formatarMoeda(item.vlr_previsto),
        },
        {
          propertyName: "contratado",
          value: this.formatarMoeda(item.vlr_contratado),
        },
        {
          propertyName: "autorizado",
          value: this.formatarMoeda(item.vlr_autorizado),
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
          propertyName: "planejado",
          displayName: "Planejado",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
        {
          propertyName: "contratado",
          displayName: "Contratado",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
        {
          propertyName: "autorizado",
          displayName: "Autorizado",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
      ],
      data: linhasTabela,
    };
  }

  private formatarMoeda(valor: number | null | undefined): string {
    if (!valor && valor !== 0) return "R$ 0,00";

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  handleTableSearch(query: string): void {
    this.searchSubject.next(query);
  }

  private buscarEmTexto(search: string, item: ISPODashboardUo): boolean {
    return [item.nome, item.uo, item.sigla?.toString()].some((campo) =>
      campo?.toLowerCase().includes(search)
    );
  }

  handleTableDownload(): void {
    const columns: Array<{ key: string; label: string }> = [
      { key: "nome", label: this.tableContent.customColumn.displayName },
      ...this.tableContent.defaultColumns.map((col) => ({
        key: col.propertyName,
        label: col.displayName,
      })),
    ];

    const dataForDownload = this.tableContent.data.map((node) => {
      const row: any = {};

      node.data.forEach((item) => {
        // Formata valores monetários (previsto, contratado, autorizado)
        if (
          ["planejado", "contratado", "autorizado"].includes(item.propertyName)
        ) {
          // Remove "R$" e pega apenas o valor numérico
          const valorNumerico = this.extrairValorNumerico(item.value);
          row[item.propertyName] = valorNumerico.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } else {
          row[item.propertyName] = item.value;
        }
      });

      return row;
    });

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `UO - Unidade Orçamentária.xlsx`
    );
  }

  private extrairValorNumerico(valorFormatado: string): number {
    if (!valorFormatado) return 0;

    const valorLimpo = valorFormatado
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    return parseFloat(valorLimpo) || 0;
  }
}
