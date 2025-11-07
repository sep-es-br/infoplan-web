import { IChartOptions } from "./../../../../shared/models/painel-orcamento/IChartOptions";
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
  IReceitaTransfereciaCorrenteOrcamentoResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
  selector: "ngx-receita-transferencia",
  templateUrl: "./receita-transferencia.component.html",
  styleUrls: ["./receita-transferencia.component.scss"],
})
export class ReceitaTransferenciaComponent implements OnChanges, OnDestroy {
  @Input() filter: IPainelOrcamentoRequest;

  readonly title: string = "Transfêrencias Correntes";

  private receitaTransferenciaCorrente: IReceitaTransfereciaCorrenteOrcamentoResponse[];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly destroy$ = new Subject<void>();

  chartData: IChartOptions;
   tableContent: any[] = [];

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

  private loadData() {
    this.loadingStatus = "loading";
    this.getTransferenciaCorrente();
  }

  private getTransferenciaCorrente(): void {
    this._painelService
      .getRceitaPorTransferenciaCorrente(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaTransferenciaCorrente.length > 0 ? "loading" : "error";
        })
      )
      .subscribe({
        next: (res: IReceitaTransfereciaCorrenteOrcamentoResponse[]) => {
          this.receitaTransferenciaCorrente = res;
          this.processData();
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.loadingStatus = "error";
          this.receitaTransferenciaCorrente = [];
        },
      });
  }

  private processData(): void {
    const chartData = this.processchartData();

    if (chartData) {
      this.chartData = chartData;
      this.tableContent = this._chartProcessor.criarTabelaComparativo(
        this.receitaTransferenciaCorrente,
        'nome_item_patrimonial',
        ['receitaLiquida', 'vlr_receita_liquida']
      );
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = [];
    }
  }

  private processchartData(): IChartOptions {
    return this._chartProcessor.processarDadosComparativo(
      this.receitaTransferenciaCorrente,
      "nome_item_patrimonial",
      "Receita Líquida"
    );
  }

  handleTableSearch(query: string): void {
    console.log("Busca não implementada:", query);
  }

  handleTableDownload() {}
}
