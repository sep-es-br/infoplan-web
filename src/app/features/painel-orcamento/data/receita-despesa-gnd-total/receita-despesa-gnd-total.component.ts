import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
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
        top: "10%",
        left: "0%",
        right: "0%",
        bottom: "0%",
        containLabel: true,
      },
    };

  private receitaDespesaGNDTotal: IReceitaDespesaGNDTotalOrcamentariaResponse[] =
    [];

  private readonly _execucaoOrcamentariaService = inject(
    PainelOrcamentoService
  );

  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
            this.receitaDespesaGNDTotal.length > 0 ? RequestStatus.SUCCESS : RequestStatus.ERROR;
        })
      )
      .subscribe({
        next: (res: IReceitaDespesaGNDTotalOrcamentariaResponse[]) => {
          this.receitaDespesaGNDTotal = res;
          this._comunicationCardsService.sendReceitaDespesaGNDOrcamentaria(res);
          this.processData();
        },
        error: (err) => {
          console.error("Erro ao carregar receita despesa GND total:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.receitaDespesaGNDTotal = [];
        },
      });
  }

  private processData(): void {
    const chartData: IChartOptions | null = this.processChartData();
    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaDespesaGNDTotal);
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
    dados:
      | IReceitaDespesaGNDTotalOrcamentariaResponse
      | IReceitaDespesaGNDTotalOrcamentariaResponse[]
  ): void {
    const currentYear = new Date().getFullYear();
    const dadosArray = (Array.isArray(dados) ? dados : [dados]).filter(
      (item) => item.ano === currentYear
    );
    const ano = currentYear;
    const treeNodes = dadosArray
      .map((item) => {
        const orcado = item.vlr_orcado || 0;
        const autorizado = item.vlr_autorizado || 0;
        const empenhado = item.vlr_empenhado || 0;
        const liquidado = item.vlr_liquidado || 0;
        const pagoComRap = item.vlr_pago_com_rap || 0;

        return [
          {
            data: [
              {
                propertyName: "label",
                value: "Orçado",
              },
              {
                propertyName: "valor",
                value: `${orcado.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Autorizado" },
              {
                propertyName: "valor",
                value: `${autorizado.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Empenhado" },
              {
                propertyName: "valor",
                value: `${empenhado.toLocaleString("pt-BR")}`,
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Liquidado" },
              {
                propertyName: "valor",
                value: `${liquidado.toLocaleString("pt-BR")}`,
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Pago com RAP" },
              {
                propertyName: "valor",
                value: `${pagoComRap.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
              },
            ],
          },
        ];
      })
      .flat();

    this.tableContent = {
      customColumn: {
        propertyName: "label",
        displayName: `Despesa Prevista x Executada - ${ano}`,
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: [
        {
          propertyName: "valor",
          displayName: "Valor",
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

    const dataForDownload = this.tableContent.data.map((node) => {
      const row: any = {};

      node.data.forEach((item) => {
        // Para a coluna de valor, remove "R$ " e converte para número
        if (item.propertyName === "valor") {
          const valorLimpo = item.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
          row[item.propertyName] = parseFloat(valorLimpo).toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0;
        } else {
          row[item.propertyName] = item.value;
        }
      });

      return row;
    });

    const anoAtual = new Date().getFullYear();

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Receita_Realizada_X_Executada_${anoAtual}.xlsx`
    );
  }
}
