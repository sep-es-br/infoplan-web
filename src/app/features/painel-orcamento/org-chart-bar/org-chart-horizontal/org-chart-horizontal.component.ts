import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
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

  chartOptions: EChartsOption;
  echartsInstance: ECharts | null = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimer: any;

  // ✅ LISTENER DE RESIZE COM DEBOUNCE
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

  // ✅ CLEANUP
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

  // ✅ ATUALIZA GRÁFICO QUANDO REDIMENSIONAR
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
          formatter: (value: string) => {
            return this.quebrarTexto(value, this.charactersPerLine);
          },
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
          fontSize: isMobile ? 8 : 10,
          formatter: (v: number) => this.formatValue(v),
        },
      },

      yAxis: {
        type: "category",
        inverse: false,
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isTablet ? 9 : isMobile ? 10 : 11,
          margin: 8,
          overflow: "break",
          width: isPhone ? 80 : isTablet ? 80 : isMobile ? 80 : 140,
          formatter: (value: string) => {
            return this.quebrarTexto(value, this.charactersPerLine);
          },
        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((d) => d.valores[index]),
        itemStyle: { color: colors[index] },
        barCategoryGap: "30%",
        barGap: "20%",
        barMaxWidth: isMobile ? 15 : 20,
        barMinHeight: 20,
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

  private quebrarTexto(texto: string, maxCaracteres: number): string {
    if (!texto) return "";

    if (!this.showMaximizeButton) {
      if (texto.includes("de Melhoria")) {
        texto = texto.replace("de Melhoria", "...");
      }
    }

    const words = texto.split(" ");
    let lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if (
        (currentLine + (currentLine ? " " : "") + word).length > maxCaracteres
      ) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }

        if (word.length > maxCaracteres) {
          const chunks = word.match(new RegExp(`.{1,${maxCaracteres}}`, "g"));
          if (chunks) lines.push(...chunks);
        } else {
          currentLine = word;
        }
      } else {
        currentLine += (currentLine ? " " : "") + word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines.join("\n");
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
