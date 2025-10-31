import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { ECharts, EChartsOption } from "echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../../@theme/theme.module";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";

@Component({
  selector: "ngx-org-chart-horizontal",
  templateUrl: "./org-chart-horizontal.component.html",
  styleUrls: ["./org-chart-horizontal.component.scss"],
})
export class OrgChartHorizontalComponent implements OnInit, OnChanges {
  @Input() chart!: IChartOptions; // 🔥 recebe dinamicamente o JSON do gráfico

  chartOptions: EChartsOption;
  echartsInstance: ECharts | null = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  constructor(private _themeService: NbThemeService) {
    // 🔁 Atualiza cores do gráfico ao trocar o tema
    this._themeService.onThemeChange().subscribe((newTheme) => {
      if (this.echartsInstance) {
        this.currentTheme = newTheme.name;
        const newStyles = getAvailableThemesStyles(newTheme.name);

        this.echartsInstance.setOption({
          tooltip: {
            textStyle: { color: newStyles.textPrimaryColor },
            backgroundColor: newStyles.themePrimaryColor,
            borderColor: newStyles.themePrimaryColor,
          },
          legend: { textStyle: { color: newStyles.textPrimaryColor } },
          yAxis: { axisLabel: { color: newStyles.textPrimaryColor } },
          xAxis: { axisLabel: { color: newStyles.textPrimaryColor } },
        });
      }
    });
  }

  ngOnInit(): void {
    this.currentTheme = this._themeService.currentTheme as AvailableThemes;
    if (this.chart) this.initChartOptions(this.chart);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["chart"] && this.chart) {
      this.initChartOptions(this.chart); // 🌀 atualiza automaticamente quando o Input mudar
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
  }

  // initChartOptions(chart: IChartOptions) {
  //   if (!chart?.data || chart.data.datasets.length < 2) {
  //     this.chartOptions = null!;
  //     return;
  //   }

  //   const theme = getAvailableThemesStyles(this.currentTheme);
  //   console.log("Tema atual do gráfico:", chart.data.datasets[0]);
  //   const data = chart.data.labels.map((label: string, i: number) => ({
  //     category: label,
  //     previsaoInicial: chart.data.datasets[0]?.data[i] ?? 0,
  //     arredacaoLiquida: chart.data.datasets[1]?.data[i] ?? 0,
  //   }));

  //   console.log("data " + data.forEach((r) => r));
  //   const colors = [
  //     chart.data.datasets[0].backgroundColor || "#4DB6D2",
  //     chart.data.datasets[1].backgroundColor || "#F58B9B",
  //   ];

  //   console.log("Iniciando opções do gráfico com dados:", data.map((d) => d));
  //   this.chartOptions = {
  //     tooltip: {
  //       trigger: "axis",
  //       axisPointer: { type: "shadow" },
  //       backgroundColor: theme.themePrimaryColor,
  //       borderColor: theme.themePrimaryColor,
  //       textStyle: { color: theme.textPrimaryColor },
  //       confine: true,
  //       formatter: (params: any) => {
  //         let tooltip = `${params[0].name}<br>`;
  //         params.forEach((p: any) => {
  //           tooltip += `${p.seriesName}: ${this.formatNumber(p.value)}<br>`;
  //         });
  //         return tooltip;
  //       },
  //     },

  //     legend: {
  //       orient: "horizontal",
  //       top: "top",
  //       data: ["2024", "2025"],
  //       itemWidth: 10,
  //       itemHeight: 10,
  //       textStyle: { color: theme.textPrimaryColor },
  //     },

  //     grid: {
  //       top: "10%",
  //       left: "3%",
  //       right: "4%",
  //       bottom: "3%",
  //       containLabel: true,
  //     },

  //     xAxis: {
  //       type: "value",
  //       axisLabel: {
  //         color: theme.textPrimaryColor,
  //         fontSize: 10,
  //         formatter: (v: number) => this.formatValue(v),
  //       },
  //     },

  //     yAxis: {
  //       type: "category",
  //       inverse: false,
  //       data: data.map((d) => d.category),
  //       axisLabel: {
  //         color: theme.textPrimaryColor,
  //         fontSize: 10,
  //         overflow: "truncate",
  //         width: 100,
  //       },
  //     },

  //     series: [
  //       {
  //         name: '2024',
  //         type: "bar",
  //         data: data.map((d) => d.previsaoInicial),
  //         itemStyle: { color: colors[0] },
  //       },
  //       {
  //         name: "2025",
  //         type: "bar",
  //         data: data.map((d) => d.arredacaoLiquida),
  //         itemStyle: { color: colors[1] },
  //       },
  //     ],

  //     dataZoom: [
  //       {
  //         type: "slider",
  //         yAxisIndex: [0],
  //         start: 0,
  //         end: (9 / data.length) * 100,
  //         zoomLock: true,
  //         orient: "vertical",
  //         handleSize: "50%",
  //         width: 0,
  //         left: "97%",
  //       },
  //       {
  //         type: "inside",
  //         yAxisIndex: [0],
  //         start: 0,
  //         end: (9 / data.length) * 100,
  //         zoomLock: true,
  //       },
  //     ],
  //   };
  // }

  initChartOptions(chart: IChartOptions) {
    if (!chart?.data || chart.data.datasets.length < 2) {
      this.chartOptions = null!;
      return;
    }

    const theme = getAvailableThemesStyles(this.currentTheme);

    // ✅ Obtém os labels dos datasets dinamicamente
    const datasetLabels = chart.data.datasets.map(dataset => dataset.label);
    console.log("Labels dos datasets:", datasetLabels);

    // ✅ Cria estrutura de dados genérica (não mais com nomes fixos)
    const data = chart.data.labels.map((label: string, i: number) => ({
      category: label,
      valores: chart.data.datasets.map(dataset => dataset.data[i] ?? 0)
    }));

    console.log("Dados processados:", data);

    // ✅ Obtém cores dinamicamente
    const colors = chart.data.datasets.map(dataset =>
      dataset.backgroundColor || "#4DB6D2"
    );

    console.log("Iniciando opções do gráfico com dados:", data);

    this.chartOptions = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.themePrimaryColor,
        borderColor: theme.themePrimaryColor,
        textStyle: { color: theme.textPrimaryColor },
        confine: true,
        formatter: (params: any) => {
          let tooltip = `${params[0].name}<br>`;
          params.forEach((p: any) => {
            tooltip += `${p.seriesName}: ${this.formatNumber(p.value)}<br>`;
          });
          return tooltip;
        },
      },

      legend: {
        orient: "horizontal",
        top: "top",
        // ✅ Labels dinâmicos dos datasets
        data: datasetLabels,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: theme.textPrimaryColor },
      },

      grid: {
        top: "10%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },

      xAxis: {
        type: "value",
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: 10,
          formatter: (v: number) => this.formatValue(v),
        },
      },

      yAxis: {
        type: "category",
        inverse: false,
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: 10,
          overflow: "truncate",
          width: 100,
        },
      },

      // ✅ Series dinâmicas baseadas nos datasets
      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map(d => d.valores[index]),
        itemStyle: { color: colors[index] },
      })),

      dataZoom: [
        {
          type: "slider",
          yAxisIndex: [0],
          start: 0,
          end: (9 / data.length) * 100,
          zoomLock: true,
          orient: "vertical",
          handleSize: "50%",
          width: 0,
          left: "97%",
        },
        {
          type: "inside",
          yAxisIndex: [0],
          start: 0,
          end: (9 / data.length) * 100,
          zoomLock: true,
        },
      ],
    };
  }

  private formatValue(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    return value.toString();
  }

  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
