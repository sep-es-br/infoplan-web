import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaOrigemOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ExportDataService } from "../../../../core/service/export-data";
import { ShortNumberPipe } from "../../../../@theme/pipes/shortNumber.pipe";

@Component({
  selector: "ngx-receita-origem",
  templateUrl: "./receita-origem.component.html",
  styleUrls: ["./receita-origem.component.scss"],
})
export class ReceitaOrigemComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe = inject(ShortNumberPipe);

  private readonly destroy$ = new Subject<void>();

  readonly title: string = "Receita por Origem";

  chartData!: IChartOptions;
  tableContent: FlipTableContent | null = null;
  loadingStatus: "loading" | "loaded" | "error" = "loading";
  private receitaOrigemCharData: IReceitaOrigemOrcamentariaResponse[] = [];

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
      .getReceitaOrigem(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaOrigemCharData.length > 0 ? "loaded" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          this.receitaOrigemCharData = response;
          this.processData();
        },
        error: (err) => {
          console.error("Erro ao carregar receita origem:", err);
          this.loadingStatus = "error";
        },
      });
  }

  private processData(): void {
    const chartData = this._chartProcessor.processarDadosComparativo(
      this.receitaOrigemCharData,
      "origem",
      "Receita Líquida"
    );

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaOrigemCharData);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processTableData(dados: IReceitaOrigemOrcamentariaResponse[]): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }
    // Extrair categorias (origens) únicas
    const categorias = [...new Set(dados.map((item) => item.origem))].filter(
      Boolean
    );

    // Extrair anos únicos e ordenar
    const anos = [...new Set(dados.map((item) => item.ano))]
      .filter((ano) => ano != null)
      .sort();

    if (categorias.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    // Criar dados no formato TreeNode para tabela comparativa
    const treeNodes: TreeNode[] = categorias.map((categoria) => {
      const nodeData = [
        {
          propertyName: "categoria",
          value: categoria,
        },
      ];

      // Adicionar valores para cada ano
      anos.forEach((ano) => {
        const item = dados.find((d) => d.origem === categoria && d.ano === ano);
        const valor = item?.receitaLiquida || 0;

        nodeData.push({
          propertyName: `Arrecadação LI - ${ano.toString()}`,
          value: `${valor.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
        });
      });

      // Calcular variação se tiver pelo menos 2 anos
      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos, dados); // ← Passe os dados
        nodeData.push({
          propertyName: "variação (%)",
          value: `${variacao} %`,
        });
      }

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    // Criar colunas
    const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
      propertyName: `Arrecadação LI - ${ano.toString()}`,
      displayName: `Arrecadação Líquida - ${ano.toString()}`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    // Adicionar coluna de variação se tiver pelo menos 2 anos
    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "variação (%)",
        displayName: "Variação",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      });
    }

    const customColumn: FlipTableColumn = {
      propertyName: "categoria",
      displayName: "Principais Origens de Receita",
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
    dados: IReceitaOrigemOrcamentariaResponse[]
  ): number {
    if (anos.length < 2) return 0;

    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];

    // CORREÇÃO: Use o parâmetro 'dados' em vez da propriedade da classe
    const valorInicial =
      dados.find((d) => d.origem === categoria && d.ano === primeiroAno)
        ?.receitaLiquida ?? 0;

    const valorFinal =
      dados.find((d) => d.origem === categoria && d.ano === ultimoAno)
        ?.receitaLiquida ?? 0;

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;
    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.receitaOrigemCharData?.length) return;

    const anos = [
      ...new Set(this.receitaOrigemCharData.map((item) => item.ano)),
    ]
      .filter((ano) => ano != null)
      .sort();

    const categorias = [
      ...new Set(this.receitaOrigemCharData.map((item) => item.origem)),
    ].filter(Boolean);

    const columns = [
      { key: "categoria", label: "Principais Origens de Receita" },
      ...anos.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação LI - ${ano}`,
      })),
    ];

    if (anos.length >= 2) {
      columns.push({ key: "variacao", label: "Variação" });
    }

    const dataForDownload = categorias.map((categoria) => {
      const row: any = { categoria };

      anos.forEach((ano) => {
        const item = this.receitaOrigemCharData.find(
          (d) => d.origem === categoria && d.ano === ano
        );
        row[`ano_${ano}`] = `${item?.receitaLiquida.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`;
      });

      if (anos.length >= 2) {
        const primeiroAno = anos[0];
        const ultimoAno = anos[anos.length - 1];

        const valorInicial =
          this.receitaOrigemCharData.find(
            (d) => d.origem === categoria && d.ano === primeiroAno
          )?.receitaLiquida ?? 0;

        const valorFinal =
          this.receitaOrigemCharData.find(
            (d) => d.origem === categoria && d.ano === ultimoAno
          )?.receitaLiquida ?? 0;

        const variacao =
          valorInicial !== 0
            ? ((valorFinal - valorInicial) / valorInicial) * 100
            : 0;

        row["variacao"] = `${variacao.toFixed(2)} %`;
      }

      return row;
    });

    const anoAtual = new Date().getFullYear();
    const fileName = `Receita_Realizada_Origem_${anoAtual}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName
    );
  }
}
