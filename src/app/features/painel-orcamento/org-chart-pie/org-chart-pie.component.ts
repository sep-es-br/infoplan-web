import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ECharts, EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AvailableThemes, getAvailableThemesStyles } from '../../../@theme/theme.module';
import { animation } from '@angular/animations';

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
  radius?: string | number;
  isDonut?: boolean;
  donutRadius?: [string | number, string | number];
  animation?: boolean;
  emphasisScale?: boolean;
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

  @HostListener('window:resize')
  onResize() {
    this.updateChart();
  }

  chartOptions: EChartsOption;
  echartsInstance: ECharts = null;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  private defaultConfig: PieChartConfig = {
    showTitle: true,
    titleText: '',
    titleSubtext: '',
    titlePosition: 'left',
    showLegend: true,
    legendPosition: 'top',
    legendOrient: 'vertical',
    showTooltip: true,
    showLabels: true,
    radius: '50%',
    isDonut: false,
    donutRadius: ['40%', '70%'],
    animation: true,
    emphasisScale: true,
  };

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange()
      .subscribe((newTheme: { name: AvailableThemes }) => {
        this.currentTheme = newTheme.name;
        this.updateChartTheme();
      });
  }

  ngOnInit() {
    this.currentTheme = (this.themeService.currentTheme as AvailableThemes);
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['colors'] || changes['config']) {
      console.log('Changes detected in PieChartComponent:', changes['data']);
      this.initChart();
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
  }

  private initChart() {
    const mergedConfig = { ...this.defaultConfig, ...this.config };
    const themeStyles = getAvailableThemesStyles(this.currentTheme);

    this.chartOptions = {
      title: this.getTitleConfig(mergedConfig, themeStyles),
      tooltip: this.getTooltipConfig(mergedConfig, themeStyles),
      legend: this.getLegendConfig(mergedConfig, themeStyles),
      series: [this.getSeriesConfig(mergedConfig)],
      color: this.colors?.length ? this.colors : undefined,
      animation: mergedConfig.animation,
    };
  }

  private getTitleConfig(config: PieChartConfig, themeStyles: any): any {
    if (!config.showTitle) return { show: false };

    return {
      text: config.titleText,
      subtext: config.titleSubtext,
      left: config.titlePosition,
      textStyle: {
        color: themeStyles.textPrimaryColor,
      },
      subtextStyle: {
        color: themeStyles.textSecondaryColor,
      },
    };
  }

  private getTooltipConfig(config: PieChartConfig, themeStyles: any): any {
    if (!config.showTooltip) return { show: false };

    return {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: themeStyles.themePrimaryColor,
      borderColor: themeStyles.borderColor,
      textStyle: {
        color: themeStyles.textPrimaryColor,
      },
    };
  }

  private getLegendConfig(config: PieChartConfig, themeStyles: any): any {
    if (!config.showLegend) return { show: false };

    const positionMap = {
      left: { left: 'left', top: 'center', orient: 'vertical' },
      right: { left: 'right', top: 'center', orient: 'vertical' },
      top: { left: 'center', top: 'top', orient: 'horizontal' },
      bottom: { left: 'center', top: 'bottom', orient: 'horizontal' },
    };

    const position = positionMap[config.legendPosition] || positionMap.left;
    return {
      ...position,
      data: this.data.map(item => item.name) || [],
      textStyle: {
        color: themeStyles.textPrimaryColor,

      },
    };
  }

  private getSeriesConfig(config: PieChartConfig): any {
    const radius = config.isDonut ? config.donutRadius : config.radius;

    return {
      name: 'Data',
      type: 'pie',
      radius: ['40%', '70%'],
      data: this.data || [],
      center: ['50%', '40%'],
      emphasis: {
        scale: false,
        scaleSize:0,
        itemStyle: {
          shadowBlur: 0,
          shadowOffsetX: 0,
        },
      },
      label: {
        show: true,
        position: 'inside',
        formatter: function(params) {
          // Mostra porcentagem apenas se a fatia for maior que 5%
          return params.percent > 5 ? params.percent + '%' : '';
        },
        fontSize: 14,
      },
      labelLine: {
        show: false,
      },
      animation: false,

    };
  }

  private updateChart() {
    if (this.echartsInstance) {
      this.initChart();
      this.echartsInstance.setOption(this.chartOptions);
    }
  }

  private updateChartTheme() {
    if (!this.echartsInstance) return;

    const themeStyles = getAvailableThemesStyles(this.currentTheme);

    this.echartsInstance.setOption({
      title: {
        textStyle: {
          color: themeStyles.textPrimaryColor,
        },
        subtextStyle: {
          color: themeStyles.textSecondaryColor,
        },
      },
      tooltip: {
        backgroundColor: themeStyles.themePrimaryColor,
        borderColor: "",
        textStyle: {
          color: themeStyles.textPrimaryColor,
        },
      },
      legend: {
        textStyle: {
          color: themeStyles.textPrimaryColor,
        },
      },
    });
  }

  // Métodos públicos para API
  public setData(newData: PieChartData[]) {
    this.data = newData;
    this.initChart();
    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOptions);
    }
  }

  public setConfig(newConfig: PieChartConfig) {
    this.config = { ...this.config, ...newConfig };
    this.initChart();
    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOptions);
    }
  }

  public refresh() {
    this.updateChart();
  }

  public getInstance(): ECharts {
    return this.echartsInstance;
  }
}
