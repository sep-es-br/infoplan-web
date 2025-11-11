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
  centerPosition?: [string, string];
  gridTop?: string | number;
  gridBottom?: string | number;
  gridLeft?: string | number;
  gridRight?: string | number;
  minAngle?: number; // Novo: ângulo mínimo para slices
  avoidLabelOverlap?: boolean; // Novo: evitar sobreposição
  labelLayout?: any; // Novo: layout das labels
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
    legendOrient: 'vertical',
    showTooltip: true,
    showLabels: true,
    radius: ['35%', '65%'], // Ajustado para melhor visualização
    animation: true,
    emphasisScale: false,
    centerPosition: ['50%', '50%'], // Centralizado
    gridTop: '15%',
    gridBottom: '15%',
    gridLeft: '10%',
    gridRight: '10%',
    minAngle: 5, // Evita slices muito pequenos
    avoidLabelOverlap: true, // Previne sobreposição
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

    // Filtra dados muito pequenos se necessário
    const filteredData = this.filterSmallSlices(this.data, config.minAngle || 5);

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
        formatter: (params: any) => {
          const data = params;
          return `${data.name}: ${data.value} (${data.percent}%)`;
        },
        backgroundColor: themeStyles.themePrimaryColor,
        confine: true,
        textStyle: { color: themeStyles.textPrimaryColor },
      } : undefined,

      legend: config.showLegend ? {
        left: this.getLegendPosition(config.legendPosition).left,
        top: this.getLegendPosition(config.legendPosition).top,
        orient: config.legendOrient,

        textStyle: {
          color: themeStyles.textPrimaryColor,
          fontSize: 8
        },
        type: 'scroll', // Adiciona scroll se houver muitos itens
        pageTextStyle: { color: themeStyles.textPrimaryColor },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        selectedMode: true,
      } : undefined,

      series: [{
        name: 'Dados',
        type: 'pie',
        radius: config.radius,
        center: config.centerPosition,
        data: filteredData,
        minAngle: config.minAngle, // Ângulo mínimo para slices
        avoidLabelOverlap: config.avoidLabelOverlap, // Evita sobreposição

        emphasis: {
          scale: config.emphasisScale,
          scaleSize: config.emphasisScale ? 10 : 0,
          itemStyle: {
            shadowBlur: config.emphasisScale ? 10 : 0,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },

        label: {
          show: config.showLabels,
          position: 'outside',
          formatter: (params: any) => {
            // Mostra label apenas se o percentual for maior que 2%
            return params.percent > 2 ? `${params.name}\n${params.percent.toFixed(1)}%` : '';
          },
          fontSize: 1,
          color: themeStyles.textPrimaryColor,
          fontWeight: 'normal',
          backgroundColor: 'auto', // Fundo automático para melhor contraste
          padding: [0],
          borderRadius: 1,
        },

        labelLine: {
          show: true,
          length: 10,
          length2: 5,
          smooth: true,
        },

        // Layout para evitar sobreposição
        labelLayout: {
          hideOverlap: true,
          moveOverlap: 'shiftY',
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

  /**
   * Filtra slices muito pequenos para melhor visualização
   */
  private filterSmallSlices(data: PieChartData[], minAngle: number): PieChartData[] {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const minValue = (minAngle / 360) * total;

    return data.map(item => ({
      ...item,
      // Mantém todos os dados, mas ajusta a visualização via minAngle
    }));
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
