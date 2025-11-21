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
  IReceitaDespesaGNDOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { ShortNumberPipe } from "../../../../@theme/pipes/shortNumber.pipe";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { finalize, takeUntil } from "rxjs/operators";
import { ComunicationCardsService } from "../../../../core/service/comunication-cards/comunication-cards.service";

@Component({
  selector: "ngx-receita-despesa-gnd",
  templateUrl: "./receita-despesa-gnd.component.html",
  styleUrls: ["./receita-despesa-gnd.component.scss"],
})
export class ReceitaDespesaGndComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "Despesa por GND";

  private receitaDespesaOrcamento:
    | IReceitaDespesaGNDOrcamentariaResponse[]
    | null = [];

  private readonly _painelService: PainelOrcamentoService = inject(PainelOrcamentoService);
  private readonly _chartProcessor: ChartDataProcessorService = inject(ChartDataProcessorService);
  private readonly _exportDataService: ExportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe: ShortNumberPipe = inject(ShortNumberPipe);
  private readonly _comunicationCardsService: ComunicationCardsService = inject(ComunicationCardsService);
  private readonly destroy$ = new Subject<void>();

  chartData: IChartOptions;
  tableContent: FlipTableContent | null = null;
  loadingStatus: "loading" | "loaded" | "error" = "loading";
  dataReceitaDespesaGNDOrcamentariaCards: IReceitaDespesaGNDOrcamentariaResponse[] | null = [];

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
        next: (res: IReceitaDespesaGNDOrcamentariaResponse[]) => {
          this.receitaDespesaOrcamento = res;
          // this._comunicationCardsService.sendReceitaDespesaGNDOrcamentaria(res);
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
      this.processTableData(this.receitaDespesaOrcamento);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processChartData(): IChartOptions {
    console.log(this._chartProcessor.criarChartLiquidadoEPago(
      this.receitaDespesaOrcamento,
      "nome_gnd",
      "Despesas por GND"
    ));
    return this._chartProcessor.criarChartLiquidadoEPago(
      this.receitaDespesaOrcamento,
      "nome_gnd",
      "Despesas por GND"
    );
  }

  private processTableData(
    dados: IReceitaDespesaGNDOrcamentariaResponse[]
  ): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categorias = [...new Set(dados.map((item) => item.nome_gnd))].filter(
      Boolean
    );

    const anos = [...new Set(dados.map((item) => item.ano))]
      .filter((ano) => ano != null)
      .sort();

    if (categorias.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const treeNodes: TreeNode[] = categorias.map((categoria) => {
      const nodeData = [
        {
          propertyName: "categoria",
          value: categoria,
        },
      ];

      anos.forEach((ano) => {
        // Agrupa por ano e categoria, somando valores de diferentes tipo_fonte
        const itens = dados.filter(
          (d) => d.nome_gnd === categoria && d.ano === ano
        );

        const valorLiquidado = itens.reduce(
          (acc, item) => acc + (item.vlr_liquidado || 0),
          0
        );
        const valorPagoComRAP = itens.reduce(
          (acc, item) => acc + (item.vlr_pago_com_rap || 0),
          0
        );

        nodeData.push({
          propertyName: `Despesa Liquidada - ${ano.toString()}`,
          value: `R$ ${valorLiquidado || 0}`,
        });

        nodeData.push({
          propertyName: `Pago com RAP - ${ano.toString()}`,
          value: `R$ ${valorPagoComRAP || 0}`,
        });
      });

      if (anos.length >= 2) {
        const variacaoLiquidado = this.calcularVariacao(
          categoria,
          anos,
          dados,
          "liquidado"
        );
        nodeData.push({
          propertyName: "Variação Liquidado (%)",
          value: `${variacaoLiquidado}%`,
        });

        const variacaoPagoRAP = this.calcularVariacao(
          categoria,
          anos,
          dados,
          "pago_rap"
        );
        nodeData.push({
          propertyName: "Variação Pago RAP (%)",
          value: `${variacaoPagoRAP}%`,
        });
      }

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    const defaultColumns: FlipTableColumn[] = [];

    anos.forEach((ano) => {
      defaultColumns.push({
        propertyName: `Despesa Liquidada - ${ano.toString()}`,
        displayName: `Despesa Liquidada - ${ano.toString()}`,
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.RIGHT,
        },
      });

      defaultColumns.push({
        propertyName: `Pago com RAP - ${ano.toString()}`,
        displayName: `Pago com RAP - ${ano.toString()}`,
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.RIGHT,
        },
      });
    });

    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "Variação Liquidado (%)",
        displayName: "Variação Liquidado (%)",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.RIGHT,
        },
      });

      defaultColumns.push({
        propertyName: "Variação Pago RAP (%)",
        displayName: "Variação Pago RAP (%)",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.RIGHT,
        },
      });
    }

    const customColumn: FlipTableColumn = {
      propertyName: "categoria",
      displayName: "Grupo de Natureza da Despesa",
      alignment: {
        header: FlipTableAlignment.LEFT,
        data: FlipTableAlignment.LEFT,
      },
    };

    this.tableContent = {
      customColumn,
      defaultColumns,
      data: treeNodes,
    };
  }

  private calcularVariacao(
    categoria: string,
    anos: number[],
    dados: IReceitaDespesaGNDOrcamentariaResponse[],
    tipo: "liquidado" | "pago_rap"
  ): number {
    if (anos.length < 2) return 0;

    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];

    const propriedade =
      tipo === "liquidado" ? "vlr_liquidado" : "vlr_pago_com_rap";

    const valorInicial = dados
      .filter((d) => d.nome_gnd === categoria && d.ano === primeiroAno)
      .reduce((acc, item) => acc + (item[propriedade] || 0), 0);

    const valorFinal = dados
      .filter((d) => d.nome_gnd === categoria && d.ano === ultimoAno)
      .reduce((acc, item) => acc + (item[propriedade] || 0), 0);

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;
    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.receitaDespesaOrcamento?.length) return;

    const anos = [
      ...new Set(this.receitaDespesaOrcamento.map((item) => item.ano)),
    ]
      .filter((ano) => ano != null)
      .sort();

    const categorias = [
      ...new Set(this.receitaDespesaOrcamento.map((item) => item.nome_gnd)),
    ].filter(Boolean);

    const columns = [
      { key: "categoria", label: "Grupo de Natureza da Despesa" },
    ];

    // Adiciona colunas para cada ano (Liquidado e Pago RAP)
    anos.forEach((ano) => {
      columns.push(
        { key: `liquidado_${ano}`, label: `Despesa Liquidada - ${ano}` },
        { key: `pago_rap_${ano}`, label: `Pago com RAP - ${ano}` }
      );
    });

    // Adiciona colunas de variação se tiver mais de 1 ano
    if (anos.length >= 2) {
      columns.push(
        { key: "variacao_liquidado", label: "Variação Liquidado (%)" },
        { key: "variacao_pago_rap", label: "Variação Pago RAP (%)" }
      );
    }

    const dataForDownload = categorias.map((categoria) => {
      const row: any = { categoria };

      // Preenche valores por ano
      anos.forEach((ano) => {
        const itens = this.receitaDespesaOrcamento.filter(
          (d) => d.nome_gnd === categoria && d.ano === ano
        );

        const valorLiquidado = itens.reduce(
          (acc, item) => acc + (item.vlr_liquidado || 0),
          0
        );
        const valorPagoRAP = itens.reduce(
          (acc, item) => acc + (item.vlr_pago_com_rap || 0),
          0
        );

        row[`liquidado_${ano}`] = valorLiquidado.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        row[`pago_rap_${ano}`] = valorPagoRAP.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      });

      // Calcula variações
      if (anos.length >= 2) {
        const primeiroAno = anos[0];
        const ultimoAno = anos[anos.length - 1];

        // Variação Liquidado
        const itensIniciaisLiq = this.receitaDespesaOrcamento.filter(
          (d) => d.nome_gnd === categoria && d.ano === primeiroAno
        );
        const itensFinaisLiq = this.receitaDespesaOrcamento.filter(
          (d) => d.nome_gnd === categoria && d.ano === ultimoAno
        );

        const valorInicialLiq = itensIniciaisLiq.reduce(
          (acc, item) => acc + (item.vlr_liquidado || 0),
          0
        );
        const valorFinalLiq = itensFinaisLiq.reduce(
          (acc, item) => acc + (item.vlr_liquidado || 0),
          0
        );

        const variacaoLiq =
          valorInicialLiq !== 0
            ? ((valorFinalLiq - valorInicialLiq) / valorInicialLiq) * 100
            : 0;

        // Variação Pago RAP
        const valorInicialRAP = itensIniciaisLiq.reduce(
          (acc, item) => acc + (item.vlr_pago_com_rap || 0),
          0
        );
        const valorFinalRAP = itensFinaisLiq.reduce(
          (acc, item) => acc + (item.vlr_pago_com_rap || 0),
          0
        );

        const variacaoRAP =
          valorInicialRAP !== 0
            ? ((valorFinalRAP - valorInicialRAP) / valorInicialRAP) * 100
            : 0;

        row["variacao_liquidado"] = Number(variacaoLiq.toFixed(2));
        row["variacao_pago_rap"] = Number(variacaoRAP.toFixed(2));
      }

      return row;
    });

    const anoAtual = new Date().getFullYear();
    const fileName = `Despesa_GND_${anoAtual}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName
    );
  }
}
