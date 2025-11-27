import { ExportDataService } from "./../../../../core/service/export-data";
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
  Inject,
  Output,
  EventEmitter,
  OnInit,
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
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ShortNumberPipe } from "../../../../shared/components/pipe/shortNumber-pipe";
import { ComunicationCardsService } from "../../../../core/service/comunication-cards/comunication-cards.service";

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
  dataReceitaTotalCards: EventEmitter<IReceitaTotalOrcamentariaResponse | IReceitaTotalOrcamentariaResponse[]> = new EventEmitter<IReceitaTotalOrcamentariaResponse | IReceitaTotalOrcamentariaResponse[]>();

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _comunicationCardsService = inject(ComunicationCardsService);

  private readonly destroy$ = new Subject<void>();
  private responseData: IReceitaTotalOrcamentariaResponse[] | null = null;

  readonly title: string = "Receita Prevista x Realizada";

  @Output() sendMaximizeButtonClick = new EventEmitter<boolean>();

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  selectedMaximize: boolean = false;
  loadingStatus: "loading" | "loaded" | "error" = "loading";


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
    this._painelService
      .getReceitaTotal(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.responseData ? "loaded" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          this.responseData = [response];
          this.processData(response);
          this._comunicationCardsService.sendReceitaTotal(response)
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
          this.loadingStatus = "error";
          this.responseData = null;
        },
      });
  }

  private processData(dados: IReceitaTotalOrcamentariaResponse): void {
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
    dados: IReceitaTotalOrcamentariaResponse | IReceitaTotalOrcamentariaResponse[]
  ): void {
    const dadosArray = Array.isArray(dados) ? dados : [dados];
    const ano = dadosArray[0]?.ano || new Date().getFullYear();
    const treeNodes = dadosArray
      .map((item) => {
        const previsao = item.vlr_receita_prevista || 0;
        const arrecadacao = item.vlr_receita_liquida || 0;
        const percentual =
          previsao > 0 ? ((arrecadacao / previsao) * 100).toFixed(2) : "0";

        return [
          {
            data: [
              {
                propertyName: "label",
                value: "Receita Realizada/Prevista",
              },
              { propertyName: "valor", value: `${percentual} %` },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Arrecadação Líquida" },
              { propertyName: "valor", value: `${arrecadacao.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}` },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Previsão Inicial Líquida" },
              { propertyName: "valor", value: `${previsao.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}` },
            ],
          },
          {
            data: [
              { propertyName: "label", value: "Exercício" },
              { propertyName: "valor", value: item.ano || 2025 },
            ],
          },
        ];
      })
      .flat();

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
          displayName: "Valores",
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
          item.vlr_receita_liquida?.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || "0";
        const receitaPrevista =
          item.vlr_receita_prevista?.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || "0";

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
      }
    );

    this.processTableData(filtered);
  }

  handleMaximizeButtonClick(event: boolean): void {
    console.log("🔄 Receita Total - Maximizar:", event);
    this.selectedMaximize = event;
    this.sendMaximizeButtonClick.emit(event);
  }

  calcMaximizedHeight(): number {
    const windowHeight = window.innerHeight;
    const calculatedHeight = windowHeight - 250; // Ajuste este valor conforme necessário

    console.log("📏 Altura calculada:", {
      windowHeight: windowHeight,
      calculatedHeight: calculatedHeight
    });

    return Math.max(calculatedHeight, 250); // Altura mínima de 400px
  }

  handleTableDownload(): void {

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
        if (item.propertyName != "Exercício") {
          row[item.propertyName] = item.value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim();
        }
        row[item.propertyName] = item.value;
      });

      return row;
    });

    const anoAtual =
      dataForDownload.find(
        (item: { label: string; valor: any }) => item.label === "Exercício"
      )?.valor || new Date().getFullYear();

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Receita_Realizada_Prevista_${anoAtual}.xlsx`
    );
  }
}
