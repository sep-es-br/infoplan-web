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
import { ShortNumberPipe } from "../../../../@theme/pipes/shortNumber.pipe";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ComunicationCardsService } from "../../../../core/service/comunication-cards/comunication-cards.service";

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
  loadingStatus: "loading" | "loaded" | "error" = "loading";

  private receitaDespesaGNDTotal: IReceitaDespesaGNDTotalOrcamentariaResponse[] =
    [];

  private readonly _execucaoOrcamentariaService = inject(
    PainelOrcamentoService
  );

  private receitaDespesaGNDTotalOrcamento:
    | IReceitaDespesaGNDTotalOrcamentariaResponse[]
    | null = [];

  private readonly _chartProcessor: ChartDataProcessorService = inject(ChartDataProcessorService);
  private readonly _exportDataService: ExportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe: ShortNumberPipe = inject(ShortNumberPipe);
  private readonly _comunicationCardsService: ComunicationCardsService = inject(ComunicationCardsService);
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

  private loadData(): void {
    this.loadingStatus = "loading";
    this.getReceitaDespesaGNDTotal();
  }

  private getReceitaDespesaGNDTotal(): void {
    this._execucaoOrcamentariaService
      .getRceitaPorDespesaGNDTotal(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaDespesaGNDTotal.length > 0 ? "loading" : "error";
        })
      )
      .subscribe({
        next: (res: IReceitaDespesaGNDTotalOrcamentariaResponse[]) => {
          this.receitaDespesaGNDTotal = res;
          this._comunicationCardsService.sendReceitaDespesaGNDOrcamentaria(res);
          this.processData();
        },
      });
  }

  private processData(): void {
    const chartData: IChartOptions = this.processChartData();

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaDespesaGNDTotal);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processChartData(): IChartOptions {
    return this._chartProcessor.criarChartDespesaGndTotal(
      this.receitaDespesaGNDTotal,
      "ano",
      "Despesas GND Total"
    );
  }

  private processTableData(
    dados:
      | IReceitaDespesaGNDTotalOrcamentariaResponse
      | IReceitaDespesaGNDTotalOrcamentariaResponse[]
  ): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];
    const ano = dadosArray[1]?.ano || new Date().getFullYear();
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
                value: `${orcado.toLocaleString("pt-BR")}`,
              },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Autorizado" },
              {
                propertyName: "valor",
                value: `${autorizado.toLocaleString("pt-BR")}`,
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
                value: `${pagoComRap.toLocaleString("pt-BR")}`,
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
          row[item.propertyName] = parseFloat(valorLimpo).toLocaleString("pt-BR") || 0;
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
