import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  AfterViewInit,
  inject,
} from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { ECharts, EChartsOption } from "echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../../@theme/theme.module";
import { IChartOptions } from "../../../../shared/models/budget-panel/IChartOptions";
import { CommonModule } from "@angular/common";
import { NgxEchartsModule } from "ngx-echarts";
import { UtilitiesService } from "../../../../core/service/utilities.service";

export interface ChartDataConfig {
  legend?: {
    fontSize?: number | string;
    itemWidth?: number;
    itemHeight?: number;
    itemGap?: number;
  };
  grid?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    containLabel?: boolean;
  };
  showMaximizeButton?: boolean;
}

@Component({
  selector: "ngx-org-chart-horizontal",
  templateUrl: "./org-chart-horizontal.component.html",
  styles: [".echarts { width: 100%; height: 100%; }"],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class OrgChartHorizontalComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() chart!: IChartOptions;
  @Input() height!: number;
  @Input() charactersPerLine!: number;
  @Input() showMaximizeButton!: boolean;
  @Input() chartDataConfig!: ChartDataConfig;
  @Input() valueType: 'percent' | 'currency' = 'percent';

  private readonly _utilitiesService = inject(UtilitiesService);

  chartOptions!: EChartsOption;
  echartsInstance: ECharts | null = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimer: any;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
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
    if ((changes["chart"] && this.chart) || changes["valueType"]) {
      this.initChartOptions(this.chart);
    }
    if (changes["height"]) {
      this.resizeChart();
    }
    if (changes["showMaximizeButton"]) {
      this.showMaximizeButton = changes["showMaximizeButton"].currentValue;
      this.updateChartOnResize();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resizeTimer);
    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
  }

  private updateChartOnResize(): void {
    if (!this.echartsInstance || !this.chart?.data) return;

    const theme = getAvailableThemesStyles(this.currentTheme);
    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    this.echartsInstance.setOption({
      yAxis: {
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 14 : 11,
          margin: 10,
          width: 140,
          lineHeight: 16,
          overflow: "break"
        },
      },
      xAxis: {
        axisLabel: {
          fontSize: this.showMaximizeButton ? 13 : 10,
          formatter: (value: number) => {
            return this.valueType === 'currency' 
              ? this._utilitiesService.formatCurrencyUsingBrazilianStandards(value, "R$")
              : this.formatValue(value);
          },
        },
      },
      legend: {
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 13 : 12,
        },
      },
      series: this.chart.data.datasets.map(() => ({
        barMaxWidth: isMobile ? 15 : 20,
      })),
    });

    this.resizeChart();
  }

  initChartOptions(chart: IChartOptions) {
    if (!chart?.data || chart.data.datasets.length === 0) {
      this.chartOptions = null!;
      return;
    }

    const theme = getAvailableThemesStyles(this.currentTheme);
    const datasetLabels = chart.data.datasets.map((dataset) => dataset.label);
    const labels = chart.data.labels as string[];

    const data = labels.map((label: string, i: number) => ({
      category: label,
      valores: chart.data.datasets.map((dataset) => dataset.data[i] ?? 0),
    }));

    const colors = chart.data.datasets.map(
      (dataset) => dataset.backgroundColor || "#4DB6D2",
    );

    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    this.chartOptions = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.themePrimaryColor,
        borderColor: theme.themePrimaryColor,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: 12
        },
        confine: true,
        extraCssText: 'white-space: normal; word-break: break-all; max-width: 610px;',
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";

          const index = params[0].dataIndex;
          const dataRef = this.chart?.data;

          if (!dataRef) return "";

          let tituloTooltip = params[0].name || "";

          let tooltip = `<div style="padding:4px"><b style="font-size:13px">${tituloTooltip}</b> </br>`;

          params.forEach((p: any) => {
            const valorRaw = p.value !== undefined && p.value !== null ? p.value : 0;
            const valorFormatado = this.valueType === 'currency' 
              ? this._utilitiesService.formatCurrencyUsingBrazilianStandards(valorRaw, "R$")
              : (this.valueType === 'percent' ? `${this.formatNumberSimple(valorRaw)}%` : this.formatNumberSimple(valorRaw));
            tooltip += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color};margin-right:5px;"></span>
                        <b>${p.seriesName}:</b> ${valorFormatado} </br>`;
          });

          tooltip += `</div>`;
          return tooltip;
        },
      },

      legend: {
        orient: "horizontal",
        top: "top",
        left: "center",
        data: datasetLabels,
        itemWidth: this.chartDataConfig?.legend?.itemWidth || 10,
        itemHeight: this.chartDataConfig?.legend?.itemHeight || 10,
        itemGap: this.chartDataConfig?.legend?.itemGap || 20,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 16 : 12,
        },
      },

      grid: {
        top: this.chartDataConfig?.grid?.top || "15%",
        left: this.chartDataConfig?.grid?.left || "10%",
        right: this.chartDataConfig?.grid?.right || "10%",
        bottom: this.chartDataConfig?.grid?.bottom || "10%",
        containLabel: this.chartDataConfig?.grid?.containLabel || true,
      },

      xAxis: {
        type: "value",
        scale: true,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 13 : 10,
          formatter: (value: number) => {
            return this.valueType === 'currency' 
              ? this._utilitiesService.formatCurrencyUsingBrazilianStandards(value, "R$")
              : this.formatValue(value);
          },
        },
        splitLine: {
          show: true,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.2 },
        },
        axisLine: {
          show: true,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.8 },
        },
      },

      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 14 : 11,
          margin: 10,
          width: 140,
          lineHeight: 16,
          overflow: "break"
        },
        axisLine: {
          show: true,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.8 },
        },
        axisTick: {
          show: true,
          lineStyle: { color: theme.textSecondaryColor, opacity: 0.8 },
        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((d) => d.valores[index]),
        itemStyle: {
          color: colors[index],
          borderRadius: [0, 4, 4, 0],
        },
        barCategoryGap: "20%",
        barGap: "20%",
        barMaxWidth: isMobile ? 15 : 25,
        label: {
          show: true,
          position: "right",
          formatter: (params: any) => {
            return this.valueType === 'currency' 
              ? this._utilitiesService.formatCurrencyUsingBrazilianStandards(params.value, "R$")
              : this.formatValue(params.value);
          },
          fontSize: this.showMaximizeButton ? 13 : 10,
          color: theme.textPrimaryColor,
        }
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
            fontSize: 0,
          },
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

  private formatNumberSimple(value: number): string {
    return new Intl.NumberFormat("pt-BR").format(value);
  }
}
