import {
  Component,
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
import { IChartOptions } from "./../../../../shared/models/painel-orcamento/IChartOptions";

@Component({
  selector: "ngx-org-chart-vertical",
  templateUrl: "./org-chart-vertical.component.html",
  styles: [`
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
  `],
})
export class OrgChartVerticalComponent implements OnInit, OnChanges {
  @Input() chart!: IChartOptions;
  @Input() height: number;
  @Input() barGap: string = "30";
  @Input() isMaximized!: boolean;
  echartsInstance: ECharts | null = null;
  chartOptions: EChartsOption;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

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

    if (changes["height"] || changes["isMaximized"]) {
      this.resizeChart();
    }
  }

  private resizeChart(): void {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance?.resize({
          width: 'auto',
          height: this.height // ⬅️ USA A ALTURA NUMÉRICA
        });
        console.log("📐 Gráfico redimensionado para altura:", this.height);
      }, 100);
    } else {
      console.log("⚠️ echartsInstance não disponível para redimensionar");
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
    const colors = chart.data.datasets.map(dataset =>
      dataset.backgroundColor || this.getFallbackColor(chart.data.datasets.indexOf(dataset))
    );

    const data = chart.data.labels.map((label: string, i: number) => ({
      category: label,
      valores: chart.data.datasets.map(dataset => dataset.data[i] ?? 0)
    }));

    const isMobile = window.innerWidth <= 768;

    // ⬇️ LÓGICA INTELIGENTE PARA ROTAÇÃO ⬇️
    const shouldRotate = this.shouldRotateLabels(data.map(d => d.category), isMobile);
    const rotateAngle = shouldRotate ? 45 : 0;

    console.log("🔍 Detecção de rotação:", {
      labels: data.map(d => d.category),
      shouldRotate,
      rotateAngle
    });

    this.chartOptions = {
      grid: {
        top: "20%",
        left: "12%",
        bottom: shouldRotate ? "15%" : "8%", // Aumentei o bottom quando rotacionado
        right: "5%",
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
        data: chart.data.datasets.map(r => r.label),
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        textStyle: {
          color: theme.textPrimaryColor,
          fontSize: 10
        },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.category),
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isMobile ? 8 : 9,
          interval: 0,
          rotate: rotateAngle,
          margin: 12,
          overflow: 'truncate',
          width: shouldRotate ? 80 : undefined, // Reduzi a width
        },
        axisTick: {
          alignWithLabel: shouldRotate
        }
      },
      yAxis: {
        type: "value",
        inverse: false,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isMobile ? 8 : 10,
          overflow: "truncate",
          width: isMobile ? 20 : 100,
          formatter: (v: number) => this.formatValue(v),
        },
      },
      series: chart.data.datasets.map((dataset, index) => ({
        name: dataset.label,
        type: "bar",
        data: data.map(res => res.valores[index]),
        itemStyle: {
          color: colors[index],
          // borderColor: colors[index],
          borderWidth: 1
        },
        barMaxWidth: isMobile ? 20 : 40,
        barCategoryGap: shouldRotate ? '20%' : '30%',
        barGap: `${this.barGap}%`,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }))
    };
  }

  /**
   * Lógica inteligente para decidir quando rotacionar labels
   */
  private shouldRotateLabels(labels: string[], isMobile: boolean): boolean {
    // Se for mobile, sempre rotaciona se tiver mais de 3 labels
    if (isMobile && labels.length > 3) {
      return true;
    }

    // Se tiver apenas 1 label, nunca rotaciona
    if (labels.length === 1) {
      return false;
    }

    // Verifica se há labels longos que precisam de rotação
    const hasLongLabels = labels.some(label => {
      const labelLength = label.toString().length;
      return labelLength > 10; // Considera "longo" se tiver mais de 10 caracteres
    });

    // Verifica se há muitos labels (mais de 6)
    const hasManyLabels = labels.length > 6;

    // Verifica se todos os labels são curtos (apenas números ou palavras curtas)
    const allLabelsAreShort = labels.every(label => {
      const labelStr = label.toString();
      const isYear = /^\d{4}$/.test(labelStr); // 2024, 2025, etc
      const isShortWord = labelStr.length <= 8; // Palavras com até 8 caracteres
      return isYear || isShortWord;
    });

    console.log("📊 Análise de labels:", {
      labels,
      isMobile,
      hasLongLabels,
      hasManyLabels,
      allLabelsAreShort
    });

    // Rotaciona apenas se tiver labels longos OU muitos labels E não forem todos curtos
    return (hasLongLabels || hasManyLabels) && !allLabelsAreShort;
  }
  // MÉTODO PARA CORES DE FALLBACK
  private getFallbackColor(index: number): string {
    const fallbackColors = [
      "#4DB6D2", "#F58B9B", "#AF9552", "#2E88B9",
      "#549b7f", "#A671C4", "#C5C5C5",
      "#2d6981", "#dd7788", "#c7a921"
    ];
    return fallbackColors[index % fallbackColors.length];
  }

  private formatValue(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(0) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + "M";
    return value.toString();
  }

  private formatNumber(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}