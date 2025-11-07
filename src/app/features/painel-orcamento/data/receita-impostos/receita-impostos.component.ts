import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  IPainelOrcamentoRequest,
  IReceitaImpostoOrcamentoResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
  selector: "ngx-receita-impostos",
  templateUrl: "./receita-impostos.component.html",
  styleUrls: ["./receita-impostos.component.scss"],
})
export class ReceitaImpostosComponent implements OnChanges, OnDestroy {
  @Input() filter: IPainelOrcamentoRequest;

  readonly title: string = "Imposto, Taxas e Contribuições de Melhoria";

  chartData!: IChartOptions;
  tableContent: any[] = [];
  loadingStatus: "loading" | "loaded" | "error" = "loading";

  private receitaImpostoCharData: IReceitaImpostoOrcamentoResponse[] = [];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
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

  private loadData() {
    this.loadingStatus = "loading";
    this.getReceitaImposto();
  }

  private getReceitaImposto() {
    this._painelService
      .getRceitaPorImpostos(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaImpostoCharData.length > 0 ? "loading" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          this.receitaImpostoCharData = response;
          this.procesData();
        },
      });
  }

  private procesData(): void {
    const chartData = this.processChatData();

    if (chartData) {
      this.chartData = chartData;
      this.processTable(this.chartData);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = [];
    }
  }

  private processTable(charData: IChartOptions): void {
    this.tableContent = this._chartProcessor.criarTabelaComparativo(
      this.receitaImpostoCharData,
      "nome_item_patrimonial",
      ["receitaLiquida", "vlr_receita_liquida"]
    );
  }

  private processChatData() : IChartOptions {
    return this._chartProcessor.processarDadosComparativo(
      this.receitaImpostoCharData,
      "nome_item_patrimonial",
      "Receita Líquida"
    );
  }

  handleTableSearch(query: string): void {
    // Implementar busca
  }

  handleTableDownload(): void {
    console.log("Download imposto:", this.tableContent);
    // Implementar download
  }
}
