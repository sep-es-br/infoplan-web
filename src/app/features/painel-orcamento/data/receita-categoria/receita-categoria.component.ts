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
  IReceitaCategoriaOrcamentoResponse,
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

@Component({
  selector: "ngx-receita-categoria",
  templateUrl: "./receita-categoria.component.html",
  styleUrls: ["./receita-categoria.component.scss"],
})
export class ReceitaCategoriaComponent implements OnChanges, OnDestroy {
  @Input() filter!: IPainelOrcamentoRequest;

  readonly title: string = "Receita por Categoria";

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly destroy$ = new Subject<void>();
  private readonly _shortNumberPipe = inject(ShortNumberPipe);

  charData: IChartOptions;
  tableContent: FlipTableContent;

  private responseReceita: IReceitaCategoriaOrcamentoResponse[] | null = null;
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
          this.loadingStatus = this.responseReceita ? "loading" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          this.responseReceita = [response];
          this.processReceitaCategoriaCharData(this.responseReceita);
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.loadingStatus = "error";
          this.responseReceita = null;
        },
      });
  }

  private processReceitaCategoriaCharData(
    receitaCategoriaResponse: IReceitaCategoriaOrcamentoResponse[]
  ): void {
    if (!receitaCategoriaResponse || receitaCategoriaResponse.length === 0) {
      console.warn("Não há dados referente a receita por categoria.");
      return;
    }

    try {
      const receitaCategoriaCharData =
        this._chartProcessor.processarDadosComparativo(
          receitaCategoriaResponse,
          "categoria",
          "Receita Líquida"
        );

      this.charData = receitaCategoriaCharData;
      console.log("Atribuido ", this.charData);
    } catch (error) {
      console.log(" Error ao processar gráfico receita categoria");
    }
    this.processTable(receitaCategoriaResponse);
  }

  processTable(
    receitaCategoria:
      | IReceitaCategoriaOrcamentoResponse
      | IReceitaCategoriaOrcamentoResponse[]
  ): void {
    const dadosArray = this.normalizarDados(receitaCategoria);

    const anos = [...new Set(dadosArray.map((item) => item.ano))].sort(
      (a, b) => a - b
    );
    const categorias = [...new Set(dadosArray.map((item) => item.categoria))];

    const treeNodes = categorias.map((categoria) => {
      const nodeData = [{ propertyName: "label", value: categoria }];

      anos.forEach((ano) => {
        const dado = dadosArray.find(
          (d) => d.categoria === categoria && d.ano === ano
        );

        nodeData.push({
          propertyName: `ano_${ano}`,
          value: `R$ ${ this._shortNumberPipe.transform(dado?.receitaLiquida) || 0}`,
        });
      });

      // Adicionar coluna de variação se tiver pelo menos 2 anos
      if (anos.length >= 2) {
        const variacao = this.calcularVariacaoCategoria(
          dadosArray,
          categoria,
          anos
        );
        nodeData.push({
          propertyName: "valor",
          value: `${variacao} %`,
        });
      }

      return { data: nodeData };
    });

    const defaultColumns = anos.map((ano) => ({
      propertyName: `ano_${ano}`,
      displayName: `Arrecadação LI - ${ano}`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    // Adicionar coluna de variação se tiver pelo menos 2 anos
    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "valor",
        displayName: `Variação (%) ${anos[1]}`,
        alignment: {
          header: FlipTableAlignment.RIGHT,
          data: FlipTableAlignment.RIGHT,
        },
      });
    }

    this.tableContent = {
      customColumn: {
        propertyName: "label",
        displayName: `Categoria Econômica`,
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: defaultColumns,
      data: treeNodes,
    };
  }

  /**
   * Normaliza a estrutura de dados - resolve o problema do array dentro de array
   */
  private normalizarDados(
    receitaCategoria:
      | IReceitaCategoriaOrcamentoResponse
      | IReceitaCategoriaOrcamentoResponse[]
  ): IReceitaCategoriaOrcamentoResponse[] {
    // Se já for um array de IReceitaCategoriaOrcamentoResponse
    if (Array.isArray(receitaCategoria) && receitaCategoria.length > 0) {
      // Se o primeiro elemento é um array (estrutura [[]]), aplicar flat
      if (Array.isArray(receitaCategoria[0])) {
        return receitaCategoria.flat();
      }
      // Se já é um array plano, retornar como está
      return receitaCategoria;
    }

    // Se for um único objeto, colocar em array
    return [receitaCategoria as IReceitaCategoriaOrcamentoResponse];
  }

  private calcularVariacaoCategoria(
    dados: IReceitaCategoriaOrcamentoResponse[],
    categoria: string,
    anos: number[]
  ): number {
    if (anos.length < 2) return 0;

    const anoAnterior = anos[0]; // 2024 - NÃO usar flat() aqui
    const anoAtual = anos[1]; // 2025 - NÃO usar flat() aqui

    const valorAnoAnterior = dados.find(
      (d) => d.categoria === categoria && d.ano === anoAnterior
    )?.receitaLiquida;

    const valorAnoAtual = dados.find(
      (d) => d.categoria === categoria && d.ano === anoAtual
    )?.receitaLiquida;

    // Fórmula: ((2025 - 2024) / 2024) × 100
    if (valorAnoAnterior && valorAnoAtual && valorAnoAnterior !== 0) {
      const variacao =
        ((valorAnoAtual - valorAnoAnterior) / valorAnoAnterior) * 100;
      return Number(variacao.toFixed(2));
    }

    return 0;
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
        row[item.propertyName] = item.value;
      });

      return row;
    });

    console.log("Dados", dataForDownload.find(item => item))
    const anoAtual =
      dataForDownload.find(
        (item: { label: string; valor: any }) => item.label === "Exercício"
      )?.valor || new Date().getFullYear();

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      `Receita_Categoria_${anoAtual}.xlsx`
    );
  }

  handleTableSearch(query: string): void {
    throw new Error("Method not implemented.");
  }
}
