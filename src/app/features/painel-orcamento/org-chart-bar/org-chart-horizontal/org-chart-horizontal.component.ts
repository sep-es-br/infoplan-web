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
          formatter: (value: string) => {
            const limite = isMobile ? 15 : 20;
            return this.quebrarTexto(value, limite);
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
        textStyle: { color: theme.textPrimaryColor },
        confine: true,
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
            tituloTooltip = `<span>${uo}</span> - <small>${po}</small>`;
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
            if (codigo) partes.push(`<span>${codigo}</span>`);
            if (uo) partes.push(`<small>${uo}</small>`);

            tituloTooltip = partes.join(" ");
          }

          let tooltip = `${tituloTooltip}<br>`;

          params.forEach((p: any) => {
            const valorRaw =
              p.value !== undefined && p.value !== null ? p.value : 0;
            const valorFormatado = this.formatNumber(valorRaw);
            tooltip += `<span>${p.seriesName}: <span>${valorFormatado}</span></span><br>`;
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
        top: this.ChartDataConfig?.grid?.top || "5%",
        left: this.ChartDataConfig?.grid?.left || "5%",
        right: this.ChartDataConfig?.grid?.right || "10%",
        bottom: this.ChartDataConfig?.grid?.bottom || "5%",
        containLabel: this.ChartDataConfig?.grid?.containLabel || true,
      },

      xAxis: {
        type: "value",
        scale: true,
        min: 0,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isMobile ? 8 : 10,
          formatter: (v: number) => this.formatValue(v),
        },
      },

      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isMobile ? 9 : 11,
          margin: 15,
          // Alinha o bloco de texto à direita para que ele "encoste" na linha do eixo
          align: "right",
          lineHeight: 11,
          verticalAlign: "middle",
          width: isMobile ? 90 : 160,
          overflow: "breakAll", // Deixamos a quebra apenas para sua função
          formatter: (value: string) => {
            // Passamos o limite dinâmico. 20-25 caracteres costuma ser o ideal.
            const limite = isMobile ? 15 : 20;
            return this.quebrarTexto(value, limite);
          },
        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((d) => d.valores[index]),
        itemStyle: { color: colors[index] },
        barCategoryGap: "20%",
        barGap: "20%",
        barMaxWidth: isMobile ? 15 : 25,
        barMinWidth: 5,
        barMinHeight: 15,
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

    const words = texto.split(" ");
    let lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length > maxCaracteres) {
        if (currentLine.length > 0) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          lines.push(word.substring(0, maxCaracteres));
          currentLine = word.substring(maxCaracteres) + " ";
        }
      } else {
        currentLine += word + " ";
      }
    });

    if (currentLine) lines.push(currentLine.trim());
    return lines.slice(0, 3).join("\n");
  }

  private formatValue(value: number): string {
    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000_000)
      return (value / 1_000_000_000_000).toFixed(1).replace(".0", "") + "T";
    if (absValue >= 1_000_000_000)
      return (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
    if (absValue >= 1_000_000)
      return (value / 1_000_000).toFixed(1).replace(".0", "") + "M";
    if (absValue >= 1_000)
      return (value / 1_000).toFixed(1).replace(".0", "") + "K";

    return value.toString();
  }
  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
