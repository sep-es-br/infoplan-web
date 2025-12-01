import {
  Component,
  HostListener,
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
  styles: ['.echarts { width: 100%; height: 100%; }'],
})
export class OrgChartHorizontalComponent implements OnInit, OnChanges {
  @Input() chart!: IChartOptions;
  @Input() height: number;
  @Input() charactersPerLine: number;

  chartOptions: EChartsOption;
  echartsInstance: ECharts | null = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimer: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.resizeChart();
  }

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
    if (changes["height"]) {
      this.resizeChart();
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

    const datasetLabels = chart.data.datasets.map(dataset => dataset.label);

    const data = chart.data.labels.map((label: string, i: number) => ({
      category: label,
      valores: chart.data.datasets.map(dataset => dataset.data[i] ?? 0)
    }));

    const colors = chart.data.datasets.map(dataset =>
      dataset.backgroundColor || "#4DB6D2"
    );

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
        left: "center",
        data: datasetLabels,
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: 9,
        },
      },

      grid: {
        top: "20%",
        left: "10%",
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
          formatter: (value: string) => {
            return this.quebrarTexto(value, this.charactersPerLine);
          },
        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map(d => d.valores[index]),
        itemStyle: { color: colors[index] },
      })),

      dataZoom: [
        {
          type: "slider",
          yAxisIndex: 0,
          start: 0,
          end: (9 / data.length) * 100,
          zoomLock: true,
          orient: "vertical",
          handleSize: "50%",
          width: 0,
          left: "97%",
          showDetail: false,
          showDataShadow: false,
          textStyle: {
            fontSize: 0
          }
        },
        {
          type: "inside",
          yAxisIndex: 0,
          start: 0,
          end: (9 / data.length) * 100,
          zoomLock: true,
        },
      ],
    };
  }

  resizeChart() {
    if (this.echartsInstance) {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.echartsInstance.resize();
      }, 100);
    }
  }

  private quebrarTexto(texto: string, maxCaracteres: number): string {
    if (!texto) return '';
    return texto.match(new RegExp(`.{1,${maxCaracteres}}`, 'g'))?.join('\n') || texto;
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
