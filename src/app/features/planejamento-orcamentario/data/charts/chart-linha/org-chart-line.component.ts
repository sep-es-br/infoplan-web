import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { NgxEchartsModule } from "ngx-echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../../../@theme/theme.module";
import { NbThemeService } from "@nebular/theme";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import { ECharts, EChartsOption } from "echarts";
import { ChartDataConfig } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";

@Component({
  selector: "ngx-org-chart-line",
  templateUrl: "./org-chart-line.component.html",
  styles: [".echarts { width: 100%; height: 100%; }"],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class OrgChartLineComponent implements OnInit, OnChanges, OnDestroy {
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
          fontSize: isTablet ? 9 : isMobile ? 10 : 11,
          margin: 8,
          overflow: "break",
          width: isPhone ? 80 : isTablet ? 80 : isMobile ? 80 : 140,
        },
      },
      xAxis: {
        axisLabel: {
          fontSize: isTablet ? 9 : isMobile ? 10 : 11,
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
      (dataset) => dataset.backgroundColor || "#4DB6D2"
    );

    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    this.chartOptions = {
      tooltip: {
        trigger: "axis",
        // Para linha, 'line' ou 'cross' fica muito melhor
        axisPointer: { type: "line" },
        backgroundColor: theme.themePrimaryColor,
        borderColor: theme.themePrimaryColor,
        textStyle: { color: theme.textPrimaryColor },
        confine: true,
        formatter: (params: any) => {
          let tooltip = `${params[0].name}<br>`;
          params.forEach((p: any) => {
            // Adiciona a bolinha colorida da série antes do nome
            tooltip += `${p.marker} ${p.seriesName}: ${this.formatNumber(
              p.value
            )}<br>`;
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
          fontSize: this.ChartDataConfig?.legend?.fontSize || 9,
        },
      },

      grid: {
        top: this.ChartDataConfig?.grid?.top || "20%",
        left: this.ChartDataConfig?.grid?.left || "8%",
        right: this.ChartDataConfig?.grid?.right || "5%",
        bottom: this.ChartDataConfig?.grid?.bottom || "10%",
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: data.map((d) => d.category),
        boundaryGap: false,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isTablet ? 9 : isMobile ? 10 : 11,
          margin: 8,
          overflow: "break",
          width: isPhone ? 80 : isTablet ? 80 : isMobile ? 80 : 140,
        },
      },

      yAxis: {
        type: "value",
        axisLine: {
          show: true,
          lineStyle: { color: theme.textPrimaryColor, width: 2 },
        },
        axisLabel:{
          formatter: (v: number) => `R$ ${this.formatValue(v)}`,
          color: theme.textPrimaryColor,
          fontSize: isTablet ? 9 : isMobile ? 10 : 11,
        },
        splitLine: { lineStyle: { type: "solid", opacity: 0.3 } },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "line",
        data: data.map((d) => d.valores[index]),
        itemStyle: { color: colors[index] },
        symbolSize: 7,
        showSymbol: true,
        smooth: true,
        stack: "total",
      })),

      dataZoom: [
        {
          type: "slider",
          xAxisIndex: 0,
          start: 0,
          end: (9 / data.length) * 100,
          show: data.length > 9, // Só mostra se tiver muitos dados
          bottom: 10,
          handleSize: "80%",
        },
        {
          type: "inside",
          xAxisIndex: 0,
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

  // private quebrarTexto(texto: string, maxCaracteres: number): string {
  //   if (!texto) return "";

  //   if (!this.showMaximizeButton) {
  //     if (texto.includes("de Melhoria")) {
  //       texto = texto.replace("de Melhoria", "...");
  //     }
  //   }

  //   const words = texto.split(" ");
  //   let lines: string[] = [];
  //   let currentLine = "";

  //   for (const word of words) {
  //     if (
  //       (currentLine + (currentLine ? " " : "") + word).length > maxCaracteres
  //     ) {
  //       if (currentLine) {
  //         lines.push(currentLine);
  //         currentLine = "";
  //       }

  //       if (word.length > maxCaracteres) {
  //         const chunks = word.match(new RegExp(`.{1,${maxCaracteres}}`, "g"));
  //         if (chunks) lines.push(...chunks);
  //       } else {
  //         currentLine = word;
  //       }
  //     } else {
  //       currentLine += (currentLine ? " " : "") + word;
  //     }
  //   }
  //   if (currentLine) lines.push(currentLine);

  //   return lines.join("\n");
  // }

  private formatValue(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + " B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + " M";
    return value.toString();
  }

  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
