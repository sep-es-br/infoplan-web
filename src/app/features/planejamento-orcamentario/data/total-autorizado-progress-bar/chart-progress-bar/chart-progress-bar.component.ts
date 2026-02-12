import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { ChartDataConfig } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { ECharts, EChartsOption } from "echarts";
import { AvailableThemes } from "../../../planejamento-orcamentario.component";
import { NbThemeService } from "@nebular/theme";
import { getAvailableThemesStyles } from "../../../../../@theme/theme.module";
import { CommonModule } from "@angular/common";
import { NgxEchartsModule } from "ngx-echarts";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";

@Component({
  selector: "ngx-chart-progress-bar",
  templateUrl: "./chart-progress-bar.component.html",
  styleUrls: ["./chart-progress-bar.component.scss"],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class ChartProgressBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chart!: IChartOptions;
  @Input() height!: number;
  @Input() charactersPerLine!: number;
  @Input() showMaximizeButton!: boolean;
  @Input() chartDataConfig!: ChartDataConfig;

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
      if (this.echartsInstance) {
        this.currentTheme = newTheme.name;
        const newStyles = getAvailableThemesStyles(newTheme.name);

        this.echartsInstance.setOption({
          series: {
            label: {
              color: newStyles.textSecondaryColor,
            },
          },
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
          width: 100,
          overflow: "truncate",
          align: "right",
          // width: isPhone ? 80 : isTablet ? 80 : isMobile ? 80 : 140,
          // formatter: (value: string) => {
          //   const limite = this.showMaximizeButton ? 20 : 40;
          //   return this.quebrarTexto(value, limite);
          // },
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
    const labels = chart.data.labels as string[];

    const data = labels.map((label: string, i: number) => ({
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
        textStyle: {
          color: theme.textPrimaryColor,
          // lineHeight: 20,
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
              ? labelOriginal.split(" - ")[0]
              : labelOriginal;
            const uo = (dataRef.nomeUO && dataRef.nomeUO[index]) || "";

            tituloTooltip = `${codigo} - ${uo} &nbsp;&nbsp;`;
          }

          let tooltip = `${tituloTooltip} </br>`;
          params.forEach((p: any) => {
            const valor =
              p.value !== undefined && p.value !== null ? p.value : 0;
            tooltip += `${p.seriesName}: ${valor} % </br>`;
          });

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
          fontSize: this.chartDataConfig?.legend?.fontSize || 12,
        },
      },

      grid: {
        top: this.chartDataConfig?.grid?.top || "10%",
        left: this.chartDataConfig?.grid?.left || "0%",
        right: this.chartDataConfig?.grid?.right || "10%",
        bottom: this.chartDataConfig?.grid?.bottom || "10%",
        containLabel: true,
      },

      xAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isMobile ? 8 : 10,
          formatter: (v: number) => `${v} %`,
        },
      },

      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((d) => d.category),
        axisLine: { show: true },
        axisTick: { show: false },
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isMobile ? 8 : 10,
          width: 100,
          overflow: "truncate",
          align: "right",
        },
      },

      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map((d) => d.valores[index]),
        barWidth: "40%",
        barMaxWidth: 15,
        showBackground: true,
        backgroundStyle: {
          borderRadius: 10,
          color: "rgba(180, 180, 180, 0.1)", // Um fundo sutil para mostrar o total (100%)
        },

        itemStyle: {
          color: colors[index],
          borderRadius: 10,
        },

        label: {
          show: true,
          position: "right",
          distance: 8,
          formatter: (params) => params.value + " %",
          color: theme.textPrimaryColor,
          fontSize: 10,
        },
      })),
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

  //   // 1. Processa abreviações e limites
  //   const textoProcessado = this.tratarTextoEspecifico(
  //     texto,
  //     maxCaracteres * 3
  //   );

  //   const words = textoProcessado.split(" ");
  //   let lines: string[] = [];
  //   let currentLine = "";

  //   words.forEach((word) => {
  //     // Se a palavra sozinha for maior que o limite, não cortamos no meio,
  //     // a menos que seja estritamente necessário para não quebrar o layout
  //     if ((currentLine + word).length > maxCaracteres) {
  //       if (currentLine) lines.push(currentLine.trim());
  //       currentLine = word + " ";
  //     } else {
  //       currentLine += word + " ";
  //     }
  //   });

  //   if (currentLine) lines.push(currentLine.trim());

  //   // Limita a exibição a no máximo 3 ou 4 linhas para não "esticar" demais o gráfico verticalmente
  //   return lines.slice(0, 4).join("\n");
  // }

  // private tratarTextoEspecifico(texto: string, limite: number): string {
  //   if (!texto) return "";
  //   if (this.showMaximizeButton) return texto;

  //   let textoTratado = texto.toUpperCase();

  //   // 1. Abreviações mais agressivas para órgãos públicos
  //   const termosParaEncurtar = {
  //     "SECRETARIA ESTADUAL DE": "SEC.",
  //     "SECRETARIA MUNICIPAL DE": "SEC.",
  //     "CONSERVAÇÃO RODOVIÁRIA": "CONS. ROD.",
  //     ESTADUAIS: "EST.",
  //     MANUTENÇÕES: "MANUT.",
  //     RODOVIAS: "ROD.",
  //     DISTRIBUIÇÃO: "DISTRIB.",
  //     "DESEMPENHO E DEMANDA": "DESEMP./DEMANDA",
  //   };

  //   Object.entries(termosParaEncurtar).forEach(([termo, substituto]) => {
  //     textoTratado = textoTratado.replace(new RegExp(termo, "g"), substituto);
  //   });

  //   if (textoTratado.length > limite) {
  //     textoTratado = textoTratado.substring(0, limite) + "...";
  //   }

  //   return textoTratado;
  // }
}
