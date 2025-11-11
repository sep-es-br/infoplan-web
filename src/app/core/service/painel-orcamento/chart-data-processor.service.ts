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
  "#F58B9B",
  "#4DB6D2",
  "#e4c26b",
  "#2E88B9",
  "#77D4B0",
  "#A671C4",
  "#F6D25A",
];

@Injectable({
  providedIn: "root",
})
export class ChartDataProcessorService {
  readonly colors = CHART_COLORS;

  // private createChartLiquidatedAndPaid(
  //   data: any[],
  //   categorys: any[],
  //   years: number[],
  //   fieldLabel: string
  // ): IChartOptions | null {
  //   const datasets = [
  //     {
  //       label: `Liquidado ${years[1]}`, // 2025
  //       data: categorys.map((category) => {
  //         const item = data.find(
  //           (d) => d[fieldLabel] === category && d.ano === years[1]
  //         );
  //         return this.extrairValor(item, ["vlr_liquidado"]);
  //       }),
  //       backgroundColor: this.colors[0],
  //     },
  //     {
  //       label: `Liquidado ${years[0]}`, // 2024
  //       data: categorys.map((category) => {
  //         const item = data.find(
  //           (d) => d[fieldLabel] === category && d.ano === years[0]
  //         );
  //         return this.extrairValor(item, ["vlr_liquidado"]);
  //       }),
  //       backgroundColor: this.colors[1],
  //     },
  //     {
  //       label: `Pago com RAP ${years[1]}`, // 2025
  //       data: categorys.map((category) => {
  //         const item = data.find(
  //           (d) => d[fieldLabel] === category && d.ano === years[1]
  //         );
  //         return this.extrairValor(item, ["vlr_pago_com_rap"]);
  //       }),
  //       backgroundColor: this.colors[2],
  //     },
  //     {
  //       label: `Pago com RAP ${years[0]}`, // 2024
  //       data: categorys.map((category) => {
  //         const item = data.find(
  //           (d) => d[fieldLabel] === category && d.ano === years[0]
  //         );
  //         return this.extrairValor(item, ["vlr_pago_com_rap"]);
  //       }),
  //       backgroundColor: this.colors[3],
  //     },
  //   ];

  //   if (!this.temDadosValidos(datasets.map((d) => d.data))) {
  //     console.warn(`Nenhum dado financeiro encontrado para ${fieldLabel}`);
  //     return null;
  //   }

  //   return {
  //     data: {
  //       labels: categorys,
  //       datasets: datasets,
  //     },
  //   };
  // }

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

    const datasets = [
      {
        label: `Liquidado ${anos[1] || anos[0]}`, // 2025 ou último ano
        data: categorias.map((categoria) => {
          const item = dados.find(
            (d) => d[campoLabel] === categoria && d.ano === (anos[1] || anos[0])
          );
          return this.extrairValor(item, ["vlr_liquidado"]);
        }),
        backgroundColor: this.colors[0],
      },
      {
        label: `Liquidado ${anos[0]}`, // 2024 ou primeiro ano
        data: categorias.map((categoria) => {
          const item = dados.find(
            (d) => d[campoLabel] === categoria && d.ano === anos[0]
          );
          return this.extrairValor(item, ["vlr_liquidado"]);
        }),
        backgroundColor: this.colors[1],
      },
      {
        label: `Pago com RAP ${anos[1] || anos[0]}`, // 2025 ou último ano
        data: categorias.map((categoria) => {
          const item = dados.find(
            (d) => d[campoLabel] === categoria && d.ano === (anos[1] || anos[0])
          );
          return this.extrairValor(item, ["vlr_pago_com_rap"]);
        }),
        backgroundColor: this.colors[2],
      },
      {
        label: `Pago com RAP ${anos[0]}`, // 2024 ou primeiro ano
        data: categorias.map((categoria) => {
          const item = dados.find(
            (d) => d[campoLabel] === categoria && d.ano === anos[0]
          );
          return this.extrairValor(item, ["vlr_pago_com_rap"]);
        }),
        backgroundColor: this.colors[3],
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

    if (!anos.length) {
      console.warn("Nenhum ano encontrado nos dados");
      return null;
    }

    return anos.length === 1
      ? this.criarChartAnoUnico(dados, categorias, anos[0], campoLabel)
      : this.criarChartMultiploAnos(dados, categorias, anos, campoLabel);
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
            label: `Previsão ${ano}`,
            data: dadosPrevisao,
            backgroundColor: this.colors[0],
          },
          {
            label: `Arrecadação ${ano}`,
            data: dadosArrecadacao,
            backgroundColor: this.colors[1],
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
    const datasets = anos.map((ano, index) => {
      const dadosAno = this.extrairDadosPorCategoria(
        dados,
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
    return categorias.map((categoria) => {
      const item = dados.find(
        (item) => item[campoLabel] === categoria && item.ano === ano
      );
      return this.extrairValor(item, campos);
    });
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

    return pieData.sort((a, b) => b.value - a.value);
  }

  private formatarDisplayName(campoLabel: string): string {
    // Converte camelCase para texto legível
    const result = campoLabel.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
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
      console.log("Campos disponíveis:", Object.keys(primeiroItem || {}));

      // Tentar encontrar campo similar
      const camposDisponiveis = Object.keys(primeiroItem || {});
      const campoNome = camposDisponiveis.find(
        (campo) =>
          campo.toLowerCase().includes("name") ||
          campo.toLowerCase().includes("nome") ||
          campo.toLowerCase().includes("label")
      );

      campoLabelFinal = campoNome || "name";
      console.log(`🔄 Usando campo: "${campoLabelFinal}"`);
    }

    const categorias = this.extrairCategorias(dados, campoLabelFinal);
    const anos = this.extrairAnos(dados);

    if (categorias.length === 0 || anos.length === 0) {
      console.error("❌ Nenhuma categoria ou ano encontrado");
      return null;
    }

    console.log(
      `✅ Criando FlipTable: ${categorias.length} categorias × ${anos.length} anos`
    );

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
          value: this.extrairValor(item, camposValor),
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

  private extrairValor(item: any, camposValor: string[]): any {
    if (!item) return null;

    for (const campo of camposValor) {
      if (item.hasOwnProperty(campo)) {
        return item[campo];
      }
    }

    // Fallback para campo 'value'
    return item.value || null;
  }
}
