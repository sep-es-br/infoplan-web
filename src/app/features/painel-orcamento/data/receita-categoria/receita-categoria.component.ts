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
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { finalize, takeUntil } from "rxjs/operators";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import {
  ChartDataConfig,
  OrgChartHorizontalComponent,
} from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import { converterToNumber, replacePorcentage } from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-receita-categoria",
  templateUrl: "./receita-categoria.component.html",
  styleUrls: ["./receita-categoria.component.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class ReceitaCategoriaComponent implements OnChanges, OnDestroy {
  @Input() filter!: IExecucaoOrcamentariaRequest;

  readonly title: string = "Receita por Categoria";

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);

  private readonly destroy$ = new Subject<void>();

  charData: IChartOptions;
  tableContent: FlipTableContent;
  selectedMaximize: boolean = false;

  // MUDANÇA: Agora é sempre um array consistente
  private receitaData: IReceitaCategoriaOrcamentariaResponse[] = [];
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "3%",
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

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }

  calcMaximizedHeight(): number {
    return this._chartMaximizeService.calcMaximizedHeight();
  }

  private loadData(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._painelService
      .getReceitaPorCategoria(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Backend já retorna array, não precisa de normalização
          this.receitaData = response;
          this.processarDados();

          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.requestStatus = RequestStatus.ERROR;
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
        "Receita Líquida",
      );

      // Processar tabela
      this.processTable();

      this.requestStatus = RequestStatus.SUCCESS;
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      this.requestStatus = RequestStatus.ERROR;
    }
  }

  private processTable(): void {
    const anos = [...new Set(this.receitaData.map((item) => item.ano))].sort(
      (a, b) => a - b,
    );
    const categorias = [
      ...new Set(this.receitaData.map((item) => item.categoria)),
    ];

    const treeNodes = categorias.map((categoria) => {
      const nodeData = [{ propertyName: "label", value: categoria }];

      // Adicionar colunas de anos
      anos.forEach((ano) => {
        const dado = this.receitaData.find(
          (d) => d.categoria === categoria && d.ano === ano,
        );
        const valorReceitaLiquida = dado?.receitaLiquida || 0;

        nodeData.push({
          propertyName: `ano_${ano}`,
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(valorReceitaLiquida, "R$"),
        });
      });

      // Adicionar coluna de variação
      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos);
        nodeData.push({
          propertyName: "variação",
          value: `${variacao}%`,
        });
      }

      return { data: nodeData };
    });

    // Criar linha de totais
    const totalNodeData = [{ propertyName: "label", value: "Total" }];

    anos.forEach((ano) => {
      const totalAno = this.receitaData
        .filter((d) => d.ano === ano)
        .reduce((sum, d) => sum + d.receitaLiquida, 0);

      totalNodeData.push({
        propertyName: `ano_${ano}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAno, "R$"),
      });
    });

    // Adicionar variação total
    if (anos.length >= 2) {
      const totalAnoAnterior = this.receitaData
        .filter((d) => d.ano === anos[0])
        .reduce((sum, d) => sum + d.receitaLiquida, 0);

      const totalAnoAtual = this.receitaData
        .filter((d) => d.ano === anos[anos.length - 1])
        .reduce((sum, d) => sum + d.receitaLiquida, 0);

      const variacaoTotal =
        totalAnoAnterior !== 0
          ? (
              ((totalAnoAtual - totalAnoAnterior) / totalAnoAnterior) *
              100
            ).toFixed(2)
          : "0.00";

      totalNodeData.push({
        propertyName: "variação",
        value: `${variacaoTotal}%`,
      });
    }

    // Adicionar linha de total aos dados
    treeNodes.push({ data: totalNodeData });

    // Configurar colunas
    const defaultColumns = anos.map((ano) => ({
      propertyName: `ano_${ano}`,
      displayName: `Arrecadação Líquida - ${ano}`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "variação",
        displayName: `Variação`,
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

    const valorInicial =
      this.receitaData.find(
        (d) => d.categoria === categoria && d.ano === primeiroAno,
      )?.receitaLiquida ?? 0;

    const valorFinal =
      this.receitaData.find(
        (d) => d.categoria === categoria && d.ano === ultimoAno,
      )?.receitaLiquida ?? 0;

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;

    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.tableContent) {
      console.warn("Nenhum conteúdo de tabela disponível para download");
      return;
    }

    // Extrair anos das colunas padrão
    const anos = this.tableContent.defaultColumns
      .filter((col) => col.propertyName.startsWith("ano_"))
      .map((col) => parseInt(col.propertyName.replace("ano_", "")))
      .sort((a, b) => a - b);

    // Verificar se existe coluna de variação
    const temVariacao = this.tableContent.defaultColumns.some(
      (col) => col.propertyName === "variação",
    );

    // Criar colunas para o Excel
    const columns = [
      {
        key: "categoria",
        label:
          this.tableContent.customColumn.displayName || "Categoria Econômica",
      },
      ...anos.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação Líquida - ${ano}`,
      })),
    ];

    if (temVariacao) {
      const ultimoAno = anos[anos.length - 1];
      columns.push({
        key: "variacao",
        label: `Variação - ${ultimoAno}`,
      });
    }

    const dataForDownload = this.tableContent.data.map((node: TreeNode) => {
      const row: any = {};
      console.log("nodes ", node)
      // Processar cada propriedade do nó
      node.data.forEach((prop: {propertyName: string, value: any}) => {
        const { propertyName, value} = prop;

        if (propertyName === "label") {
          row["categoria"] = value;
        } else if (propertyName.startsWith("ano_")) {
          row[propertyName] = converterToNumber(value);
        } else if (propertyName === "variação") {
          row["variacao"] = replacePorcentage(value);
        }
      });

      return row;
    });

    // Gerar nome do arquivo
    const anoAtual = anos[1];
    const fileName = `Receita_Por_Categoria_${anoAtual}.xlsx`;

    // Exportar
    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
  }
}
