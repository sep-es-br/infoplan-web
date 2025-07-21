import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AvailableThemes, getAvailableThemesStyles } from '../../../../@theme/theme.module';

@Component({
  selector: 'ngx-vertical-bar-chart-model',
  templateUrl: './vertical-bar-chart-model.component.html',
  styles: [' .echarts { width: 100%; height: 100%; } '],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class VerticalBarChartModelComponent implements OnInit, OnChanges {
  @Input() data: { date: string, previsto: number, realizado: number }[] = [];

  @Input() colors: string[] = [];

  @Input() height: number;

  chartOptions: EChartsOption;

  echartsInstance: any = null

  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange()
      .subscribe((newTheme: { name: AvailableThemes; previous: string; }) => {
        if (this.echartsInstance) {
          this.currentTheme = newTheme.name;

          const newStyles = getAvailableThemesStyles(newTheme.name);
          const newTextColor = newStyles.textPrimaryColor;
          const newBackgroundColor = newStyles.themePrimaryColor;

          this.echartsInstance.setOption({
            tooltip: {
              textStyle: {
                color: newTextColor,
              },
              backgroundColor: newBackgroundColor,
              borderColor: newBackgroundColor,
            },
            legend: {
              textStyle: {
                color: newTextColor,
              },
            },
            yAxis: {
              axisLabel: {
                color: newTextColor,
              },
            },
            xAxis: {
              axisLabel: {
                color: newTextColor,
              },
            },
          });
        }
      });
  }

  ngOnInit() {
    this.currentTheme = (this.themeService.currentTheme as AvailableThemes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['colors']) {
      this.initChartOptions(this.data, this.colors);
    }
  }

  onChartInit(chartInstance: any) {
    this.echartsInstance = chartInstance;
  }

  formatNumber(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  initChartOptions(data: { date: string, previsto: number, realizado: number }[], colors: string[] ) {
    if (!Array.isArray(data) || data.length === 0) {
      data = [];
    }

    const currentThemeStyles = getAvailableThemesStyles(this.currentTheme);
    
    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        textStyle: {
          color: currentThemeStyles.textPrimaryColor,
        },
        backgroundColor: currentThemeStyles.themePrimaryColor,
        borderColor: currentThemeStyles.themePrimaryColor,
        formatter: (params: any) => {
          let tooltipContent = `${params[0].name}<br>`;
          params.forEach((param: any) => {
            tooltipContent += `${param.seriesName}: ${this.formatNumber(param.value)}<br>`;
          });

          return tooltipContent;
        },
      },
      legend: {
        data: ['Previsto', 'Realizado'],
        top: '5%',
        itemWidth: 10, 
        itemHeight: 10,
        itemGap: 15,
        textStyle: {
          color: currentThemeStyles.textPrimaryColor,
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.date),
        axisLabel: {
          color: currentThemeStyles.textPrimaryColor,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: currentThemeStyles.textPrimaryColor,
          fontSize: 10,
          formatter: (value: number) => this.formatNumber(value),
        },
      },
      series: [
        {
          name: 'Previsto',
          type: 'bar',
          barWidth: '40%',
          data: data.map(item => item.previsto),
          itemStyle: {
            color: colors[0], 
          },
        },
        {
          name: 'Realizado',
          type: 'bar',
          barWidth: '40%',
          data: data.map(item => item.realizado),
          itemStyle: {
            color: colors[1], 
          },
        },
      ],
    };
  }
}
