import {
  Component,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  HostListener,
} from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { ECharts, EChartsOption } from "echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../../@theme/theme.module";
import { IChartOptions } from "./../../../../shared/models/painel-orcamento/IChartOptions";
import { NgxEchartsModule } from "ngx-echarts";
import { CommonModule } from "@angular/common";
import { ChartDataConfig } from "../org-chart-horizontal/org-chart-horizontal.component";

@Component({
  selector: "ngx-org-chart-vertical",
  templateUrl: "./org-chart-vertical.component.html",
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .echarts {
        width: 100%;
        height: 100%;
        min-height: 0;
      }
    `,
  ],
})
export class OrgChartVerticalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chart!: IChartOptions;
  @Input() height!: number;
  @Input() barGap: string = "30";
  @Input() isMaximized!: boolean;
  @Input() charactersPerLine!: number;

  @Input() chartDataConfig!: ChartDataConfig;

  echartsInstance: ECharts | null = null;
  chartOptions!: EChartsOption;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimeout: any;

  @HostListener("window:resize", ["$event"])
  onWindowResize(event?: Event) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateChartOnResize();
    }, 150);
  }

  constructor(private _themeService: NbThemeService) {
    console.log('')
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

      if (this.echartsInstance) {
        this.echartsInstance.setOption({
          xYAxis: this.chartOptions.xAxis,
          xAxis: this.chartOptions.xAxis,
          series: this.chartOptions.series,
        });
      }
    }

    if (changes["height"] || changes["isMaximized"]) {
      this.resizeChart();
    }

    if (changes["isMaximized"] && this.chart) {
      this.isMaximized = changes["isMaximized"].currentValue;
      this.initChartOptions(this.chart);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resizeTimeout);
    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  private updateChartOnResize(): void {
    if (!this.echartsInstance || !this.chart?.data) return;

    const theme = getAvailableThemesStyles(this.currentTheme);

    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    this.echartsInstance.setOption({
      xAxis: {
        axisLabel: {
          color: theme.textPrimaryColor,
          // fontSize: isMobile ? 10 : 12,
          fontSize: this.isMaximized ? (isMobile ? 15 : 15) : 10,
          interval: 0,
          margin: 12,
          overflow: "truncate",
          // ellipsis: "...",
          // width: isPhone ? 30 : isTablet ? 40 : isMobile ? 100 : 150,
          width: isPhone ? 40 : isTablet ? 60 : isMobile ? 60 : 130,
          // formatter: (value: string) => this.quebrarTexto(value, this.charactersPerLine),
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        axisLabel: {
          fontSize: this.isMaximized ? (isMobile ? 15 : 15) : 10,
          width: isMobile ? 20 : 100,
          formatter: (v: number) => `${this.formatValue(v)}`,
        },
      },
      legend: {
        itemWidth: this.isMaximized ? 20 : 10,
        itemHeight: this.isMaximized ? 20 : 10,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? 16 : 12,
        },
      },
      series: this.chart.data.datasets.map((dataset, index) => ({
        barMaxWidth: isMobile ? 20 : 40,
      })),
    });

    this.resizeChart();
  }

  private resizeChart(): void {
    if (this.echartsInstance) {
      const timer = setTimeout(() => {
        this.echartsInstance?.resize({
          width: "auto",
          height: this.height,
        });
        clearTimeout(timer);
      }, 100);
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
    setTimeout(() => {
      this.resizeChart();
    }, 100);
  }

  initChartOptions(chart: IChartOptions) {
    if (!chart?.data || chart.data.datasets.length === 0) {
      this.chartOptions = null!;
      return;
    }

    const theme = getAvailableThemesStyles(this.currentTheme);
    const colors = chart.data.datasets.map(
      (dataset) =>
        dataset.backgroundColor ||
        this.getFallbackColor(chart.data.datasets.indexOf(dataset)),
    );

    const labels = chart.data.labels as string[];

    const data = labels.map((label: string, i: number) => ({
      category: label,
      valores: chart.data.datasets.map((dataset) => dataset.data[i] ?? 0),
    }));

    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    this.chartOptions = {
      grid: {
        top: this.chartDataConfig?.grid?.top || "20%",
        left: this.chartDataConfig?.grid?.left || "12%",
        bottom: this.chartDataConfig?.grid?.bottom || "10%",
        right: this.chartDataConfig?.grid?.right || "5%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.themePrimaryColor,
        borderColor: theme.themePrimaryColor,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: 12,
        },
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
        data: chart.data.datasets.map((r) => r.label),
        itemWidth: this.isMaximized ? 15 : 12,
        itemHeight: this.isMaximized ? 15 : 12,
        itemGap: 10,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? 16 : 12,
        },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? (isMobile ? 15 : 15) : 10,
          interval: 0,
          rotate: 0,
          margin: 12,
          overflow: "truncate",
          width: isPhone ? 40 : isTablet ? 60 : isMobile ? 60 : 130,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: "value",
        inverse: false,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? (isMobile ? 15 : 15) : 10,
          width: isMobile ? 20 : 100,
          formatter: (v: number) => `${this.formatValue(v)}`,
        },
      },
      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((res) => res.valores[index]),
        itemStyle: {
          color: colors[index],
          borderWidth: 1,
        },
        barMaxWidth: isMobile ? 20 : 40,
        barCategoryGap: "20%",
        barGap: `${this.barGap}%`,
      })),
    };

    if (this.echartsInstance) {
      this.echartsInstance.setOption({
        xAxis: this.chartOptions.xAxis,
        series: this.chartOptions.series,
      });
    }
  }

  private getFallbackColor(index: number): string {
    const fallbackColors = [
      "#4DB6D2",
      "#F58B9B",
      "#AF9552",
      "#2E88B9",
      "#549b7f",
      "#A671C4",
      "#C5C5C5",
      "#2d6981",
      "#dd7788",
      "#c7a921",
    ];
    return fallbackColors[index % fallbackColors.length];
  }

  formatValue(value: number): string {
    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000_000)
      return (value / 1_000_000_000_000).toFixed(1) + " T";
    if (absValue >= 1_000_000_000)
      return (value / 1_000_000_000).toFixed(1) + " B";
    if (absValue >= 1_000_000) return (value / 1_000_000).toFixed(1) + " M";
    if (absValue >= 1_000) return (value / 1_000).toFixed(1) + " K";

    return value.toString();
  }

  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
