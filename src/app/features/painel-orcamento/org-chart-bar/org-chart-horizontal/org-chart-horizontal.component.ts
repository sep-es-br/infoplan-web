import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  AfterViewInit,
} from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { ECharts, EChartsOption } from "echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../../@theme/theme.module";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { CommonModule } from "@angular/common";
import { NgxEchartsModule } from "ngx-echarts";
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
  implements OnInit, OnChanges, OnDestroy
{
  @Input() chart!: IChartOptions;
  @Input() height: number;
  @Input() charactersPerLine: number;
  @Input() showMaximizeButton!: boolean;
  @Input() ChartDataConfig!: ChartDataConfig;

  chartOptions: EChartsOption;
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
    if(changes["showMaximizeButton"]) {
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
          // fontSize: isTablet ? 9 : isMobile ? 10 : 11,
          fontSize: this.showMaximizeButton ? 14 : 11,
          margin: 8,
          overflow: "truncate",
          width: isPhone ? 80 : isTablet ? 80 : isMobile ? 80 : 140,
        },
      },
      xAxis: {
        axisLabel: {
          // fontSize: isTablet ? 9 : isMobile ? 10 : 11,
          fontSize: this.showMaximizeButton ? 13 : 10,
          formatter: (value: number) => {
            return this.formatValue(value);
          },
        },
      },
      legend: {
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 16 : 12,
        },
      },
      series: this.chart.data.datasets.map(() => ({
        barMaxWidth: isMobile ? 15 : 20,
      })),
    });

    this.resizeChart();
  }

  initChartOptions(chart: IChartOptions) {
    if (!chart?.data || chart.data.datasets.length < 2) {
      this.chartOptions = null!;
      return;
    }

    const theme = getAvailableThemesStyles(this.currentTheme);

    const datasetLabels = chart.data.datasets.map((dataset) => dataset.label);

    const data = chart.data.labels.map((label: string, i: number) => ({
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

          let tituloTooltip = "";

          if (dataRef.tipoTooltip === "PO") {
            const po =
              (dataRef.nomePO && dataRef.nomePO[index]) ||
              "PO não identificado";
            const uo =
              (dataRef.nomeUO && dataRef.nomeUO[index]) ||
              "UO não identificada";
            tituloTooltip = `${uo} - ${po} &nbsp;&nbsp;`;
          } else {
            const labelOriginal = params[0].name || "";
            const codigo = labelOriginal.includes(" - ")
              ? labelOriginal.split(" - ")[0].trim()
              : labelOriginal.trim();

            const uo =
              dataRef.nomeUO && dataRef.nomeUO[index]
                ? String(dataRef.nomeUO[index]).trim()
                : "";
            let partes = [];
            if (codigo) partes.push(`${codigo} - `);
            if (uo) partes.push(`${uo} &nbsp;&nbsp;`);

            tituloTooltip = partes.join(" ");
          }

          let tooltip = `${tituloTooltip} </br>`;

          params.forEach((p: any) => {
            const valorRaw =
              p.value !== undefined && p.value !== null ? p.value : 0;
            const valorFormatado = this.formatNumber(valorRaw);
            tooltip += `${p.seriesName}: ${valorFormatado} </br>`;
          });

          return tooltip;
        },
      },

      legend: {
        orient: "horizontal",
        top: "top",
        left: "center",
        data: datasetLabels,
        itemWidth: this.ChartDataConfig?.legend?.itemWidth || 10,
        itemHeight: this.ChartDataConfig?.legend?.itemHeight || 10,
        itemGap: this.ChartDataConfig?.legend?.itemGap || 20,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ? 16 : 12,
        },
      },

      grid: {
        top: this.ChartDataConfig?.grid?.top || "5%",
        left: this.ChartDataConfig?.grid?.left || "10%",
        right: this.ChartDataConfig?.grid?.right || "10%",
        bottom: this.ChartDataConfig?.grid?.bottom || "20%",
        containLabel: this.ChartDataConfig?.grid?.containLabel || true,
      },

      xAxis: {
        type: "value",
        scale: true,
        axisLabel: {
          color: theme.textPrimaryColor,
          // fontSize: isMobile ? 8 : 10,
          fontSize: this.showMaximizeButton ? 13 : 10,
          formatter: (value: number) => {
            return this.formatValue(value);
          },
        },
      },

      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.showMaximizeButton ?  14 : 11,
          // margin: 15,
          // lineHeight: 11,
          width: 100,
          overflow: "truncate"
        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((d) => d.valores[index]),
        itemStyle: {
          color: colors[index]
        },
        barCategoryGap: "20%",
        barGap: "20%",
        barMaxWidth: isMobile ? 15 : 25,
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
  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
