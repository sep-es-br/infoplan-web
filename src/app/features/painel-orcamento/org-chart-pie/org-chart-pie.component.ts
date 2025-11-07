import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ECharts, EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AvailableThemes, getAvailableThemesStyles } from '../../../@theme/theme.module';

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
  titlePosition?: 'left' | 'center' | 'right';
  showLegend?: boolean;
  legendPosition?: 'left' | 'right' | 'top' | 'bottom';
  legendOrient?: 'vertical' | 'horizontal';
  showTooltip?: boolean;
  showLabels?: boolean;
  radius?: string | [string, string];
  animation?: boolean;
  emphasisScale?: boolean;
  centerPosition?: [string, string]; // Controla posição [horizontal, vertical]
  gridTop?: string | number;
  gridBottom?: string | number;
  gridLeft?: string | number; // Controla margem esquerda
  gridRight?: string | number; // Controla margem direita
}

@Component({
  selector: 'ngx-pie-chart',
  templateUrl: './org-chart-pie.component.html',
  styleUrls: ['./org-chart-pie.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class PieChartComponent implements OnInit, OnChanges {
  @Input() data: PieChartData[] = [];
  @Input() colors: string[] = [];
  @Input() height: string | number = '400px';
  @Input() width: string | number = '100%';
  @Input() config: PieChartConfig = {};

  chartOptions: EChartsOption = {};
  echartsInstance: ECharts | null = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  private readonly defaultConfig: PieChartConfig = {
    showTitle: false,
    titleText: '',
    titleSubtext: '',
    titlePosition: 'left',
    showLegend: true,
    legendPosition: 'top',
    legendOrient: 'horizontal',
    showTooltip: true,
    showLabels: true,
    radius: ['40%', '70%'],
    animation: true,
    emphasisScale: false,
    centerPosition: ['50%', '55%'],
    gridTop: '15%',
    gridBottom: '10%',
    gridLeft: '10%',
    gridRight: '10%',
  };

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange().subscribe((theme: { name: AvailableThemes }) => {
      this.currentTheme = theme.name;
      this.updateChartTheme();
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeChart();
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['data'] || changes['colors'] || changes['config']) && !changes['data']?.firstChange) {
      this.buildChart();
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
  }

  private buildChart() {
    if (!this.data || this.data.length === 0) {
      console.warn('Nenhum dado disponível para o gráfico');
      return;
    }

    const config = { ...this.defaultConfig, ...this.config };
    const themeStyles = getAvailableThemesStyles(this.currentTheme);

    this.chartOptions = {
      color: this.colors.length > 0 ? this.colors : undefined,

      grid: {
        top: config.gridTop,
        bottom: config.gridBottom,
        left: config.gridLeft,
        right: config.gridRight,
        containLabel: true,
      },

      title: config.showTitle ? {
        text: config.titleText,
        subtext: config.titleSubtext,
        left: config.titlePosition,
        textStyle: { color: themeStyles.textPrimaryColor },
        subtextStyle: { color: themeStyles.textSecondaryColor },
      } : undefined,

      tooltip: config.showTooltip ? {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: themeStyles.themePrimaryColor,
        confine: true,
        textStyle: { color: themeStyles.textPrimaryColor },
      } : undefined,

      legend: config.showLegend ? {
        left: this.getLegendPosition(config.legendPosition).left,
        top: this.getLegendPosition(config.legendPosition).top,
        orient: config.legendOrient,
        textStyle: { color: themeStyles.textPrimaryColor },
      } : undefined,

      series: [{
        name: 'Dados',
        type: 'pie',
        radius: config.radius,
        center: config.centerPosition,
        data: this.data,

        emphasis: {
          scale: config.emphasisScale,
          scaleSize: config.emphasisScale ? 10 : 0,
          itemStyle: {
            shadowBlur: config.emphasisScale ? 10 : 0,
            shadowOffsetX: 0,
          },
        },

        label: {
          show: config.showLabels,
          position: 'inside',
          formatter: (params: any) => params.percent > 5 ? `${params.percent.toFixed(1)}%` : '',
          fontSize: 14,
          color: '#fff',
          fontWeight: 'bold',
        },

        labelLine: {
          show: false,
        },

        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: () => Math.random() * 200,
      }],
    };

    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOptions, true);
    }
  }

  private getLegendPosition(position: string = 'top') {
    const positions = {
      left: { left: 'left', top: 'center' },
      right: { left: 'right', top: 'center' },
      top: { left: 'center', top: 'top' },
      bottom: { left: 'center', top: 'bottom' },
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
