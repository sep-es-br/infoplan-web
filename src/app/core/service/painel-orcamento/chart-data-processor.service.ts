import { IReceitaDespesaGNDTotalOrcamentariaResponse } from "./../../interfaces/painel-orcamento/painel-orcamento";
import { Injectable } from "@angular/core";
import { IChartOptions } from "../../../shared/models/painel-orcamento/IChartOptions";
import { PieChartData } from "../../../features/painel-orcamento/org-chart-pie/org-chart-pie.component";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../features/strategic-projects/flip-table-model/flip-table.component";

const CHART_COLORS = [
  "#4DB6D2", // azul claro
  "#F58B9B", // rosa
  "#ffd774ff", // dourado
  "#1791DE", // azul médio
  "#39d898ff", // verde-azulado
  "#d895ffff", // roxo
  "#b9b8b8c2", // cinza claro

  // Cores conectadas - variações das originais:
  "#4afad4ff", // entre o azul claro e azul médio
  "#ff6c84ff", // rosa um tom mais suave
  "#85cea6ff", // dourado mais claro
  "#8EFFFD", // azul esverdeado (ponte entre azul e verde)
  "#849299ff", // azul acinzentado (conecta azul com cinza)
  "#B67DAD", // roxo rosado (ponte entre roxo e rosa)
  "#a4d1b8ff", // verde acinzentado (conecta verde com cinza)
  "#A970B6", // PREVISTO
  "#9089E7", // CONTRATADO
  "#5E9FCC", // AUTORIZADO
  "#1BBC9C", // EMPENHADO
  "#D9AC22", // LIQUIDADO
  "#F77D00", // PAGO
  "#ffaa56", // PAGO COM RAP
];

// const CHART_COLORS = [
//   "#4DB6D2",    // Salmão suave - harmoniza com o rosa e amarelo
//   "#F58B9B",    // Roxo médio - ponte entre o roxo e azul
//   "#e4c26b",    // Verde-água forte - complementa os azuis e verdes
//   "#2E88B9",    // Dourado - reforça a família dos amarelos
//   "#77D4B0",    // Coral claro - variação do tom rosa
//   "#A671C4",    // Azul céu - tom pastel para os azuis
//   "#F6D25A",    // Verde menta pastel - contraste suave
//   "#C5C5C5",    // Ameixa claro - tom roxo suavizado
//   "#FFB6C1",    // Rosa claro - para variações mais suaves
//   "#F0E68C",    // Khaki - tom terroso-amarelado
//   "#E6E6FA",    // Lavanda - neutro colorido
//   "#FFDEAD"     // Branco amêndoa - tom creme quente
// ];

@Injectable({
  providedIn: "root",
})
export class ChartDataProcessorService {
  readonly colors = CHART_COLORS;

  criarChartDespesaGndTotal(
    data: IReceitaDespesaGNDTotalOrcamentariaResponse[],
    fieldLabel: string,
    titleChart: string
  ): IChartOptions | null {
    try {
      // Validação inicial dos parâmetros
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("Dados de entrada vazios ou inválidos");
        return null;
      }

      if (!fieldLabel || typeof fieldLabel !== "string") {
        console.warn("FieldLabel é obrigatório e deve ser uma string");
        return null;
      }

      // Encontrar o ano mais recente nos dados (ano atual da consulta)
      const anosDisponiveis = [...new Set(data.map((d) => d.ano))]
        .filter((ano) => ano)
        .sort((a, b) => b - a);

      if (anosDisponiveis.length === 0) {
        console.warn("Nenhum ano válido encontrado nos dados");
        return null;
      }

      const anoAtualConsulta = anosDisponiveis[0]; // Pega o ano mais recente

      // Filtrar dados apenas do ano atual da consulta
      const dadosAnoAtual = data.filter((d) => d?.ano === anoAtualConsulta);

      if (dadosAnoAtual.length === 0) {
        console.warn(`Nenhum dado encontrado para o ano ${anoAtualConsulta}`);
        return null;
      }

      // Verificar se o fieldLabel existe nos dados
      const primeiroItem = dadosAnoAtual[0];
      if (!(fieldLabel in primeiroItem)) {
        console.warn(`FieldLabel "${fieldLabel}" não encontrado nos dados`);
        return null;
      }

      const categorys = [
        ...new Set(
          dadosAnoAtual
            .map((d) => d[fieldLabel]?.toString() || "")
            .filter(Boolean)
        ),
      ];

      if (categorys.length === 0) {
        console.warn("Nenhuma categoria encontrada para gerar o gráfico");
        return null;
      }

      const chartOptions = this.construirDatasetsGndTotal(
        dadosAnoAtual,
        categorys,
        fieldLabel,
        titleChart,
        anoAtualConsulta
      );

      return chartOptions;
    } catch (error) {
      console.error("Erro ao criar gráfico de despesa GND total:", error);
      return null;
    }
  }

  private construirDatasetsGndTotal(
    data: IReceitaDespesaGNDTotalOrcamentariaResponse[],
    categorys: any[],
    fieldLabel: string,
    titleChart: string,
    ano: number
  ): IChartOptions | null {
    try {
      // Definir cores para os datasets #71C273
      const colors = ["#76c6d8", "#F58B9B", "#8FCCA2", "#A671C4", "#FFA948"];
      const datasetLabels = [
        "Orçado",
        "Autorizado",
        "Empenhado",
        "Liquidado",
        "Pago com RAP",
      ];
      const valueFields = [
        "vlr_orcado",
        "vlr_autorizado",
        "vlr_empenhado",
        "vlr_liquidado",
        "vlr_pago_com_rap",
      ];

      const datasets = datasetLabels.map((label, index) => {
        const dataValues = categorys.map((categoria) => {
          const item = data.find(
            (d) => d[fieldLabel]?.toString() === categoria?.toString()
          );

          const valor = this.extrairValor(item, [valueFields[index]]);
          return valor;
        });

        return {
          label: label,
          data: dataValues,
          backgroundColor: colors[index],
          borderColor: colors[index],
          borderWidth: 1,
        };
      });

      // Verificar se há dados válidos
      const todosDados = datasets.flatMap((d) => d.data);
      const temDadosValidos = todosDados.some(
        (valor) => valor !== null && valor !== undefined && valor !== 0
      );

      if (!temDadosValidos) {
        console.warn(`Nenhum dado financeiro válido encontrado para ${ano}`);
        return null;
      }

      return {
        data: {
          labels: categorys,
          datasets: datasets,
        },
      };
    } catch (error) {
      console.error("Erro ao construir datasets:", error);
      return null;
    }
  }

  criarChartLiquidadoEPago(
    dados: any[],
    campoLabel: string,
    tituloChart?: string
  ): IChartOptions | null {
    // Extrair anos únicos dos dados automaticamente
    const anos = [...new Set(dados.map((d) => d.ano))].sort();

    // Extrair categorias únicas automaticamente
    const categorias = [...new Set(dados.map((d) => d[campoLabel]))].filter(
      Boolean
    );

    if (anos.length === 0 || categorias.length === 0) {
      console.warn(`Dados insuficientes para gerar o gráfico`);
      return null;
    }

    // DEFINIR CORES CONSISTENTEMENTE d390f9 A671C4 ffc78c
    const cores = [
      "#e6bcff", // azul claro - Liquidado 2025
      "#A671C4", // rosa - Liquidado 2024
      "#ffc78c", // dourado - Pago com RAP 2025
      "#FFA948", // azul médio - Pago com RAP 2024
    ];

    const datasets = [
      {
        label: `Liquidado ${anos[1] || anos[0]}`,
        data: categorias.map((categoria) => {
          const items = dados.filter(
            (d) => d[campoLabel] === categoria && d.ano === (anos[1] || anos[0])
          );
          return items.reduce(
            (acc, item) => acc + this.extrairValor(item, ["vlr_liquidado"]),
            0
          );
        }),
        backgroundColor: cores[0],
      },
      {
        label: `Liquidado ${anos[0]}`,
        data: categorias.map((categoria) => {
          const items = dados.filter(
            (d) => d[campoLabel] === categoria && d.ano === anos[0]
          );
          return items.reduce(
            (acc, item) => acc + this.extrairValor(item, ["vlr_liquidado"]),
            0
          );
        }),
        backgroundColor: cores[1],
      },
      {
        label: `Pago com RAP ${anos[1] || anos[0]}`,
        data: categorias.map((categoria) => {
          const items = dados.filter(
            (d) => d[campoLabel] === categoria && d.ano === (anos[1] || anos[0])
          );
          return items.reduce(
            (acc, item) => acc + this.extrairValor(item, ["vlr_pago_com_rap"]),
            0
          );
        }),
        backgroundColor: cores[2],
      },
      {
        label: `Pago com RAP ${anos[0]}`,
        data: categorias.map((categoria) => {
          const items = dados.filter(
            (d) => d[campoLabel] === categoria && d.ano === anos[0]
          );
          return items.reduce(
            (acc, item) => acc + this.extrairValor(item, ["vlr_pago_com_rap"]),
            0
          );
        }),
        backgroundColor: cores[3],
      },
    ];

    if (!this.temDadosValidos(datasets.map((d) => d.data))) {
      console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
      return null;
    }

    return {
      data: {
        labels: categorias,
        datasets: datasets,
      },
    };
  }

  processarDadosComparativo(
    dados: any[],
    campoLabel: string,
    labelDataset?: string
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
    campoLabel: string
  ): IChartOptions | null {
    const dadosPrevisao = this.extrairDadosPorCategoria(
      dados,
      categorias,
      ano,
      campoLabel,
      "vlr_receita_prevista"
    );

    const dadosArrecadacao = this.extrairDadosPorCategoria(
      dados,
      categorias,
      ano,
      campoLabel,
      "receitaLiquida",
      "vlr_receita_liquida"
    );

    if (!this.temDadosValidos([dadosPrevisao, dadosArrecadacao])) {
      console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
      return null;
    }

    return {
      data: {
        labels: categorias,
        datasets: [
          {
            label: `${ano}`,
            data: dadosPrevisao,
            backgroundColor: this.colors[1],
          },
          {
            label: `${ano}`,
            data: dadosArrecadacao,
            backgroundColor: this.colors[0],
          },
        ],
      },
    };
  }

  private criarChartMultiploAnos(
    dados: any[],
    categorias: any[],
    anos: number[],
    campoLabel: string
  ): IChartOptions | null {
    const dadosArray = [...dados].sort((a,b) => (b.receitaLiquida || 0) - (a.receitaLiquida || 0))
    const datasets = anos.map((ano, index) => {
      const dadosAno = this.extrairDadosPorCategoria(
        dadosArray,
        categorias,
        ano,
        campoLabel,
        "receitaLiquida",
        "vlr_receita_liquida"
      );

      return {
        label: `${ano}`,
        data: dadosAno,
        backgroundColor: this.colors[index % this.colors.length],
      };
    });

    if (!this.temDadosValidos(datasets.map((d) => d.data))) {
      console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
      return null;
    }

    return {
      data: {
        labels: categorias,
        datasets: datasets,
      },
    };
  }

  private extrairDadosPorCategoria(
    dados: any[],
    categorias: any[],
    ano: number,
    campoLabel: string,
    ...campos: string[]
  ): number[] {
    console.log("extraindo por categoria: ", dados)
    return categorias.map((categoria) => {
      const item = dados.find(
        (item) => item[campoLabel] === categoria && item.ano === ano
      );
      return this.extrairValor(item, campos);
    });
  }

  processarDadosPieChart(
    dados: any[],
    campoNome: string,
    camposValor: string[]
  ): PieChartData[] {
    if (!dados?.length) {
      return [];
    }

    const dadosAgrupados = this.agruparDadosPieChart(
      dados,
      campoNome,
      camposValor
    );
    return this.gerarPieChartData(dadosAgrupados);
  }

  criarTabelaPieChart(
    dados: PieChartData[]
  ): Array<{ categoria: string; valor: number; percentual: number }> {
    if (!dados?.length) return [];

    const total = dados.reduce((sum, item) => sum + item.value, 0);

    return dados.map((item) => ({
      categoria: item.name,
      valor: item.value,
      percentual: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }

  private agruparDadosPieChart(
    dados: any[],
    campoNome: string,
    camposValor: string[]
  ): Map<string, number> {
    const dadosAgrupados = new Map<string, number>();

    dados.forEach((item) => {
      const nome = item[campoNome];
      if (!nome) return;

      const valor = this.extrairValor(item, camposValor);

      if (dadosAgrupados.has(nome)) {
        dadosAgrupados.set(nome, dadosAgrupados.get(nome)! + valor);
      } else {
        dadosAgrupados.set(nome, valor);
      }
    });

    return dadosAgrupados;
  }

  private gerarPieChartData(
    dadosAgrupados: Map<string, number>
  ): PieChartData[] {
    const pieData: PieChartData[] = Array.from(dadosAgrupados.entries())
      .map(([name, value], index) => ({
        name,
        value,
        itemStyle: {
          color: this.colors[index % this.colors.length],
        },
      }))
      .filter((item) => item.value > 0);

    console.log("Pie Chart Data:", pieData);
    return pieData.sort((a, b) => b.value - a.value);
  }

  private temDadosValidos(arrays: number[][]): boolean {
    return arrays.some((arr) => arr?.some((valor) => valor > 0));
  }

  criarFlipTableComparativo(
    dados: any[],
    campoLabel: string = "name", // Campo padrão corrigido
    camposValor: string[] = ["value"],
    displayName: string
  ): FlipTableContent | null {
    // Validação inicial
    if (!dados?.length) {
      console.warn("⚠️ Nenhum dado para criar FlipTable");
      return null;
    }

    // Verificar se o campo existe - com fallback
    const primeiroItem = dados[0];
    let campoLabelFinal = campoLabel;

    if (!primeiroItem || !primeiroItem.hasOwnProperty(campoLabel)) {
      console.warn(
        `⚠️ Campo "${campoLabel}" não existe nos dados, usando fallback`
      );

      // Tentar encontrar campo similar
      const camposDisponiveis = Object.keys(primeiroItem || {});
      const campoNome = camposDisponiveis.find(
        (campo) =>
          campo.toLowerCase().includes("name") ||
          campo.toLowerCase().includes("nome") ||
          campo.toLowerCase().includes("label")
      );

      campoLabelFinal = campoNome || "name";
    }

    const categorias = this.extrairCategorias(dados, campoLabelFinal);
    const anos = this.extrairAnos(dados);

    if (categorias.length === 0 || anos.length === 0) {
      console.error("❌ Nenhuma categoria ou ano encontrado");
      return null;
    }

    // Criar colunas dinâmicas (uma para cada ano)
    const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
      originalPropertyName: `ano_${ano}`,
      propertyName: `${ano}`,
      displayName: `${ano}`,
      alignment: {
        header: FlipTableAlignment.CENTER,
        data: FlipTableAlignment.RIGHT,
      },
      enableEventClick: true,
    }));

    // Coluna customizada (categoria)
    const customColumn: FlipTableColumn = {
      originalPropertyName: campoLabelFinal,
      propertyName: "categoria",
      displayName: `${displayName}`,
      alignment: {
        header: FlipTableAlignment.LEFT,
        data: FlipTableAlignment.LEFT,
      },
      enableEventClick: false,
    };

    // Criar dados no formato TreeNode
    const treeData: Array<TreeNode> = categorias.map((categoria) => {
      const nodeData = [
        {
          originalPropertyName: campoLabelFinal,
          propertyName: "categoria",
          value: categoria,
        },
      ];

      // Adicionar valores para cada ano
      anos.forEach((ano) => {
        const item = dados.find(
          (d) => d[campoLabelFinal] === categoria && d.ano === ano
        );

        nodeData.push({
          originalPropertyName: `ano_${ano}`,
          propertyName: ano.toString(),
          value: this.extrairValor(item, camposValor).toString(),
        });
      });

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    return {
      defaultColumns,
      customColumn,
      data: treeData,
    };
  }

  // Métodos auxiliares atualizados
  private extrairCategorias(dados: any[], campoLabel: string): string[] {
    return [...new Set(dados.map((item) => item[campoLabel]))].filter(Boolean);
  }

  private extrairAnos(dados: any[]): number[] {
    // Se não houver campo 'ano', usar anos padrão
    if (!dados[0]?.hasOwnProperty("ano")) {
      console.warn('⚠️ Campo "ano" não encontrado, usando anos padrão');
      return [2023, 2024]; // Anos padrão
    }
    return [...new Set(dados.map((item) => item.ano))]
      .filter((ano) => ano != null)
      .sort();
  }

  private extrairValor(item: any, campos: string[]): number {
    if (!item) return 0;

    for (const campo of campos) {
      const valor = item[campo];
      if (valor !== undefined && valor !== null && valor !== "") {
        return Number(valor) || 0;
      }
    }

    return 0;
  }
}
