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
import { IChartOptions } from "./../../../../shared/models/budget-panel/IChartOptions";
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
    this._themeService.onThemeChange().subscribe((newTheme) => {
      this.currentTheme = newTheme.name as AvailableThemes;
      if (this.echartsInstance && this.chart) {
        this.initChartOptions(this.chart);
        this.echartsInstance.setOption(this.chartOptions);
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
    this.initChartOptions(this.chart);
    this.echartsInstance.setOption(this.chartOptions, true);
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
        extraCssText: 'white-space: normal; word-break: break-all; max-width: 610px;',
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";

          let tituloTooltip = params[0].name || "";
          let tooltip = `<div style="padding:4px"><b style="font-size:13px">${tituloTooltip}</b> </br>`;

          params.forEach((p: any) => {
            const valorRaw = p.value !== undefined && p.value !== null ? p.value : 0;
            const valorFormatado = this.formatNumber(valorRaw);
            tooltip += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color};margin-right:5px;"></span>
                        <b>${p.seriesName}:</b> ${valorFormatado} </br>`;
          });

          tooltip += `</div>`;
          return tooltip;
        },
      },
      legend: {
        type: "scroll",
        orient: "horizontal",
        top: "top",
        left: "center",
        data: chart.data.datasets.map((r) => r.label),
        itemWidth: this.isMaximized ? 14 : 12,
        itemHeight: this.isMaximized ? 14 : 12,
        itemGap: 10,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? 14 : 12,
        },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? 14 : 11,
          interval: 0,
          rotate: (window.innerWidth <= 768 && data.length > 4) ? 45 : 0,
          margin: 10,
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
          fontSize: this.isMaximized ? 13 : 10,
          width: isMobile ? 20 : 100,
          formatter: (v: number) => `${this.formatAxisValue(v)}`,
        },
        splitLine: {
          show: true,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.2 },
        },
        axisLine: {
          show: true,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.8 },
        },
        axisTick: {
          show: true,
          length: 5,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.8 },
        },
      },
      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((res) => res.valores[index]),
        itemStyle: {
          color: colors[index],
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: window.innerWidth > 768,
          position: "top",
          formatter: (params: any) => `${this.formatValue(params.value)}`,
          fontSize: this.isMaximized ? 14 : 8,
          color: theme.textPrimaryColor,
          fontWeight: 'bold',
          textBorderWidth: 0,
          textBorderColor: "transparent",
          minMargin: 10,
        },
        barMaxWidth: isMobile ? 20 : 40,
        barCategoryGap: "10%",
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
      return (value / 1_000_000_000_000).toFixed(1).replace('.', ',').replace(',0', '') + " T";
    if (absValue >= 1_000_000_000)
      return (value / 1_000_000_000).toFixed(1).replace('.', ',').replace(',0', '') + " B";
    if (absValue >= 1_000_000) return (value / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '') + " M";
    if (absValue >= 1_000) return (value / 1_000).toFixed(1).replace('.', ',').replace(',0', '') + " K";
    return value.toString();
  }

  formatAxisValue(value: number): string {
    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000_000)
      return (value / 1_000_000_000_000).toFixed(0) + " T";
    if (absValue >= 1_000_000_000)
      return (value / 1_000_000_000).toFixed(0) + " B";
    if (absValue >= 1_000_000) return (value / 1_000_000).toFixed(0) + " M";
    if (absValue >= 1_000) return (value / 1_000).toFixed(0) + " K";
    return value.toString();
  }

  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
