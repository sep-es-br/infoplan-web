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
  IReceitaCategoriaOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import {
  FlipTableAlignment,
  FlipTableContent,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { finalize, takeUntil } from "rxjs/operators";
import { ShortNumberPipe } from "../../../../@theme/pipes";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "ngx-receita-categoria",
  templateUrl: "./receita-categoria.component.html",
  styleUrls: ["./receita-categoria.component.scss"],
})
export class ReceitaCategoriaComponent implements OnChanges, OnDestroy {
  @Input() filter!: IExecucaoOrcamentariaRequest;

  readonly title: string = "Receita por Categoria";

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe = inject(ShortNumberPipe);
  private readonly _sanitizer = inject(DomSanitizer);
  private readonly destroy$ = new Subject<void>();
  charData: IChartOptions;
  tableContent: FlipTableContent;

  // MUDANÇA: Agora é sempre um array consistente
  private receitaData: IReceitaCategoriaOrcamentariaResponse[] = [];
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
      .getReceitaPorCategoria(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.receitaData.length > 0 ? "loaded" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          // Backend já retorna array, não precisa de normalização
          this.receitaData = response;
          this.processarDados();
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.loadingStatus = "error";
          this.receitaData = [];
        },
      });
  }

  /**
   * Processa os dados para gráfico e tabela
   */
  private processarDados(): void {
    if (this.receitaData.length === 0) {
      console.warn("Não há dados referente a receita por categoria.");
      return;
    }

    try {
      // Processar gráfico
      this.charData = this._chartProcessor.processarDadosComparativo(
        this.receitaData,
        "categoria",
        "Receita Líquida"
      );

      // Processar tabela
      this.processTable();

      this.loadingStatus = "loaded";
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      this.loadingStatus = "error";
    }
  }

  private processTable(): void {
    const anos = [...new Set(this.receitaData.map(item => item.ano))].sort((a, b) => a - b);
    const categorias = [...new Set(this.receitaData.map(item => item.categoria))];

    const treeNodes = categorias.map(categoria => {
      const nodeData = [{ propertyName: "label", value: categoria }];

      // Adicionar colunas de anos
      anos.forEach(ano => {
        const dado = this.receitaData.find(
          d => d.categoria === categoria && d.ano === ano
        );

        nodeData.push({
          propertyName: `ano_${ano}`,
          value: `${dado?.receitaLiquida.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
        });
      });

      // Adicionar coluna de variação
      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos);
        nodeData.push({
          propertyName: "variação",
          value: `${variacao} %`,
        });
      }

      return { data: nodeData };
    });

    // Configurar colunas
    const defaultColumns = anos.map(ano => ({
      propertyName: `ano_${ano}`,
      displayName: `Arrecadação LI - ${ano}`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "variação",
        displayName: `Variação - ${anos[anos.length - 1]}`,
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      });
    }

    this.tableContent = {
      customColumn: {
        propertyName: "label",
        displayName: "Categoria Econômica",
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns,
      data: treeNodes,
    };
  }

  private calcularVariacao(categoria: string, anos: number[]): number {
    if (anos.length < 2) return 0;
    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];


    const valorInicial = this.receitaData.find(
      d => d.categoria === categoria && d.ano === primeiroAno
    )?.receitaLiquida ?? 0;

    const valorFinal = this.receitaData.find(
      d => d.categoria === categoria && d.ano === ultimoAno
    )?.receitaLiquida ?? 0;

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;

    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.receitaData?.length) return;

    // Extrair anos únicos e ordenar (igual no processTableData)
    const anos = [
      ...new Set(this.receitaData.map((item) => item.ano)),
    ]
      .filter((ano) => ano != null)
      .sort();

    // Extrair categorias únicas
    const categorias = [
      ...new Set(this.receitaData.map((item) => item.categoria)),
    ].filter(Boolean);

    // Criar colunas
    const columns = [
      { key: "categoria", label: "Principais Origens de Receita" },
      ...anos.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação LI - ${ano}`,
      })),
    ];

    if (anos.length >= 2) {
      columns.push({ key: "variacao", label: "Variação (%)" });
    }

    // Criar dados para download usando os valores brutos
    const dataForDownload = categorias.map((categoria) => {
      const row: any = { categoria };

      anos.forEach((ano) => {
        const item = this.receitaData.find(
          (d) => d.categoria === categoria && d.ano === ano
        );
        row[`ano_${ano}`] = `${item?.receitaLiquida.toLocaleString("pt-BR") || 0}`;
      });

      if (anos.length >= 2) {
        const primeiroAno = anos[0];
        const ultimoAno = anos[anos.length - 1];

        const valorInicial =
          this.receitaData.find(
            (d) => d.categoria === categoria && d.ano === primeiroAno
          )?.receitaLiquida ?? 0;

        const valorFinal =
          this.receitaData.find(
            (d) => d.categoria === categoria && d.ano === ultimoAno
          )?.receitaLiquida ?? 0;

        const variacao =
          valorInicial !== 0
            ? ((valorFinal - valorInicial) / valorInicial) * 100
            : 0;

        row["variacao"] = Number(variacao.toFixed(2));
      }

      return row;
    });

    const anoAtual = new Date().getFullYear();
    const fileName = `Receita_Realizada_Origem_${anoAtual}.xlsx`;
    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Receita_Categoria_${anoAtual}.xlsx`
    );
  }

  handleTableSearch(query: string): void {
    // TODO: Implementar busca
    console.log("Busca não implementada:", query);
  }
}
