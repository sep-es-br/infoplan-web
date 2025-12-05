import { CommonModule } from "@angular/common";
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
import { NgxEchartsModule } from "ngx-echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../@theme/theme.module";

export interface PieChartData {
  value: number;
  name: string;
  itemStyle?: any;
  [key: string]: any;
}

export interface PieChartConfig {
  showTitle?: boolean;
  titleText?: string;
  titleSubtext?: string;
  titlePosition?: "left" | "center" | "right";
  showLegend?: boolean;
  legendPosition?: "left" | "right" | "top" | "bottom";
  legendOrient?: "vertical" | "horizontal";
  showTooltip?: boolean;
  showLabels?: boolean;
  radius?: string | [string, string];
  animation?: boolean;
  emphasisScale?: boolean;
  centerPosition?: [string, string];
  gridTop?: string | number;
  gridBottom?: string | number;
  gridLeft?: string | number;
  gridRight?: string | number;
  minAngle?: number;
  avoidLabelOverlap?: boolean;
  labelLayout?: any;
}

@Component({
  selector: "ngx-pie-chart",
  templateUrl: "./org-chart-pie.component.html",
  styleUrls: ["./org-chart-pie.component.scss"],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class PieChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: PieChartData[] = [];
  @Input() colors: string[] = [];
  @Input() height: number;
  @Input() width: number;
  @Input() config: PieChartConfig = {};

  chartOptions: EChartsOption = {};
  echartsInstance: ECharts | null = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimer: any;

  private readonly defaultConfig: PieChartConfig = {
    showTitle: false,
    titleText: "",
    titleSubtext: "",
    titlePosition: "left",
    showLegend: true,
    legendPosition: "top",
    legendOrient: "vertical",
    showTooltip: true,
    showLabels: true,
    radius: ["35%", "65%"],
    animation: true,
    emphasisScale: false,
    centerPosition: ["50%", "50%"],
    gridTop: "15%",
    gridBottom: "15%",
    gridLeft: "10%",
    gridRight: "10%",
    minAngle: 5,
    avoidLabelOverlap: true,
  };

  constructor(private themeService: NbThemeService) {
    this.themeService
      .onThemeChange()
      .subscribe((theme: { name: AvailableThemes }) => {
        this.currentTheme = theme.name;
        this.updateChartTheme();
      });
  }

  // ✅ LISTENER DE RESIZE COM DEBOUNCE
  @HostListener("window:resize")
  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.updateChartOnResize();
    }, 150);
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes["data"] || changes["colors"] || changes["config"]) &&
      !changes["data"]?.firstChange
    ) {
      this.buildChart();
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
    if (!this.echartsInstance || !this.data || this.data.length === 0) return;

    const config = { ...this.defaultConfig, ...this.config };
    const themeStyles = getAvailableThemesStyles(this.currentTheme);
    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    // Ajusta raio baseado no tamanho da tela
    const radius = isMobile
      ? (isPhone ? ["25%", "55%"] : ["30%", "60%"])
      : config.radius;

    // Ajusta posição da legenda
    const legendFontSize = isPhone ? 7 : isTablet ? 8 : isMobile ? 10 : 10;
    const labelFontSize = isPhone ? 8 : isTablet ? 9 : isMobile ? 10 : 10;

    this.echartsInstance.setOption({
      legend: config.showLegend
        ? {
          textStyle: {
            color: themeStyles.textPrimaryColor,
            fontSize: legendFontSize,
          },
          itemWidth: isMobile ? 8 : 10,
          itemHeight: isMobile ? 8 : 10,
          itemGap: isMobile ? 8 : 10,
        }
        : undefined,

      series: [
        {
          radius: radius,
          label: {
            show: true,
            position: "inside",
            formatter: function (params) {
              return params.percent >= 4 ? Math.round(params.percent) + '%' : '';
            },
            fontSize: labelFontSize,
            color: "#FFFFFF",
          },
          labelLine: {
            show: true,
            length: isMobile ? 5 : 10,
            length2: isMobile ? 3 : 5,
          },
        },
      ],
    });

    this.resizeChart();
  }

  private buildChart() {
    if (!this.data || this.data.length === 0) {
      console.warn("Nenhum dado disponível para o gráfico");
      return;
    }

    const config = { ...this.defaultConfig, ...this.config };
    const themeStyles = getAvailableThemesStyles(this.currentTheme);
    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    // Responsividade inicial
    const radius = isMobile
      ? (isPhone ? ["25%", "55%"] : ["30%", "60%"])
      : config.radius;
    const legendFontSize = isPhone ? 7 : isTablet ? 8 : isMobile ? 10 : 12;
    const labelFontSize = isPhone ? 8 : isTablet ? 9 : isMobile ? 10 : 12;

    const filteredData = this.filterSmallSlices(
      this.data,
      config.minAngle || 5
    );

    this.chartOptions = {
      color: this.colors.length > 0 ? this.colors : undefined,

      grid: {
        top: config.gridTop,
        bottom: config.gridBottom,
        left: config.gridLeft,
        right: config.gridRight,
        containLabel: true,
      },

      title: config.showTitle
        ? {
          text: config.titleText,
          subtext: config.titleSubtext,
          left: config.titlePosition,
          textStyle: { color: themeStyles.textPrimaryColor },
          subtextStyle: { color: themeStyles.textSecondaryColor },
        }
        : undefined,

      tooltip: config.showTooltip
        ? {
          trigger: "item",
          formatter: (params: any) => {
            const data = params;
            const value =
              typeof data.value === "number"
                ? data.value
                : parseFloat(data.value);

            const formattedValue = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value);

            return `${data.name}: ${formattedValue} (${data.percent}%)`;
          },
          backgroundColor: themeStyles.themePrimaryColor,
          confine: true,
          textStyle: { color: themeStyles.textPrimaryColor },
        }
        : undefined,

      legend: config.showLegend
        ? {
          left: this.getLegendPosition(config.legendPosition).left,
          top: this.getLegendPosition(config.legendPosition).top,
          orient: config.legendOrient,
          right: "5%",
          textStyle: {
            color: themeStyles.textPrimaryColor,
            fontSize: legendFontSize,
          },
          type: "scroll",
          pageTextStyle: { color: themeStyles.textPrimaryColor },
          itemWidth: isMobile ? 8 : 10,
          itemHeight: isMobile ? 8 : 10,
          itemGap: isMobile ? 8 : 10,
          selectedMode: true,
        }
        : undefined,

      series: [
        {
          name: "Dados",
          type: "pie",
          radius: radius,
          center: config.centerPosition,
          data: filteredData,
          minAngle: config.minAngle,
          avoidLabelOverlap: false,
          emphasis: {
            scale: config.emphasisScale,
            scaleSize: config.emphasisScale ? 10 : 0,
            itemStyle: {
              shadowBlur: config.emphasisScale ? 10 : 0,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },

          label: {
            show: true,
            position: "inside",
            formatter: function (params) {
              return params.percent >= 4 ? Math.round(params.percent) + '%' : '';
            },
            fontSize: labelFontSize,
            color: "#FFFFFF",
          },

          labelLine: {
            show: true,
            length: isMobile ? 5 : 10,
            length2: isMobile ? 3 : 5,
            smooth: true,
          },

          animationType: "scale",
          animationEasing: "elasticOut",
          animationDelay: () => Math.random() * 200,
        },
      ],
    };

    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOptions, true);
    }
  }

  private filterSmallSlices(
    data: PieChartData[],
    minAngle: number
  ): PieChartData[] {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const minValue = (minAngle / 360) * total;

    return data.map((item) => ({
      ...item,
    }));
  }

  private getLegendPosition(position: string = "top") {
    const positions = {
      left: { left: "left", top: "center" },
      right: { left: "right", top: "center" },
      top: { left: "center", top: "top" },
      bottom: { left: "center", top: "bottom" },
    };
    return positions[position] || positions.top;
  }

  private updateChartTheme() {
    if (!this.echartsInstance) return;

    const themeStyles = getAvailableThemesStyles(this.currentTheme);

    this.echartsInstance.setOption({
      title: {
        textStyle: { color: themeStyles.textPrimaryColor },
        subtextStyle: { color: themeStyles.textSecondaryColor },
      },
      tooltip: {
        backgroundColor: themeStyles.themePrimaryColor,
        textStyle: { color: themeStyles.textPrimaryColor },
      },
      legend: {
        textStyle: { color: themeStyles.textPrimaryColor },
      },
    });
  }

  private resizeChart() {
    if (this.echartsInstance) {
      this.echartsInstance.resize();
    }
  }

  // API Pública
  public setData(newData: PieChartData[]) {
    this.data = newData;
    this.buildChart();
  }

  public setConfig(newConfig: PieChartConfig) {
    this.config = { ...this.config, ...newConfig };
    this.buildChart();
  }

  public refresh() {
    this.buildChart();
  }

  public getInstance(): ECharts | null {
    return this.echartsInstance;
  }
}