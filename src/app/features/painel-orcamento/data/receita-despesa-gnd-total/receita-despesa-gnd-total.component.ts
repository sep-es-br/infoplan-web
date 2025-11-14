import { Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaDespesaGNDTotalOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { FlipTableContent } from "../../../strategic-projects/flip-table-model/flip-table.component";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { ShortNumberPipe } from "../../../../@theme/pipes/shortNumber.pipe";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

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
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe = inject(ShortNumberPipe);
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

  private loadData() : void {
    this.loadingStatus = "loading";
    this.getReceitaDespesaGNDTotal();
  }


  private getReceitaDespesaGNDTotal() : void {
    this._execucaoOrcamentariaService.getRceitaPorDespesaGNDTotal(this.filter).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.loadingStatus = this.receitaDespesaGNDTotal.length > 0 ? "loading" : "error"})
    ).subscribe({
      next: ((res: IReceitaDespesaGNDTotalOrcamentariaResponse[]) => {
        this.receitaDespesaGNDTotal = res;
        this.chartData = this.processData();
        console.log("resultados", this.chartData)
        console.log("resultados process", this.processData())
      })
    })
  }

  private processData() : IChartOptions {
    return this._chartProcessor.criarChartDespesaGndTotal(
      this.receitaDespesaGNDTotal,
      "ano",
      "Despesas GND Total"
    )
  }
}
