import { Injectable } from '@angular/core';
import { IChartOptions } from '../../../shared/models/painel-orcamento/IChartOptions';
import { PieChartData } from '../../../features/painel-orcamento/org-chart-pie/org-chart-pie.component';

const CHART_COLORS = [
  '#F58B9B', // PRIMARY
  '#4DB6D2', // SECONDARY
  '#e4c26b', // TERTIARY
  '#2E88B9', // QUATERNARY
  '#77D4B0', // QUINTERNARY
  '#A671C4', // SECTATERNARY
  '#F6D25A', // SETIMATERNARY
];

@Injectable({
  providedIn: 'root'
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
      console.warn('Nenhum dado disponível');
      return null;
    }

    const categorias = [...new Set(dados.map((item) => item[campoLabel]))];
    const anos = [...new Set(dados.map((item) => item.ano))].sort((a, b) => a - b);

    if (anos.length === 0) {
      console.warn('Nenhum ano encontrado nos dados');
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

    const dadosAgrupados = new Map<string, number>();

    dados.forEach((item) => {
      const nome = item[campoNome];
      if (!nome) return;

      let valor = 0;
      for (const campo of camposValor) {
        if (item[campo] !== undefined && item[campo] !== null) {
          valor = Number(item[campo]) || 0;
          break;
        }
      }

      if (dadosAgrupados.has(nome)) {
        dadosAgrupados.set(nome, dadosAgrupados.get(nome)! + valor);
      } else {
        dadosAgrupados.set(nome, valor);
      }
    });

    const pieData: PieChartData[] = Array.from(dadosAgrupados.entries())
      .map(([name, value], index) => ({
        name,
        value,
        itemStyle: {
          color: this.colors[index % this.colors.length],
        },
      }))
      .filter((item) => item.value > 0);

    pieData.sort((a, b) => b.value - a.value);
    return pieData;
  }

  /**
   * Cria dados de tabela a partir de PieChartData
   */
  criarTabelaPieChart(dados: PieChartData[]): Array<{categoria: string; valor: number; percentual: number}> {
    if (!dados?.length) return [];

    const total = dados.reduce((sum, item) => sum + item.value, 0);

    return dados.map(item => ({
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
  ): Array<{categoria: string; [key: string]: any}> {
    if (!dados?.length) return [];

    const categorias = [...new Set(dados.map((item) => item[campoLabel]))];
    const anos = [...new Set(dados.map((item) => item.ano))].sort((a, b) => a - b);

    return categorias.map(categoria => {
      const row: any = { categoria };

      anos.forEach(ano => {
        const item = dados.find(
          (d) => d[campoLabel] === categoria && d.ano === ano
        );

        if (item) {
          for (const campo of camposValor) {
            if (item[campo] !== undefined && item[campo] !== null) {
              row[`ano_${ano}`] = item[campo];
              break;
            }
          }
        } else {
          row[`ano_${ano}`] = 0;
        }
      });

      return row;
    });
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private criarChartAnoUnico(
    dados: any[],
    categorias: any[],
    ano: number,
    campoLabel: string
  ): IChartOptions | null {
    const dadosPrevisao = this.extrairDados(
      dados,
      categorias,
      ano,
      campoLabel,
      'vlr_receita_prevista'
    );
    const dadosArrecadacao = this.extrairDados(
      dados,
      categorias,
      ano,
      campoLabel,
      'receitaLiquida',
      'vlr_receita_liquida'
    );

    if (!this.temDadosValidos(dadosPrevisao, dadosArrecadacao)) {
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
      const dadosAno = this.extrairDados(
        dados,
        categorias,
        ano,
        campoLabel,
        'receitaLiquida',
        'vlr_receita_liquida'
      );
      return {
        label: `${ano}`,
        data: dadosAno,
        backgroundColor: this.colors[index % this.colors.length],
      };
    });

    if (!datasets.some((dataset) => dataset.data.some((valor) => valor > 0))) {
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

  private extrairDados(
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
      if (!item) return 0;

      for (const campo of campos) {
        if (item[campo] !== undefined && item[campo] !== null) {
          return item[campo];
        }
      }
      return 0;
    });
  }

  private temDadosValidos(...arrays: number[][]): boolean {
    return arrays.some((arr) => arr.some((valor) => valor > 0));
  }
}
