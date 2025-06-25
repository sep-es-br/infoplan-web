import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AvailableThemes, getAvailableThemesStyles } from '../../../@theme/theme.module';

@Component({
  selector: 'ngx-pie-chart-model',
  templateUrl: './pieChartModel.component.html',
  styleUrls: ['./pieChartModel.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class PieChartModelComponent implements OnInit, OnChanges {
  @Input() data: { value: number, name: string }[] = [];

  @Input() colors: string[] = [];

  @Input() height: number;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateTitlePosition();
  }

  chartOptions: EChartsOption;

  echartsInstance: any = null

  centerX: number = 70;

  centerY: number = 50;

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
            title: {
              textStyle: {
                color: newTextColor,
              },
            },
            legend: {
              textStyle: {
                color: newTextColor,
              },
              tooltip: {
                backgroundColor: newBackgroundColor,
                borderColor: newBackgroundColor,
                textStyle: {
                  color: newTextColor,
                },
              },
            },
            series: {
              label: {
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

    chartInstance.on('legendselectchanged', (params: any) => {
      const selected = params.selected;

      if (Array.isArray(this.data) && this.data.length > 0) {
        const newTotal = this.data.reduce((sum, item) => {
          return selected[item.name] ? sum + item.value : sum;
        }, 0);

        chartInstance.setOption({
          title: {
            text: `${newTotal}`,
          },
        });
      }
    });
  }

  updateTitlePosition() {
    const screenWidth = window.innerWidth;
    const offset = screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)
      ? this.centerX - 2
      : this.centerX - 1;

    if (this.echartsInstance) {
      this.echartsInstance.setOption({
        title: {
          left: `${offset}%`,
        }
      });
    }
  }

  initChartOptions(data: { value: number, name: string }[], colors: string[]) {
    const total = Array.isArray(data) && data.length > 0
      ? data.reduce((sum, item) => sum + item.value, 0)
      : 0;

    const screenWidth = window.innerWidth;
    const offset = screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)
      ? this.centerX - 2
      : this.centerX - 1;

    const currentThemeStyles = getAvailableThemesStyles(this.currentTheme);

    this.chartOptions = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `${params.name}: ${params.value} (${params.percent}%)`;
        },
        textStyle: {
          color: currentThemeStyles.textPrimaryColor,
        },
        backgroundColor: currentThemeStyles.themePrimaryColor,
        borderColor: currentThemeStyles.themePrimaryColor,
      },
      title: {
        text: `${total}`,
        left: `${offset}%`,
        top: `${this.centerY}%`,
        textAlign: 'center',
        textVerticalAlign: 'middle',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: currentThemeStyles.textPrimaryColor,
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'top',
        tooltip: {
          textStyle: {
            color: currentThemeStyles.textPrimaryColor,
          },
          backgroundColor: currentThemeStyles.themePrimaryColor,
          borderColor: currentThemeStyles.themePrimaryColor,
          show: true,
          formatter: function (params) {
            const item = data.find(item => item.name === params.name);
            if (item) {
              const percent = (item.value / total) * 100;
              return `${item.name}: ${item.value} (${percent.toFixed(2)}%)`;
            }
            return '';
          }
        },
        data: data ? data.map(item => item.name) : [],
        textStyle: {
          fontSize: 9,
          color: currentThemeStyles.textPrimaryColor,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        selectedMode: true,
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['60%', '100%'],
          center: [`${this.centerX}%`, `${this.centerY}%`],
          data: data || [],
          emphasis: { scale: false },
          label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
              return params.percent >= 6 ? Math.round(params.percent) + '%' : '';
            },
            color: currentThemeStyles.textPrimaryColor,
            fontSize: 9,
          },
          labelLine: { show: false },
        }
      ],
      color: colors || [],
    };
  }
}
