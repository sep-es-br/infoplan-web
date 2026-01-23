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
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ExportDataService } from "../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import {
  ChartDataConfig,
  OrgChartHorizontalComponent,
} from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { table } from "console";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import { converterToNumber, replacePorcentage } from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-receita-origem",
  templateUrl: "./receita-origem.component.html",
  styleUrls: ["./receita-origem.component.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class ReceitaOrigemComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);

  private readonly destroy$ = new Subject<void>();

  readonly title: string = "Receita por Origem";

  chartData!: IChartOptions;
  tableContent: FlipTableContent | null = null;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "5%",
      bottom: "0%",
      containLabel: true,
    },
  };
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
      .getReceitaOrigem(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.receitaOrigemCharData = response;
          this.processData();
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar receita origem:", err);
          this.requestStatus = RequestStatus.ERROR;
        },
      });
  }

  private processData(): void {
    const chartData = this._chartProcessor.processarDadosComparativo(
      this.receitaOrigemCharData,
      "origem",
      "Receita Líquida",
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
      Boolean,
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
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(valor, "R$"),
        });
      });

      // Calcular variação se tiver pelo menos 2 anos
      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos, dados);
        nodeData.push({
          propertyName: "variação (%)",
          value: `${variacao}%`,
        });
      }

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    // Criar linha de totais
    const totalNodeData = [
      {
        propertyName: "categoria",
        value: "Total",
      },
    ];

    anos.forEach((ano) => {
      const totalAno = dados
        .filter((d) => d.ano === ano)
        .reduce((sum, d) => sum + (d.receitaLiquida || 0), 0);

      totalNodeData.push({
        propertyName: `Arrecadação LI - ${ano.toString()}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totalAno, "R$"),
      });
    });

    // Adicionar variação total
    if (anos.length >= 2) {
      const totalAnoAnterior = dados
        .filter((d) => d.ano === anos[0])
        .reduce((sum, d) => sum + (d.receitaLiquida || 0), 0);

      const totalAnoAtual = dados
        .filter((d) => d.ano === anos[anos.length - 1])
        .reduce((sum, d) => sum + (d.receitaLiquida || 0), 0);

      const variacaoTotal =
        totalAnoAnterior !== 0
          ? (
              ((totalAnoAtual - totalAnoAnterior) / totalAnoAnterior) *
              100
            ).toFixed(2)
          : "0.00";

      totalNodeData.push({
        propertyName: "variação (%)",
        value: `${variacaoTotal} %`,
      });
    }

    // Adicionar linha de total aos dados
    treeNodes.push({
      data: totalNodeData,
      children: [],
      expanded: false,
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
    dados: IReceitaOrigemOrcamentariaResponse[],
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
    if (!this.tableContent) {
      console.warn("Nenhum conteúdo de tabela disponível para download");
      return;
    }

    // Extrair anos das colunas padrão
    const anos = this.tableContent.defaultColumns
      .filter((col) => col.propertyName.startsWith("Arrecadação LI -"))
      .map((col) =>
        parseInt(col.propertyName.replace("Arrecadação LI -", "").trim()),
      )
      .sort((a, b) => a - b);

    // Verificar se existe coluna de variação
    const temVariacao = this.tableContent.defaultColumns.some(
      (col) => col.propertyName === "variação (%)",
    );

    // Criar colunas para o Excel
    const columns = [
      {
        key: "categoria",
        label:
          this.tableContent.customColumn.displayName ||
          "Principais Origens de Receita",
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

      node.data.forEach((prop: {propertyName: string, value: any}) => {
        const {propertyName, value} = prop;
        if (propertyName === "categoria") {
          row["categoria"] = value;
        } else if (propertyName.startsWith("Arrecadação LI -")) {
          const ano = propertyName.replace("Arrecadação LI -", "").trim();
          row[`ano_${ano}`] = converterToNumber(value);
        } else if (propertyName === "variação (%)") {
          row["variacao"] = replacePorcentage(value);
        }
      });

      return row;
    });
    const anoInicial = anos[1];
    const anoFinal = anos[anos.length - 1];
    const fileName = `Receita_Realizada_Origem_${anoInicial}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
  }
}
