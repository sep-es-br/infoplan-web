import { PlanejamentoOrcamentarioService } from "./../../../../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  FlipTableAlignment,
  FlipTableComponent,
  FlipTableContent,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import { OrgChartHorizontalComponent } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import {
  ISPODashboardUo,
  ISPOTotalAutorizadoFilter,
  ISPOTotalPrevistoFilter,
} from "../../../../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import { ChartDataProcessorService } from "../../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
  selector: "ngx-dashboard-uo",
  templateUrl: "./dashboard-uo.component.html",
  styleUrls: ["./dashboard-uo.component.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class DashboardUoComponent implements OnChanges, OnDestroy {
  @Input() filter!: ISPOTotalAutorizadoFilter;

  readonly title: string = "UOS - Unidades Orçamentárias";
  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  loadingStatus: "loading" | "loaded" | "error" = "loading";
  dasboardResponse: ISPODashboardUo[] = [];

  private readonly _chartProcessor: ChartDataProcessorService = inject(
    ChartDataProcessorService
  );
  private readonly _exportDataService: ExportDataService =
    inject(ExportDataService);
  private readonly _chartMaximizeService: ChartMaximizeService =
    inject(ChartMaximizeService);
  private readonly _planejamentoService: PlanejamentoOrcamentarioService =
    inject(PlanejamentoOrcamentarioService);
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"].currentValue) {
      this.loadData();
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

  private loadData(): void {
    this.loadingStatus = "loading";
    this._planejamentoService
      .getDashboardUo(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.dasboardResponse ? "loaded" : "error";
        })
      )
      .subscribe({
        next: (res: ISPODashboardUo[]) => {
          this.dasboardResponse = res;
          if (res && res.length > 0) {
            this.processarDados(res);
          } else {
            this.chartData = null; // ou inicialize vazio
          }
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
          this.loadingStatus = "error";
          this.dasboardResponse = null;
        },
      });
  }

  private processarDados(dados: ISPODashboardUo[]): void {
    const top5 = dados
      .sort((a, b) => b.vlr_previsto - a.vlr_previsto)
      .slice(0, 5)
      .reverse();

      console.log("ORDEM - : ", top5)
      console.log("DADOS VINDO : ", dados)
    this.chartData = {
      data: {
        labels: top5.map((d) => `${d.uo} - ${d.nome}`),
        datasets: [
          {
            label: "Previsto",
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

    this.processarTabela(dados);
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
          propertyName: "previsto",
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
          propertyName: "previsto",
          displayName: "Previsto",
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
    if (!query || query.length < 3) {
      this.processarDados(this.dasboardResponse);
      return;
    }

    const search = query.toLowerCase().trim();

    const filtered = this.dasboardResponse.filter((item: ISPODashboardUo) => {

      const codigoUO = item.uo;
      const nome = item.nome;
      return (
        nome.toLocaleLowerCase().includes(search) ||
        codigoUO.toLowerCase().includes(search)
      );
    });

    this.processarDados(filtered);
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
          ["previsto", "contratado", "autorizado"].includes(item.propertyName)
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
      `Unidade Orçamentária.xlsx`
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
