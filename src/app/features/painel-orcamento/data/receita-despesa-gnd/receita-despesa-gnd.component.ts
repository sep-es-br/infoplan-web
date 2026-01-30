
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
  IExecucaoOrcamentariaRequest,
  IReceitaDespesaGNDOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
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
import { converterToNumber, replacePorcentage } from "../../../../@core/utils/functionts/functionts";

@Component({
  selector: "ngx-receita-despesa-gnd",
  templateUrl: "./receita-despesa-gnd.component.html",
  styleUrls: ["./receita-despesa-gnd.component.scss"],
})
export class ReceitaDespesaGndComponent
  implements OnChanges, OnDestroy
{
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "Despesa por GND";

  private receitaDespesaOrcamento:
    | IReceitaDespesaGNDOrcamentariaResponse[]
    | null = [];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly destroy$ = new Subject<void>();

  public toggleExecutivo = true;
  public toggleDemaisPoderes = true;

  chartData: IChartOptions;
  tableContent: FlipTableContent | null = null;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "20%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

  dataReceitaDespesaGNDOrcamentariaCards:
    | IReceitaDespesaGNDOrcamentariaResponse[]
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
    this.getReceitaDespesaGND();
  }

  private getReceitaDespesaGND(): void {
    this.requestStatus = RequestStatus.LOADING;

    this._painelService
      .getRceitaPorDespesaGND(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: IReceitaDespesaGNDOrcamentariaResponse[]) => {
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
    if (!this.toggleExecutivo && !this.toggleDemaisPoderes) {
      if (toggle === "executivo") {
        this.toggleExecutivo = true;
      } else {
        this.toggleDemaisPoderes = true;
      }
      return;
    }

    this.updateFilterPoderes();
    this.getReceitaDespesaGND();
  }

  private updateFilterPoderes(): void {
    const poderes: string[] = [];
    if (this.toggleExecutivo) {
      poderes.push("1");
    }

    if (this.toggleDemaisPoderes) {
      poderes.push("2");
    }

    this.filter.codPoder = poderes.join(",");
    this.getReceitaDespesaGND();
  }

  public isAtLeastOneToggleActive(): boolean {
    return this.toggleExecutivo || this.toggleDemaisPoderes;
  }

  private processData(data: IReceitaDespesaGNDOrcamentariaResponse[]): void {
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

  private processChartData(data: IReceitaDespesaGNDOrcamentariaResponse[]): IChartOptions {
    return this._chartProcessor.criarChartLiquidadoEPago(
      data,
      "nome_gnd",
      "Despesas por GND",
    );
  }

  private processTableData(
    dados: IReceitaDespesaGNDOrcamentariaResponse[],
  ): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categoriasBase = [
      ...new Set(dados.map((item) => item.nome_gnd)),
    ].filter(Boolean);

    const anos = [...new Set(dados.map((item) => item.ano))]
      .filter((a) => a != null)
      .sort();

    if (categoriasBase.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const mapaValores = new Map();
    const totaisPorCategoria = new Map<string, number>();

    dados.forEach((item) => {
      const chave = `${item.nome_gnd}_${item.ano}`;
      const liq = item.vlr_liquidado || 0;
      const pago = item.vlr_pago_com_rap || 0;

      const atual = mapaValores.get(chave) || { liq: 0, pago: 0 };
      mapaValores.set(chave, { liq: atual.liq + liq, pago: atual.pago + pago });

      const totalLiq = totaisPorCategoria.get(item.nome_gnd) || 0;
      totaisPorCategoria.set(item.nome_gnd, totalLiq + liq);
    });

    const categoriasOrdenadas = categoriasBase.sort((a, b) => {
      return (
        (totaisPorCategoria.get(b) || 0) - (totaisPorCategoria.get(a) || 0)
      );
    });

    const treeNodes: TreeNode[] = categoriasOrdenadas.map((categoria) => {
      const nodeData = [{ propertyName: "categoria", value: categoria }];

      anos.forEach((ano) => {
        const valores = mapaValores.get(`${categoria}_${ano}`) || {
          liq: 0,
          pago: 0,
        };

        nodeData.push({
          propertyName: `Despesa Liquidada - ${ano}`,
          value: this._utilitiesService
            .formatCurrencyUsingBrazilianStandards(valores.liq, "R$")
        });

        nodeData.push({
          propertyName: `Pago com RAP - ${ano}`,
          value: this._utilitiesService
            .formatCurrencyUsingBrazilianStandards(valores.pago, "R$")
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
          )}%`,
        });
        nodeData.push({
          propertyName: "Variação Pago RAP",
          value: `${this.calcularVariacao(
            categoria,
            anos,
            dados,
            "pago_rap",
          )}%`,
        });
      }

      return { data: nodeData, children: [], expanded: false };
    });

    // Criar linha de totais
    const totalNodeData = [
      {
        propertyName: "categoria",
        value: "Total",
      },
    ];

    anos.forEach((ano) => {
      const totaisAno = dados
        .filter((d) => d.ano === ano)
        .reduce(
          (acc, d) => ({
            liq: acc.liq + (d.vlr_liquidado || 0),
            pago: acc.pago + (d.vlr_pago_com_rap || 0),
          }),
          { liq: 0, pago: 0 },
        );

      totalNodeData.push({
        propertyName: `Despesa Liquidada - ${ano}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totaisAno.liq, "R$"),
      });

      totalNodeData.push({
        propertyName: `Pago com RAP - ${ano}`,
        value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(totaisAno.pago, "R$")
      });
    });

    // Adicionar variações totais
    if (anos.length >= 2) {
      const totaisAnoAnterior = dados
        .filter((d) => d.ano === anos[0])
        .reduce(
          (acc, d) => ({
            liq: acc.liq + (d.vlr_liquidado || 0),
            pago: acc.pago + (d.vlr_pago_com_rap || 0),
          }),
          { liq: 0, pago: 0 },
        );

      const totaisAnoAtual = dados
        .filter((d) => d.ano === anos[anos.length - 1])
        .reduce(
          (acc, d) => ({
            liq: acc.liq + (d.vlr_liquidado || 0),
            pago: acc.pago + (d.vlr_pago_com_rap || 0),
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
        value: `${variacaoLiquidado}%`,
      });

      totalNodeData.push({
        propertyName: "Variação Pago RAP",
        value: `${variacaoPago}%`,
      });
    }

    // Adicionar linha de total aos dados
    treeNodes.push({
      data: totalNodeData,
      children: [],
      expanded: false,
    });

    const defaultColumns: FlipTableColumn[] = [];

    anos.forEach((ano) => {
      defaultColumns.push({
        propertyName: `Despesa Liquidada - ${ano.toString()}`,
        displayName: `Despesa Liquidada - ${ano.toString()} (R$)`,
        alignment: {
          header: FlipTableAlignment.RIGHT,
          data: FlipTableAlignment.RIGHT,
        },
      });

      defaultColumns.push({
        propertyName: `Pago com RAP - ${ano.toString()}`,
        displayName: `Pago com RAP - ${ano.toString()} (R$)`,
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
    dados: IReceitaDespesaGNDOrcamentariaResponse[],
    tipo: "liquidado" | "pago_rap",
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

      node.data.forEach((prop: { propertyName: string, value: string | "" }) => {

        const  { propertyName, value } =  prop;

        if (propertyName === "categoria") {
          row["categoria"] = value;
        } else if (propertyName.startsWith("Despesa Liquidada -")) {
          const ano = propertyName
            .replace("Despesa Liquidada -", "")
            .trim();
          row[`liquidado_${ano}`] = converterToNumber(value);
        } else if (propertyName.startsWith("Pago com RAP -")) {
          const ano = propertyName.replace("Pago com RAP -", "").trim();
          row[`pago_rap_${ano}`] = converterToNumber(value);;
        } else if (propertyName === "Variação Liquidado") {
          row["variacao_liquidado"] = replacePorcentage(value);;
        } else if (propertyName === "Variação Pago RAP") {
          row["variacao_pago_rap"] = replacePorcentage(value);;
        }
      });

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
