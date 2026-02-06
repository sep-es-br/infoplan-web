import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaDespesaGNDTotalOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import {
  FlipTableAlignment,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ComunicationCardsService } from "../../../../core/service/comunication-cards/comunication-cards.service";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { ChartDataConfig } from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import { Value } from "sass";
import { converterToNumber } from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-receita-despesa-gnd-total",
  templateUrl: "./receita-despesa-gnd-total.component.html",
  styleUrls: ["./receita-despesa-gnd-total.component.scss"],
})
export class ReceitaDespesaGndTotalComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "Despesa Prevista x Executada";

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "25%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private receitaDespesaGNDTotal: IReceitaDespesaGNDTotalOrcamentariaResponse[] =
    [];

  private readonly _execucaoOrcamentariaService = inject(
    PainelOrcamentoService,
  );

  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly destroy$ = new Subject<void>();

  public toggleExecutivo = true;
  public toggleDemaisPoderes = true;
  recentYear: number = 0;
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
  }

  public onToggleChange(toggle: "executivo" | "demaisPoderes"): void {
    // Se ambos ficaram false, força o OUTRO toggle a ficar true
    if (!this.toggleExecutivo && !this.toggleDemaisPoderes) {
      if (toggle === "executivo") {
        this.toggleDemaisPoderes = true; // Força o OUTRO
      } else {
        this.toggleExecutivo = true; // Força o OUTRO
      }
    }

    this.updateFilterPoderes();
  }

  private updateFilterPoderes(): void {
    const poderes: string[] = [];
    if (this.toggleExecutivo) {
      poderes.push("1");
    }

    if (this.toggleDemaisPoderes) {
      poderes.push("2");
    }

    this.filter.codPoder = poderes.join(",");
    this.getReceitaDespesaGNDTotal();
  }
  public isAtLeastOneToggleActive(): boolean {
    return this.toggleExecutivo || this.toggleDemaisPoderes;
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
    this.getReceitaDespesaGNDTotal();
  }

  private getReceitaDespesaGNDTotal(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._execucaoOrcamentariaService
      .getRceitaPorDespesaGNDTotal(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus =
            this.receitaDespesaGNDTotal.length > 0
              ? RequestStatus.SUCCESS
              : RequestStatus.ERROR;
        }),
      )
      .subscribe({
        next: (res: IReceitaDespesaGNDTotalOrcamentariaResponse[]) => {
          this.receitaDespesaGNDTotal = res;
          this._comunicationCardsService.sendReceitaDespesaGNDOrcamentaria(res);
          this.processData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar receita despesa GND total:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.receitaDespesaGNDTotal = [];
        },
      });
  }

  private processData(
    response: IReceitaDespesaGNDTotalOrcamentariaResponse[],
  ): void {
    const chartData: IChartOptions | null = this.processChartData();
    if (chartData) {
      this.chartData = chartData;
      this.processTableData(response);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processChartData(): IChartOptions | null {
    return this._chartProcessor.criarChartDespesaGndTotal(
      this.receitaDespesaGNDTotal,
      "ano",
      "Despesas GND Total",
    );
  }

  private processTableData(
    dados: IReceitaDespesaGNDTotalOrcamentariaResponse[],
  ): void {
    const anosArray = dados
      .map((item) => item.ano)
      .filter((a) => a != null)
      .sort((a, b) => b - a);

    const anoMaisRecente = anosArray.length > 0 ? anosArray[0] : "Período";

    const dadosAnoAtual = dados
      .filter((item) => item.ano === anoMaisRecente)
      .sort((a, b) => b.vlr_liquidado - a.vlr_liquidado);

    let totalOrcado = 0;
    let totalAutorizado = 0;
    let totalEmpenhado = 0;
    let totalLiquidado = 0;
    let totalPagoComRap = 0;

    dadosAnoAtual.forEach((item) => {
      totalOrcado += Number(item.vlr_orcado) || 0;
      totalAutorizado += Number(item.vlr_autorizado) || 0;
      totalEmpenhado += Number(item.vlr_empenhado) || 0;
      totalLiquidado += Number(item.vlr_liquidado) || 0;
      totalPagoComRap += Number(item.vlr_pago_com_rap) || 0;
    });

    const treeNodes = dadosAnoAtual
      .map((item) => {
        this.recentYear = item.ano;
        const orcado = Number(item.vlr_orcado) || 0;
        const autorizado = Number(item.vlr_autorizado) || 0;
        const empenhado = Number(item.vlr_empenhado) || 0;
        const liquidado = Number(item.vlr_liquidado) || 0;
        const pagoComRap = Number(item.vlr_pago_com_rap) || 0;

        return [
          {
            data: [
              {
                propertyName: "label",
                value: "Orçado",
              },
              {
                propertyName: "valor",
                value:
                  this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                    orcado,
                    "R$",
                  ),
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Autorizado" },
              {
                propertyName: "valor",
                value:
                  this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                    autorizado,
                    "R$",
                  ),
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Empenhado" },
              {
                propertyName: "valor",
                value:
                  this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                    empenhado,
                    "R$",
                  ),
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Liquidado" },
              {
                propertyName: "valor",
                value:
                  this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                    liquidado,
                    "R$",
                  ),
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Pago com RAP" },
              {
                propertyName: "valor",
                value:
                  this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                    pagoComRap,
                    "R$",
                  ),
              },
            ],
          },
        ];
      })
      .flat();

    this.tableContent = {
      customColumn: {
        propertyName: "label",
        displayName: `Despesa Prevista x Executada ${anoMaisRecente} `,
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: [
        {
          propertyName: "valor",
          displayName: "Valores (R$)",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
      ],
      data: treeNodes,
    };
  }

  handleTableDownload(): void {
    if (!this.tableContent?.data?.length) return;

    const columns: Array<{ key: string; label: string }> = [
      { key: "label", label: this.tableContent.customColumn.displayName },
      ...this.tableContent.defaultColumns.map((col) => ({
        key: col.propertyName,
        label: col.displayName,
      })),
    ];

    const anos = this.tableContent.defaultColumns
      .filter((col) =>
        col.propertyName.startsWith("Despesa Prevista x Executada "),
      )
      .map((col) =>
        parseInt(
          col.propertyName.replace("Despesa Prevista x Executada ", "").trim(),
        ),
      )
      .sort((a, b) => a - b);
    const dataForDownload = this.tableContent.data.map((node: TreeNode) => {
      const row: any = {};

      node.data.forEach((item: { propertyName: string; value: string }) => {
        const { propertyName, value } = item;

        if (propertyName === "valor") {
          row[propertyName] = converterToNumber(value);
        } else {
          row[propertyName] = value;
        }
      });

      return row;
    });

    const anoAtual = this.recentYear;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Receita_Realizada_X_Executada_${anoAtual}.xlsx`,
    );
  }
}
