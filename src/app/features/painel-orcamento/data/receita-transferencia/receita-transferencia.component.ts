import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableComponent,
  FlipTableContent,
  TreeNode,
} from "./../../../strategic-projects/flip-table-model/flip-table.component";
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
  IExecucaoOrcamentariaRequest,
  IReceitaTransfereciaCorrenteOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import {
  ChartDataConfig,
  OrgChartHorizontalComponent,
} from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";

@Component({
  selector: "ngx-receita-transferencia",
  templateUrl: "./receita-transferencia.component.html",
  styleUrls: ["./receita-transferencia.component.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class ReceitaTransferenciaComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;
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

  readonly title: string = "Transferências Correntes";

  private receitaTransferenciaCorrente: IReceitaTransfereciaCorrenteOrcamentariaResponse[];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly destroy$ = new Subject<void>();

  chartData: IChartOptions;

  tableContent: FlipTableContent | null = null;

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

  private loadData() {
    this.getTransferenciaCorrente();
  }

  private getTransferenciaCorrente(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._painelService
      .getRceitaPorTransferenciaCorrente(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus =
            this.receitaTransferenciaCorrente.length > 0
              ? RequestStatus.SUCCESS
              : RequestStatus.ERROR;
        }),
      )
      .subscribe({
        next: (res: IReceitaTransfereciaCorrenteOrcamentariaResponse[]) => {
          this.receitaTransferenciaCorrente = res;
          this.processData();
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.receitaTransferenciaCorrente = [];
        },
      });
  }

  private processData(): void {
    const chartData = this.processchartData();

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaTransferenciaCorrente);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processchartData(): IChartOptions {
    return this._chartProcessor.processarDadosComparativo(
      this.receitaTransferenciaCorrente,
      "nome_item_patrimonial",
      "Receita Líquida",
    );
  }

  private processTableData(
    dados: IReceitaTransfereciaCorrenteOrcamentariaResponse[],
  ): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categorias = [
      ...new Set(dados.map((item) => item.nome_item_patrimonial)),
    ].filter(Boolean);

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
        const item = dados.find(
          (d) => d.nome_item_patrimonial === categoria && d.ano === ano,
        );
        const valor = item?.receitaLiquida || 0;

        nodeData.push({
          propertyName: `Arrecadação LI - ${ano.toString()}`,
          value: `${valor
            .toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
            .replace("R$", "")
            .trim()}`,
        });
      });

      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos, dados);
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
        value: `${totalAno
          .toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
          .replace("R$", "")
          .trim()}`,
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

    const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
      propertyName: `Arrecadação LI - ${ano.toString()}`,
      displayName: `Arrecadação Líquida - ${ano.toString()}`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

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
      displayName: "Transferências Correntes",
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
    dados: IReceitaTransfereciaCorrenteOrcamentariaResponse[],
  ): number {
    if (anos.length < 2) return 0;

    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];

    const valorInicial =
      dados.find(
        (d) => d.nome_item_patrimonial === categoria && d.ano === primeiroAno,
      )?.receitaLiquida ?? 0;

    const valorFinal =
      dados.find(
        (d) => d.nome_item_patrimonial === categoria && d.ano === ultimoAno,
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
      .filter((col) => col.propertyName.startsWith("Arrecadação LI -"))
      .map((col) => parseInt(col.propertyName.replace("Arrecadação LI -", "")))
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
          "Transfrências Correntes",
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
        label: `Variação`,
      });
    }

    // Criar dados para download a partir de tableContent.data
    const dataForDownload = this.tableContent.data.map((node) => {
      const row: any = {};

      // Processar cada propriedade do nó
      node.data.forEach((prop) => {
        if (prop.propertyName === "categoria") {
          row["categoria"] = prop.value;
        } else if (prop.propertyName.startsWith("Arrecadação LI -")) {
          const ano = prop.propertyName.replace("Arrecadação LI -", "").trim();
          row[`ano_${ano}`] = prop.value;
        } else if (prop.propertyName === "variação (%)") {
          row["variacao"] = prop.value;
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
