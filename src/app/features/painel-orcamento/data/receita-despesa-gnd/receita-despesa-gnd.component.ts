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
  IReceitaDespesaGNDOrcamentoResponse,
  IReceitaDespesaGNDTotalOrcamentoResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { ShortNumberPipe } from "../../../../@theme/pipes/shortNumber.pipe";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { FlipTableContent } from "../../../strategic-projects/flip-table-model/flip-table.component";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
  selector: "ngx-receita-despesa-gnd",
  templateUrl: "./receita-despesa-gnd.component.html",
  styleUrls: ["./receita-despesa-gnd.component.scss"],
})
export class ReceitaDespesaGndComponent implements OnChanges, OnDestroy {
  @Input() filter: IPainelOrcamentoRequest;

  readonly title: string = "Despesa Prevista x Executada";

  private receitaDespesaOrcamento:
    | IReceitaDespesaGNDTotalOrcamentoResponse[]
    | null = [];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe = inject(ShortNumberPipe);

  private readonly destroy$ = new Subject<void>();

  chartData: IChartOptions;

  tableContent: FlipTableContent | null = null;

  loadingStatus: "loading" | "loaded" | "error" = "loading";

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) this.loadData();
  }

  private loadData(): void {
    this.loadingStatus = "loading";
    this.getReceitaDespesaGND();
  }

  private getReceitaDespesaGND(): void {
    this._painelService
      .getRceitaPorDespesaGND(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaDespesaOrcamento.length > 0 ? "loading" : "error";
        })
      )
      .subscribe({
        next: (res: IReceitaDespesaGNDOrcamentoResponse[]) => {
          this.receitaDespesaOrcamento = res;
          this.processData();
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.loadingStatus = "error";
          this.receitaDespesaOrcamento = [];
        },
      });
  }

  private processData(): void {
    const chartData: IChartOptions = this.processChartData();

    if (chartData) {
      this.chartData = chartData;
    } else {
      this.chartData = {data : {labels: [], datasets: []}};
      this.tableContent = null;
    }
  }

  private processChartData(): IChartOptions {
    return this._chartProcessor.criarChartLiquidadoEPago(
      this.receitaDespesaOrcamento, // Dados completos
      "nome_gnd", // Campo identificador da categoria,
      "Despesas por GND"
    );
  }
}
