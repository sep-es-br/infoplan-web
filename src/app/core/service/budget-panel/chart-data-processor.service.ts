import { IRevenueExpenseGndTotalBudgetExecutionResponse } from "./../../interfaces/budget-panel/budget-panel";
import { Injectable } from "@angular/core";
import { IChartOptions } from "../../../shared/models/budget-panel/IChartOptions";
import { PieChartData } from "../../../features/budget-panel/org-chart-pie/org-chart-pie.component";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../features/strategic-projects/flip-table-model/flip-table.component";

const CHART_COLORS = [
  "#4DB6D2", "#F58B9B", "#ffd774ff", "#1791DE", "#39d898ff", "#d895ffff",
  "#b9b8b8c2", "#4afad4ff", "#ff6c84ff", "#85cea6ff", "#8EFFFD", "#849299ff",
  "#B67DAD", "#a4d1b8ff", "#A970B6", "#9089E7", "#5E9FCC", "#1BBC9C",
  "#D9AC22", "#F77D00", "#ffaa56", "#8DC394", "#A68AB9"
];

@Injectable({
  providedIn: "root",
})
export class ChartDataProcessorService {
  readonly colors = CHART_COLORS;
  private readonly TOTAL_LABEL = "TOTAL";
  private readonly DEFAULT_SORT_FIELD = "netRevenue";

  // ============================================
  // CHART: DESPESA GND TOTAL
  // ============================================
  criarChartDespesaGndTotal(
    data: IRevenueExpenseGndTotalBudgetExecutionResponse[],
    fieldLabel: string,
    titleChart: string,
  ): IChartOptions | null {
    if (!this.validarDadosIniciais(data, fieldLabel)) return null;

    const anoAtual = this.obterAnoMaisRecente(data);
    if (!anoAtual) return null;

    const dadosAnoAtual = data.filter((d) => d?.year === anoAtual);
    if (dadosAnoAtual.length === 0) {
      console.warn(`Nenhum dado encontrado para o ano ${anoAtual}`);
      return null;
    }

    const categorias = this.extrairCategoriasUnicas(dadosAnoAtual, fieldLabel);
    if (categorias.length === 0) return null;

    return this.construirDatasetsGndTotal(dadosAnoAtual, categorias, fieldLabel, titleChart, anoAtual);
  }

  private construirDatasetsGndTotal(
    data: IRevenueExpenseGndTotalBudgetExecutionResponse[],
    categorias: any[],
    fieldLabel: string,
    titleChart: string,
    ano: number,
  ): IChartOptions | null {
    const config = {
      labels: ["Orçado", "Autorizado", "Empenhado", "Liquidado", "Pago com RAP"],
      campos: ["budgetedValue", "authorizedValue", "committedValue", "liquidatedValue", "paidWithRAPValue"],
      cores: ["#76c6d8", "#F58B9B", "#8FCCA2", "#A671C4", "#FFA948"],
    };

    const datasets = config.labels.map((label, index) => ({
      label,
      data: this.extrairValoresPorCategoria(data, categorias, fieldLabel, [config.campos[index]]),
      backgroundColor: config.cores[index],
      borderColor: config.cores[index],
      borderWidth: 1,
    }));

    if (!this.temDadosValidos(datasets.map((d) => d.data))) {
      console.warn(`Nenhum dado financeiro válido encontrado para ${ano}`);
      return null;
    }

    return { data: { labels: categorias, datasets } };
  }

  // ============================================
  // CHART: LIQUIDADO E PAGO
  // ============================================
  criarChartLiquidadoEPago(
    dados: any[],
    campoLabel: string,
    tituloChart?: string,
  ): IChartOptions | null {
    const anos = this.extrairAnos(dados).sort();
    const categorias = this.extrairCategorias(dados, campoLabel);

    if (anos.length === 0 || categorias.length === 0) {
      console.warn("Dados insuficientes para gerar o gráfico");
      return null;
    }

    const cores = ["#e6bcff", "#A671C4", "#ffc78c", "#FFA948"];
    const datasets = this.criarDatasetsLiquidadoPago(dados, categorias, anos, campoLabel, cores);

    if (!this.temDadosValidos(datasets.map((d) => d.data))) {
      console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
      return null;
    }

    return { data: { labels: categorias, datasets } };
  }

  private criarDatasetsLiquidadoPago(
    dados: any[],
    categorias: any[],
    anos: number[],
    campoLabel: string,
    cores: string[],
  ): any[] {
    const anoRecente = anos[1] || anos[0];
    const anoAnterior = anos[0];

    const config = [
      { label: `Liquidado ${anoRecente}`, campo: "liquidatedValue", ano: anoRecente, cor: cores[0] },
      { label: `Liquidado ${anoAnterior}`, campo: "liquidatedValue", ano: anoAnterior, cor: cores[1] },
      { label: `Pago com RAP ${anoRecente}`, campo: "paidWithRAPValue", ano: anoRecente, cor: cores[2] },
      { label: `Pago com RAP ${anoAnterior}`, campo: "paidWithRAPValue", ano: anoAnterior, cor: cores[3] },
    ];

    return config.map(({ label, campo, ano, cor }) => ({
      label,
      backgroundColor: cor,
      data: categorias.map((categoria) => {
        const items = dados.filter((d) => d[campoLabel] === categoria && d.year === ano);
        return items.reduce((acc, item) => acc + this.extrairValor(item, [campo]), 0);
      }),
    }));
  }

  // ============================================
  // CHART: COMPARATIVO (ANO ÚNICO OU MÚLTIPLOS)
  // ============================================
  processarDadosComparativo(
    dados: any[],
    campoLabel: string,
    labelDataset?: string,
  ): IChartOptions | null {
    if (!dados?.length) {
      console.warn("Nenhum dado disponível para processamento");
      return null;
    }

    const categorias = this.extrairCategorias(dados, campoLabel);
    const anos = this.extrairAnos(dados);

    return anos.length === 1
      ? this.criarChartAnoUnico(dados, categorias, anos[0], campoLabel)
      : this.criarChartMultiploAnos(dados, categorias, anos, campoLabel);
  }

  private criarChartAnoUnico(
    dados: any[],
    categorias: any[],
    ano: number,
    campoLabel: string,
  ): IChartOptions | null {
    const dadosPrevisao = this.extrairDadosPorCategoria(dados, categorias, ano, campoLabel, ["plannedRevenueValue"]);
    const dadosArrecadacao = this.extrairDadosPorCategoria(dados, categorias, ano, campoLabel, ["netRevenue", "netRevenueValue"]);

    if (!this.temDadosValidos([dadosPrevisao, dadosArrecadacao])) {
      console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
      return null;
    }

    return {
      data: {
        labels: categorias,
        datasets: [
          { label: `Previsão ${ano}`, data: dadosPrevisao, backgroundColor: this.colors[1] },
          { label: `Arrecadação ${ano}`, data: dadosArrecadacao, backgroundColor: this.colors[0] },
        ],
      },
    };
  }

  private criarChartMultiploAnos(
    dados: any[],
    categorias: any[],
    anos: number[],
    campoLabel: string,
  ): IChartOptions | null {
    const dadosFiltrados = this.filtrarDadosSemTotal(dados);
    const categoriasFiltradas = this.filtrarCategoriasSemTotal(categorias);
    const datasets = this.criarDatasets(dadosFiltrados, categoriasFiltradas, anos, campoLabel);

    if (!this.temDadosValidos(datasets.map((d) => d.data))) {
      console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
      return null;
    }

    return { data: { labels: categoriasFiltradas, datasets } };
  }

  private criarDatasets(dados: any[], categorias: any[], anos: number[], campoLabel: string): any[] {
    return anos.map((ano, index) => ({
      label: `${ano}`,
      data: this.extrairDadosPorCategoria(dados, categorias, ano, campoLabel, ["netRevenue", "netRevenueValue"]),
      backgroundColor: this.colors[index % this.colors.length],
    }));
  }

  // ============================================
  // PIE CHART
  // ============================================
  processarDadosPieChart(dados: any[], campoNome: string, camposValor: string[]): PieChartData[] {
    if (!dados?.length) return [];

    const dadosAgrupados = this.agruparDadosPieChart(dados, campoNome, camposValor);
    return this.gerarPieChartData(dadosAgrupados);
  }

  criarTabelaPieChart(dados: PieChartData[]): Array<{ categoria: string; valor: number; percentual: number }> {
    if (!dados?.length) return [];

    const total = dados.reduce((sum, item) => sum + item.value, 0);
    return dados.map((item) => ({
      categoria: item.name,
      valor: item.value,
      percentual: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }

  private agruparDadosPieChart(dados: any[], campoNome: string, camposValor: string[]): Map<string, number> {
    const agrupados = new Map<string, number>();

    dados.forEach((item) => {
      const nome = item[campoNome];
      if (!nome) return;

      const valor = this.extrairValor(item, camposValor);
      agrupados.set(nome, (agrupados.get(nome) || 0) + valor);
    });

    return agrupados;
  }

  private gerarPieChartData(dadosAgrupados: Map<string, number>): PieChartData[] {
    return Array.from(dadosAgrupados.entries())
      .map(([name, value], index) => ({
        name,
        value,
        itemStyle: { color: this.colors[index % this.colors.length] },
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  // ============================================
  // FLIP TABLE
  // ============================================
  criarFlipTableComparativo(
    dados: any[],
    campoLabel: string = "name",
    camposValor: string[] = ["value"],
    displayName: string,
  ): FlipTableContent | null {
    if (!dados?.length) {
      console.warn("⚠️ Nenhum dado para criar FlipTable");
      return null;
    }

    const campoLabelFinal = this.validarCampoLabel(dados[0], campoLabel);
    const categorias = this.extrairCategorias(dados, campoLabelFinal);
    const anos = this.extrairAnos(dados);

    if (categorias.length === 0 || anos.length === 0) {
      console.error("❌ Nenhuma categoria ou ano encontrado");
      return null;
    }

    const defaultColumns = this.criarColunasAnos(anos);
    const customColumn = this.criarColunaCategoria(campoLabelFinal, displayName);
    const treeData = this.criarTreeData(categorias, anos, dados, campoLabelFinal, camposValor);

    return { defaultColumns, customColumn, data: treeData };
  }

  private criarColunasAnos(anos: number[]): FlipTableColumn[] {
    return anos.map((ano) => ({
      originalPropertyName: `ano_${ano}`,
      propertyName: `${ano}`,
      displayName: `${ano}`,
      alignment: {
        header: FlipTableAlignment.CENTER,
        data: FlipTableAlignment.RIGHT,
      },
      enableEventClick: true,
    }));
  }

  private criarColunaCategoria(campoLabel: string, displayName: string): FlipTableColumn {
    return {
      originalPropertyName: campoLabel,
      propertyName: "categoria",
      displayName,
      alignment: {
        header: FlipTableAlignment.LEFT,
        data: FlipTableAlignment.LEFT,
      },
      enableEventClick: false,
    };
  }

  private criarTreeData(
    categorias: any[],
    anos: number[],
    dados: any[],
    campoLabel: string,
    camposValor: string[],
  ): TreeNode[] {
    return categorias.map((categoria) => {
      const nodeData = [
        {
          originalPropertyName: campoLabel,
          propertyName: "categoria",
          value: categoria,
        },
        ...anos.map((ano) => {
          const item = dados.find((d) => d[campoLabel] === categoria && d.year === ano);
          return {
            originalPropertyName: `ano_${ano}`,
            propertyName: ano.toString(),
            value: this.extrairValor(item, camposValor).toString(),
          };
        }),
      ];

      return { data: nodeData, children: [], expanded: false };
    });
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================
  private validarDadosIniciais(data: any[], fieldLabel: string): boolean {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("Dados de entrada vazios ou inválidos");
      return false;
    }

    if (!fieldLabel || typeof fieldLabel !== "string") {
      console.warn("FieldLabel é obrigatório e deve ser uma string");
      return false;
    }

    if (!(fieldLabel in data[0])) {
      console.warn(`FieldLabel "${fieldLabel}" não encontrado nos dados`);
      return false;
    }

    return true;
  }

  private obterAnoMaisRecente(data: any[]): number | null {
    const anos = [...new Set(data.map((d) => d.year))].filter(Boolean).sort((a, b) => b - a);

    if (anos.length === 0) {
      console.warn("Nenhum ano válido encontrado nos dados");
      return null;
    }

    return anos[0];
  }

  private extrairCategoriasUnicas(dados: any[], fieldLabel: string): any[] {
    const categorias = [...new Set(dados.map((d) => d[fieldLabel]?.toString() || "").filter(Boolean))];

    if (categorias.length === 0) {
      console.warn("Nenhuma categoria encontrada para gerar o gráfico");
    }

    return categorias;
  }

  private extrairValoresPorCategoria(data: any[], categorias: any[], fieldLabel: string, campos: string[]): number[] {
    return categorias.map((categoria) => {
      const item = data.find((d) => d[fieldLabel]?.toString() === categoria?.toString());
      return this.extrairValor(item, campos);
    });
  }

  private filtrarDadosSemTotal(dados: any[]): any[] {
    return dados
      .filter((item) => item?.nome_item_patrimonial !== this.TOTAL_LABEL)
      .sort((a, b) => (b[this.DEFAULT_SORT_FIELD] || 0) - (a[this.DEFAULT_SORT_FIELD] || 0));
  }

  private filtrarCategoriasSemTotal(categorias: any[]): any[] {
    return categorias.filter((categoria) => categoria !== this.TOTAL_LABEL);
  }

  private extrairDadosPorCategoria(
    dados: any[],
    categorias: any[],
    ano: number,
    campoLabel: string,
    campos: string[],
  ): number[] {
    return categorias.map((categoria) => {
      const item = dados.find((d) => d[campoLabel] === categoria && d.year === ano);
      return this.extrairValor(item, campos);
    });
  }

  private extrairCategorias(dados: any[], campoLabel: string): string[] {
    return [...new Set(dados.filter((i) => i[campoLabel] !== this.TOTAL_LABEL).map((item) => item[campoLabel]))].filter(Boolean);
  }

  private extrairAnos(dados: any[]): number[] {
    if (!dados[0]?.hasOwnProperty("year")) {
      console.warn('⚠️ Campo "ano" não encontrado, usando anos padrão');
      return [2023, 2024];
    }
    return [...new Set(dados.map((item) => item.year))].filter((ano) => ano != null).sort();
  }

  private extrairValor(item: any, campos: string[]): number {
    if (!item) return 0;

    for (const campo of campos) {
      const valor = item[campo];
      if (this.valorEhValido(valor)) {
        return Number(valor) || 0;
      }
    }

    return 0;
  }

  private valorEhValido(valor: any): boolean {
    return valor !== undefined && valor !== null && valor !== "";
  }

  private temDadosValidos(arrays: number[][]): boolean {
    return arrays.some((arr) => arr?.some((valor) => valor > 0));
  }

  private validarCampoLabel(primeiroItem: any, campoLabel: string): string {
    if (!primeiroItem || !primeiroItem.hasOwnProperty(campoLabel)) {
      console.warn(`⚠️ Campo "${campoLabel}" não existe nos dados, usando fallback`);

      const camposDisponiveis = Object.keys(primeiroItem || {});
      const campoNome = camposDisponiveis.find(
        (campo) =>
          campo.toLowerCase().includes("name") ||
          campo.toLowerCase().includes("nome") ||
          campo.toLowerCase().includes("label"),
      );

      return campoNome || "name";
    }

    return campoLabel;
  }
}
