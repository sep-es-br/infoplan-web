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
import { IChartOptions } from "./../../../../shared/models/painel-orcamento/IChartOptions";

@Component({
  selector: "ngx-org-chart-vertical",
  templateUrl: "./org-chart-vertical.component.html",
  styles: ['.echarts { width: 100%; height: 100%; }'],
})
export class OrgChartVerticalComponent implements OnInit, OnChanges {
  @Input() chart!: IChartOptions;
  @Input() height: string = '500px';
  @Input() width: string = '500px';

  echartsInstance: ECharts | null = null;

  chartOptions: EChartsOption;

  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  constructor(private _themeService: NbThemeService) {
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
      this.initChartOptions(this.chart);
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
  }

  initChartOptions(chart: IChartOptions) {
    if (!chart?.data || chart.data.datasets.length < 2) {
      this.chartOptions = null!;
      return;
    }

    const theme = getAvailableThemesStyles(this.currentTheme);
    const data = chart.data.labels.map((label: string, i: number) => ({
      category: label,
      valores: chart.data.datasets.map(dataset => dataset.data[i] ?? 0)
    }));

    const colors = [
      chart.data.datasets[0].backgroundColor || "#4DB6D2",
      chart.data.datasets[1].backgroundColor || "#F58B9B",
    ];

    this.chartOptions = {
      grid: {
        containLabel: true
      },
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
        data: chart.data.datasets.map(r => r.label),
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: theme.textPrimaryColor },
      },

      xAxis: {
        type: "category",
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: 10,
        },
      },

      yAxis: {
        type: "value",
        inverse: false,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: 10,
          overflow: "truncate",
          width: 100,
          formatter: (v: number) => this.formatValue(v),

        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map(res => res.valores[index]),
        itemStyle: { color: colors[index]}
      }))
      // series: [
      //   {
      //     name: chart.data.datasets.map(r => r.label)[0],
      //     type: "bar",
      //     data: data.map((d) => d.previsaoInicial),
      //     itemStyle: { color: colors[0] },
      //   },
      //   {
      //     name: chart.data.datasets.map(r => r.label)[1],
      //     type: "bar",
      //     data: data.map((d) => d.arredacaoLiquida),
      //     itemStyle: { color: colors[1] },
      //   },
      // ],
    };
  }

  private formatValue(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(0) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + "M";
    return value.toString();
  }

  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
