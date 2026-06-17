import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  IBudgetExecutionRequest,
  IRevenueExpenseGndBudgetExecutionResponse,
} from "../../../../core/interfaces/budget-panel/budget-panel";
import { BudgetPanelService } from "../../../../core/service/budget-panel/budget-panel.service";
import { ChartDataProcessorService } from "../../../../core/service/budget-panel/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/budget-panel/IChartOptions";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { finalize, takeUntil } from "rxjs/operators";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { ChartDataConfig } from "../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { RequestStatus } from "../../../strategic-projects/strategicProjects.component";
import { UtilitiesService } from "../../../../core/service/utilities.service";
import {
  converterToNumber,
  replacePorcentage,
} from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-revenue-expense-gnd",
  templateUrl: "./revenue-expense-gnd.component.html",
  styleUrls: ["./revenue-expense-gnd.component.scss"],
})
export class RevenueExpenseGndComponent implements OnChanges, OnDestroy {
  @Input() filter!: IBudgetExecutionRequest;

  readonly title: string = "Despesa por GND";

  private receitaDespesaOrcamento:
    | IRevenueExpenseGndBudgetExecutionResponse[]
    | null = [];

  private readonly _painelService = inject(BudgetPanelService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly destroy$ = new Subject<void>();

  public toggleExecutivo = true;
  public toggleDemaisPoderes = true;

  chartData!: IChartOptions;
  tableContent: FlipTableContent | null = null;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "20%",
      left: "1%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

  dataRevenueExpenseGndOrcamentariaCards:
    | IRevenueExpenseGndBudgetExecutionResponse[]
    | null = [];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
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
    this.getRevenueExpenseGnd();
  }

  private getRevenueExpenseGnd(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._painelService
      .getRevenueByExpenseGND(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: IRevenueExpenseGndBudgetExecutionResponse[]) => {
          this.receitaDespesaOrcamento = res;
          this.processData(this.receitaDespesaOrcamento);
          this.requestStatus = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar receita despesa GND:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.receitaDespesaOrcamento = [];
        },
      });
  }

  public onToggleChange(toggle: "executivo" | "demaisPoderes"): void {
    // Se ambos ficaram false, força o OUTRO toggle a ficar true
    if (!this.toggleExecutivo && !this.toggleDemaisPoderes) {
      if (toggle === "executivo") {
        this.toggleDemaisPoderes = true; // Força o OUTRO
      } else {
        this.toggleExecutivo = true; // Força o OUTRO
      }
    }

    this.updateFilterPoderes();
  }

  private updateFilterPoderes(): void {
    const poderes: string[] = [];
    if (this.toggleExecutivo) {
      poderes.push("1");
    }

    if (this.toggleDemaisPoderes) {
      poderes.push("2");
    }

    this.filter.branchCode = poderes.join(",");
    this.getRevenueExpenseGnd();
  }
  public isAtLeastOneToggleActive(): boolean {
    return this.toggleExecutivo || this.toggleDemaisPoderes;
  }

  private processData(data: IRevenueExpenseGndBudgetExecutionResponse[]): void {
    const chartData: IChartOptions = this.processChartData(data);
    let dadosFiltrados = [...this.receitaDespesaOrcamento];

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaDespesaOrcamento);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processChartData(
    data: IRevenueExpenseGndBudgetExecutionResponse[],
  ): IChartOptions {
    return this._chartProcessor.criarChartLiquidadoEPago(
      data,
      "gndName",
      "Despesas por GND",
    );
  }

  private processTableData(
    dados: IRevenueExpenseGndBudgetExecutionResponse[],
  ): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categoriasBase = [
      ...new Set(dados.map((item) => item.gndName)),
    ].filter(Boolean);

    const anos = [...new Set(dados.map((item) => item.year))]
      .filter((a) => a != null)
      .sort();

    if (categoriasBase.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const mapaValores = new Map();
    const totaisPorCategoria = new Map<string, number>();

    dados.forEach((item) => {
      const chave = `${item.gndName}_${item.year}`;
      const liq = item.liquidatedValue || 0;
      const pago = item.paidWithRAPValue || 0;

      const atual = mapaValores.get(chave) || { liq: 0, pago: 0 };
      mapaValores.set(chave, { liq: atual.liq + liq, pago: atual.pago + pago });

      const totalLiq = totaisPorCategoria.get(item.gndName) || 0;
      totaisPorCategoria.set(item.gndName, totalLiq + liq);
    });

    const categoriasOrdenadas = categoriasBase.sort((a, b) => {
      return (
        (totaisPorCategoria.get(b) || 0) - (totaisPorCategoria.get(a) || 0)
      );
    });

    const treeNodes: TreeNode[] = categoriasOrdenadas.map((categoria) => {
      const nodeData = [{ propertyName: "categoria", value: categoria }];

      anos.forEach((year) => {
        const valores = mapaValores.get(`${categoria}_${year}`) || {
          liq: 0,
          pago: 0,
        };

        nodeData.push({
          propertyName: `Despesa Liquidada - ${year}`,
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            valores.liq,
            "R$",
          ),
        });

        nodeData.push({
          propertyName: `Pago com RAP - ${year}`,
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
            valores.pago,
            "R$",
          ),
        });
      });

      if (anos.length >= 2) {
        nodeData.push({
          propertyName: "Variação Liquidado",
          value: `${this.calcularVariacao(
            categoria,
            anos,
            dados,
            "liquidado",
          )} %`,
        });
        nodeData.push({
          propertyName: "Variação Pago RAP",
          value: `${this.calcularVariacao(
            categoria,
            anos,
            dados,
            "pago_rap",
          )} %`,
        });
      }

      return { data: nodeData, children: [], expanded: false };
    });

    const totalNodeData = [
      {
        propertyName: "categoria",
        value: "Total",
      },
    ];

    anos.forEach((year) => {
      const totaisAno = dados
        .filter((d) => d.year === year)
        .reduce(
          (acc, d) => ({
            liq: acc.liq + (d.liquidatedValue || 0),
            pago: acc.pago + (d.paidWithRAPValue || 0),
          }),
          { liq: 0, pago: 0 },
        );

      totalNodeData.push({
        propertyName: `Despesa Liquidada - ${year}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
          totaisAno.liq,
          "R$",
        ),
      });

      totalNodeData.push({
        propertyName: `Pago com RAP - ${year}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(
          totaisAno.pago,
          "R$",
        ),
      });
    });

    if (anos.length >= 2) {
      const totaisAnoAnterior = dados
        .filter((d) => d.year === anos[0])
        .reduce(
          (acc, d) => ({
            liq: acc.liq + (d.liquidatedValue || 0),
            pago: acc.pago + (d.paidWithRAPValue || 0),
          }),
          { liq: 0, pago: 0 },
        );

      const totaisAnoAtual = dados
        .filter((d) => d.year === anos[anos.length - 1])
        .reduce(
          (acc, d) => ({
            liq: acc.liq + (d.liquidatedValue || 0),
            pago: acc.pago + (d.paidWithRAPValue || 0),
          }),
          { liq: 0, pago: 0 },
        );

      const variacaoLiquidado =
        totaisAnoAnterior.liq !== 0
          ? (
            ((totaisAnoAtual.liq - totaisAnoAnterior.liq) /
              totaisAnoAnterior.liq) *
            100
          ).toFixed(2)
          : "0.00";

      const variacaoPago =
        totaisAnoAnterior.pago !== 0
          ? (
            ((totaisAnoAtual.pago - totaisAnoAnterior.pago) /
              totaisAnoAnterior.pago) *
            100
          ).toFixed(2)
          : "0.00";

      totalNodeData.push({
        propertyName: "Variação Liquidado",
        value: `${variacaoLiquidado} %`,
      });

      totalNodeData.push({
        propertyName: "Variação Pago RAP",
        value: `${variacaoPago} %`,
      });
    }

    treeNodes.push({
      data: totalNodeData,
      children: [],
      expanded: false,
    });

    const defaultColumns: FlipTableColumn[] = [];

    anos.forEach((year) => {
      defaultColumns.push({
        propertyName: `Despesa Liquidada - ${year.toString()}`,
        displayName: `Despesa Liquidada - ${year.toString()} (R$)`,
        alignment: {
          header: FlipTableAlignment.RIGHT,
          data: FlipTableAlignment.RIGHT,
        },
      });

      defaultColumns.push({
        propertyName: `Pago com RAP - ${year.toString()}`,
        displayName: `Pago com RAP - ${year.toString()} (R$)`,
        alignment: {
          header: FlipTableAlignment.RIGHT,
          data: FlipTableAlignment.RIGHT,
        },
      });
    });

    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "Variação Liquidado",
        displayName: "Variação Liquidado",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      });

      defaultColumns.push({
        propertyName: "Variação Pago RAP",
        displayName: "Variação Pago RAP",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
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
    dados: IRevenueExpenseGndBudgetExecutionResponse[],
    tipo: "liquidado" | "pago_rap",
  ): number {
    if (anos.length < 2) return 0;

    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];

    const propriedade =
      tipo === "liquidado" ? "liquidatedValue" : "paidWithRAPValue";

    const valorInicial = dados
      .filter((d) => d.gndName === categoria && d.year === primeiroAno)
      .reduce((acc, item) => acc + (item[propriedade] || 0), 0);

    const valorFinal = dados
      .filter((d) => d.gndName === categoria && d.year === ultimoAno)
      .reduce((acc, item) => acc + (item[propriedade] || 0), 0);

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;
    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.tableContent) return;

    const anos = this.tableContent.defaultColumns
      .filter((col) => col.propertyName.startsWith("Despesa Liquidada -"))
      .map((col) =>
        parseInt(col.propertyName.replace("Despesa Liquidada -", "").trim()),
      )
      .sort((a, b) => a - b);

    const temVariacao = this.tableContent.defaultColumns.some(
      (col) => col.propertyName === "Variação Liquidado",
    );

    const columns = [
      {
        key: "categoria",
        label:
          this.tableContent.customColumn.displayName ||
          "Grupo de Natureza da Despesa",
      },
    ];

    anos.forEach((ano) => {
      columns.push(
        { key: `liquidado_${ano}`, label: `Despesa Liquidada - ${ano} (R$)` },
        { key: `pago_rap_${ano}`, label: `Pago com RAP - ${ano} (R$)` },
      );
    });

    if (temVariacao) {
      columns.push(
        { key: "variacao_liquidado", label: "Variação Liquidado" },
        { key: "variacao_pago_rap", label: "Variação Pago RAP" },
      );
    }

    const dataForDownload = this.tableContent.data.map((node: TreeNode) => {
      const row: any = {};

      node.data.forEach(
        (prop: { propertyName: string; value: string | "" }) => {
          const { propertyName, value } = prop;

          if (propertyName === "categoria") {
            row["categoria"] = value;
          } else if (propertyName.startsWith("Despesa Liquidada -")) {
            const ano = propertyName.replace("Despesa Liquidada -", "").trim();
            row[`liquidado_${ano}`] = converterToNumber(value);
          } else if (propertyName.startsWith("Pago com RAP -")) {
            const ano = propertyName.replace("Pago com RAP -", "").trim();
            row[`pago_rap_${ano}`] = converterToNumber(value);
          } else if (propertyName === "Variação Liquidado") {
            row["variacao_liquidado"] = replacePorcentage(value);
          } else if (propertyName === "Variação Pago RAP") {
            row["variacao_pago_rap"] = replacePorcentage(value);
          }
        },
      );

      return row;
    });

    const anoInicial = anos[1];
    const fileName = `Despesa_GND_${anoInicial}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName,
    );
  }
}
