import { ExportDataService } from "./../../../../core/service/export-data";
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaTotalOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import {
  FlipTableAlignment,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ShortNumberPipe } from "../../../../shared/components/pipe/shortNumber-pipe";
import { ComunicationCardsService } from "../../../../core/service/comunication-cards/comunication-cards.service";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { ChartDataConfig } from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { converterToNumber, formatCurrency } from "../../../../@core/utils/functionts/functionts";
import { UtilitiesService } from "../../../../core/service/utilities.service";

interface ITableRow {
  label: string;
  previsao: number;
  arrecadacao: number;
}

@Component({
  selector: "ngx-receita-total",
  templateUrl: "./receita-total.component.html",
  styleUrls: ["./receita-total.component.scss"],
  providers: [ShortNumberPipe],
})
export class ReceitaTotalComponent implements OnChanges, OnDestroy {
  @Input() filter!: IExecucaoOrcamentariaRequest;
  @Output()
  dataReceitaTotalCards: EventEmitter<
    IReceitaTotalOrcamentariaResponse | IReceitaTotalOrcamentariaResponse[]
  > = new EventEmitter<
    IReceitaTotalOrcamentariaResponse | IReceitaTotalOrcamentariaResponse[]
  >();

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);

  private readonly destroy$: Subject<void> = new Subject<void>();

  private responseData: IReceitaTotalOrcamentariaResponse[] | null = null;

  readonly title: string = "Receita Prevista x Realizada";

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  selectedMaximize: boolean = false;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

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
    this.requestStatus = RequestStatus.LOADING;
    this._painelService
      .getReceitaTotal(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.responseData = [response];
          this.processData(response);
          this._comunicationCardsService.sendReceitaTotal(response);
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.responseData = [];
        },
      });
  }

  private processData(dados: IReceitaTotalOrcamentariaResponse): void {
    const dadosOrdenados = dados;
    this.chartData = {
      data: {
        labels: dados.ano ? [dados.ano.toString()] : [],
        datasets: [
          {
            label: "Previsão Inicial Líquida",
            data: [dados.vlr_receita_prevista || 0],
            backgroundColor: this._chartProcessor.colors[0],
          },
          {
            label: "Arrecadação Líquida",
            data: [dados.vlr_receita_liquida || 0],
            backgroundColor: this._chartProcessor.colors[1],
          },
        ],
      },
    };

    this.processTableData(dados);
  }

  private processTableData(
    dados:
      | IReceitaTotalOrcamentariaResponse
      | IReceitaTotalOrcamentariaResponse[],
  ): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];
    const ano = dadosArray[0]?.ano || 2025;

    const treeNodes = dadosArray.flatMap((item) => {
      const previsao = item.vlr_receita_prevista || 0;
      const arrecadacao = item.vlr_receita_liquida || 0;
      const percentual = previsao > 0 ? (arrecadacao / previsao) * 100 : 0;

      const itensPrincipais = [
        {
          label: "Arrecadação Líquida",
          valorNumerico: arrecadacao,
          valorFormatado: this._utilitiesService.formatCurrencyUsingBrazilianStandards(arrecadacao, "R$"),
        },
        {
          label: "Previsão Inicial Líquida",
          valorNumerico: previsao,
          valorFormatado: this._utilitiesService.formatCurrencyUsingBrazilianStandards(previsao, "R$"),
        },
      ];

      itensPrincipais.sort((a, b) => b.valorNumerico - a.valorNumerico);

      const listaOrdenada = [
        ...itensPrincipais.map((i) => ({
          label: i.label,
          valor: i.valorFormatado,
        }))
      ];

      return listaOrdenada.map((linha) => ({
        data: [
          { propertyName: "label", value: linha.label },
          { propertyName: "valor", value: linha.valor },
        ],
      }));
    });

    this.tableContent = {
      customColumn: {
        propertyName: "label",
        displayName: `Receita Realizada/Prevista - ${ano}`,
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

  handleTableSearch(query: string): void {
    if (!query || query.length < 3) {
      this.processTableData(this.responseData);
      return;
    }

    const search = query.toLowerCase().trim();

    const filtered = this.responseData.filter(
      (item: IReceitaTotalOrcamentariaResponse) => {
        const ano = item.ano?.toString() || "";
        const receitaLiquida =
          item.vlr_receita_liquida
            ?.toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
            .replace("R$", "")
            .trim() || "0";
        const receitaPrevista =
          item.vlr_receita_prevista
            ?.toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
            .replace("R$", "")
            .trim() || "0";

        const percentual =
          item.vlr_receita_prevista > 0
            ? (
                (item.vlr_receita_liquida / item.vlr_receita_prevista) *
                100
              ).toFixed(2)
            : "0";

        return (
          ano.toLowerCase().includes(search) ||
          receitaLiquida.toLowerCase().includes(search) ||
          receitaPrevista.toLowerCase().includes(search) ||
          percentual.includes(search)
        );
      },
    );

    this.processTableData(filtered);
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
    const columns: Array<{ key: string; label: string }> = [
      { key: "label", label: this.tableContent.customColumn.displayName },
      ...this.tableContent.defaultColumns.map((col) => ({
        key: col.propertyName,
        label: col.displayName,
      })),
    ];

    const dataForDownload = this.tableContent.data.map((node: TreeNode) => {
      const row: any = {};

      node.data.forEach((item) => {
        const { propertyName, value } = item;

        row[propertyName] = value;

        if (propertyName === "Exercício" || typeof value !== "string") {
          return;
        }

        const numeroConvertido = converterToNumber(value);
        if (numeroConvertido !== null) {
          row[propertyName] = numeroConvertido;
        }
      });

      return row;
    });

    const anoAtual =
      dataForDownload.find(
        (item: { label: string; valor: any }) => item.label === "Exercício",
      )?.valor || new Date().getFullYear();

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Receita_Realizada_Prevista_${anoAtual}.xlsx`,
    );
  }
}
