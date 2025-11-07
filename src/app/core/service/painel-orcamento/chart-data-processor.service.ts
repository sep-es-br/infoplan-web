// import { Injectable } from "@angular/core";
// import { IChartOptions } from "../../../shared/models/painel-orcamento/IChartOptions";
// import { PieChartData } from "../../../features/painel-orcamento/org-chart-pie/org-chart-pie.component";

// const CHART_COLORS = [
//   "#F58B9B", "#4DB6D2", "#e4c26b", "#2E88B9",
//   "#77D4B0", "#A671C4", "#F6D25A",
// ];

// @Injectable({
//   providedIn: "root",
// })
// export class ChartDataProcessorService {
//   readonly colors = CHART_COLORS;

//   /**
//    * Processa dados para gráficos de barras comparativos (ano único ou múltiplos anos)
//    */
//   processarDadosComparativo(
//     dados: any[],
//     campoLabel: string,
//     labelDataset?: string
//   ): IChartOptions | null {
//     const dadosNormalizados = this.normalizarEstruturaDados(dados);

//     if (!dadosNormalizados.length) {
//       console.warn("Nenhum dado disponível após normalização");
//       return null;
//     }

//     const categorias = this.extrairCategorias(dadosNormalizados, campoLabel);
//     const anos = this.extrairAnos(dadosNormalizados);

//     if (!anos.length) {
//       console.warn("Nenhum ano encontrado nos dados");
//       return null;
//     }

//     return anos.length === 1
//       ? this.criarChartAnoUnico(dadosNormalizados, categorias, anos[0], campoLabel)
//       : this.criarChartMultiploAnos(dadosNormalizados, categorias, anos, campoLabel);
//   }

//   /**
//    * Processa dados para gráficos de pizza (PieChart)
//    */
//   processarDadosPieChart(
//     dados: any[],
//     campoNome: string,
//     camposValor: string[]
//   ): PieChartData[] {
//     const dadosNormalizados = this.normalizarEstruturaDados(dados);

//     if (!dadosNormalizados.length) {
//       return [];
//     }

//     const dadosAgrupados = this.agruparDadosPieChart(dadosNormalizados, campoNome, camposValor);
//     return this.gerarPieChartData(dadosAgrupados);
//   }

//   /**
//    * Cria dados de tabela a partir de PieChartData
//    */
//   criarTabelaPieChart(
//     dados: PieChartData[]
//   ): Array<{ categoria: string; valor: number; percentual: number }> {
//     if (!dados?.length) return [];

//     const total = dados.reduce((sum, item) => sum + item.value, 0);

//     return dados.map((item) => ({
//       categoria: item.name,
//       valor: item.value,
//       percentual: total > 0 ? (item.value / total) * 100 : 0,
//     }));
//   }

//   /**
//    * Cria dados de tabela a partir de gráfico comparativo
//    */
//   criarTabelaComparativo(
//     dados: any[],
//     campoLabel: string,
//     camposValor: string[]
//   ): Array<{ categoria: string; [key: string]: any }> {
//     const dadosNormalizados = this.normalizarEstruturaDados(dados);

//     if (!dadosNormalizados.length) return [];

//     const categorias = this.extrairCategorias(dadosNormalizados, campoLabel);
//     const anos = this.extrairAnos(dadosNormalizados);

//     return categorias.map((categoria) => {
//       const row: any = { categoria };

//       anos.forEach((ano) => {
//         const item = dadosNormalizados.find(
//           (d) => d[campoLabel] === categoria && d.ano === ano
//         );
//         row[`ano_${ano}`] = this.extrairValor(item, camposValor);
//       });

//       return row;
//     });
//   }

//   // ==================== MÉTODOS PRIVADOS - NORMALIZAÇÃO ====================

//   private normalizarEstruturaDados(dados: any[]): any[] {
//     if (!dados?.length) return [];

//     // Se o primeiro elemento é um array, achata a estrutura
//     if (Array.isArray(dados[0])) {
//       return dados.flat();
//     }

//     return dados;
//   }

//   private extrairCategorias(dados: any[], campoLabel: string): any[] {
//     return [...new Set(dados
//       .filter(item => item && item[campoLabel] != null)
//       .map(item => item[campoLabel])
//     )];
//   }

//   private extrairAnos(dados: any[]): number[] {
//     return [...new Set(dados
//       .filter(item => item && item.ano != null)
//       .map(item => Number(item.ano))
//     )].sort((a, b) => a - b);
//   }

//   // ==================== MÉTODOS PRIVADOS - GRÁFICOS ====================

//   private criarChartAnoUnico(
//     dados: any[],
//     categorias: any[],
//     ano: number,
//     campoLabel: string
//   ): IChartOptions | null {
//     const dadosPrevisao = this.extrairDadosPorCategoria(
//       dados, categorias, ano, campoLabel, "vlr_receita_prevista"
//     );

//     const dadosArrecadacao = this.extrairDadosPorCategoria(
//       dados, categorias, ano, campoLabel, "receitaLiquida", "vlr_receita_liquida"
//     );

//     if (!this.temDadosValidos([dadosPrevisao, dadosArrecadacao])) {
//       console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
//       return null;
//     }

//     return {
//       data: {
//         labels: categorias,
//         datasets: [
//           {
//             label: `Previsão ${ano}`,
//             data: dadosPrevisao,
//             backgroundColor: this.colors[0],
//           },
//           {
//             label: `Arrecadação ${ano}`,
//             data: dadosArrecadacao,
//             backgroundColor: this.colors[1],
//           },
//         ],
//       },
//     };
//   }

//   private criarChartMultiploAnos(
//     dados: any[],
//     categorias: any[],
//     anos: number[],
//     campoLabel: string
//   ): IChartOptions | null {
//     const datasets = anos.map((ano, index) => {
//       const dadosAno = this.extrairDadosPorCategoria(
//         dados, categorias, ano, campoLabel, "receitaLiquida", "vlr_receita_liquida"
//       );

//       return {
//         label: `${ano}`,
//         data: dadosAno,
//         backgroundColor: this.colors[index % this.colors.length],
//       };
//     });

//     if (!this.temDadosValidos(datasets.map(d => d.data))) {
//       console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
//       return null;
//     }

//     return {
//       data: {
//         labels: categorias,
//         datasets: datasets,
//       },
//     };
//   }

//   // ==================== MÉTODOS PRIVADOS - UTILITÁRIOS ====================

//   private extrairDadosPorCategoria(
//     dados: any[],
//     categorias: any[],
//     ano: number,
//     campoLabel: string,
//     ...campos: string[]
//   ): number[] {
//     return categorias.map((categoria) => {
//       const item = dados.find(
//         (item) => item[campoLabel] === categoria && item.ano === ano
//       );
//       return this.extrairValor(item, campos);
//     });
//   }

//   private extrairValor(item: any, campos: string[]): number {
//     if (!item) return 0;

//     for (const campo of campos) {
//       if (item[campo] !== undefined && item[campo] !== null) {
//         return Number(item[campo]) || 0;
//       }
//     }
//     return 0;
//   }

//   private agruparDadosPieChart(
//     dados: any[],
//     campoNome: string,
//     camposValor: string[]
//   ): Map<string, number> {
//     const dadosAgrupados = new Map<string, number>();

//     dados.forEach((item) => {
//       const nome = item[campoNome];
//       if (!nome) return;

//       const valor = this.extrairValor(item, camposValor);

//       if (dadosAgrupados.has(nome)) {
//         dadosAgrupados.set(nome, dadosAgrupados.get(nome)! + valor);
//       } else {
//         dadosAgrupados.set(nome, valor);
//       }
//     });

//     return dadosAgrupados;
//   }

//   private gerarPieChartData(dadosAgrupados: Map<string, number>): PieChartData[] {
//     const pieData: PieChartData[] = Array.from(dadosAgrupados.entries())
//       .map(([name, value], index) => ({
//         name,
//         value,
//         itemStyle: {
//           color: this.colors[index % this.colors.length],
//         },
//       }))
//       .filter((item) => item.value > 0);

//     return pieData.sort((a, b) => b.value - a.value);
//   }

//   private temDadosValidos(arrays: number[][]): boolean {
//     return arrays.some((arr) => arr?.some((valor) => valor > 0));
//   }
// }


import { Injectable } from "@angular/core";
import { IChartOptions } from "../../../shared/models/painel-orcamento/IChartOptions";
import { PieChartData } from "../../../features/painel-orcamento/org-chart-pie/org-chart-pie.component";

const CHART_COLORS = [
  "#F58B9B", "#4DB6D2", "#e4c26b", "#2E88B9",
  "#77D4B0", "#A671C4", "#F6D25A",
];

@Injectable({
  providedIn: "root",
})
export class ChartDataProcessorService {
  readonly colors = CHART_COLORS;

  /**
   * Processa dados para gráficos de barras comparativos (ano único ou múltiplos anos)
   */
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

  /**
   * Processa dados para gráficos de pizza (PieChart)
   */
  processarDadosPieChart(
    dados: any[],
    campoNome: string,
    camposValor: string[]
  ): PieChartData[] {
    if (!dados?.length) {
      return [];
    }

    const dadosAgrupados = this.agruparDadosPieChart(dados, campoNome, camposValor);
    return this.gerarPieChartData(dadosAgrupados);
  }

  /**
   * Cria dados de tabela a partir de PieChartData
   */
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

  /**
   * Cria dados de tabela a partir de gráfico comparativo
   */
  criarTabelaComparativo(
    dados: any[],
    campoLabel: string,
    camposValor: string[]
  ): Array<{ categoria: string; [key: string]: any }> {
    if (!dados?.length) return [];

    const categorias = this.extrairCategorias(dados, campoLabel);
    const anos = this.extrairAnos(dados);

    return categorias.map((categoria) => {
      const row: any = { categoria };

      anos.forEach((ano) => {
        const item = dados.find(
          (d) => d[campoLabel] === categoria && d.ano === ano
        );
        row[`ano_${ano}`] = this.extrairValor(item, camposValor);
      });

      return row;
    });
  }

  // ==================== MÉTODOS PRIVADOS - EXTRAÇÃO DE DADOS ====================

  private extrairCategorias(dados: any[], campoLabel: string): any[] {
    return [...new Set(dados
      .filter(item => item && item[campoLabel] != null)
      .map(item => item[campoLabel])
    )];
  }

  private extrairAnos(dados: any[]): number[] {
    return [...new Set(dados
      .filter(item => item && item.ano != null)
      .map(item => Number(item.ano))
    )].sort((a, b) => a - b);
  }

  // ==================== MÉTODOS PRIVADOS - GRÁFICOS ====================

  private criarChartAnoUnico(
    dados: any[],
    categorias: any[],
    ano: number,
    campoLabel: string
  ): IChartOptions | null {
    const dadosPrevisao = this.extrairDadosPorCategoria(
      dados, categorias, ano, campoLabel, "vlr_receita_prevista"
    );

    const dadosArrecadacao = this.extrairDadosPorCategoria(
      dados, categorias, ano, campoLabel, "receitaLiquida", "vlr_receita_liquida"
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
        dados, categorias, ano, campoLabel, "receitaLiquida", "vlr_receita_liquida"
      );

      return {
        label: `${ano}`,
        data: dadosAno,
        backgroundColor: this.colors[index % this.colors.length],
      };
    });

    if (!this.temDadosValidos(datasets.map(d => d.data))) {
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

  // ==================== MÉTODOS PRIVADOS - UTILITÁRIOS ====================

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

  private extrairValor(item: any, campos: string[]): number {
    if (!item) return 0;

    for (const campo of campos) {
      if (item[campo] !== undefined && item[campo] !== null) {
        return Number(item[campo]) || 0;
      }
    }
    return 0;
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

  private gerarPieChartData(dadosAgrupados: Map<string, number>): PieChartData[] {
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

  private temDadosValidos(arrays: number[][]): boolean {
    return arrays.some((arr) => arr?.some((valor) => valor > 0));
  }
}
