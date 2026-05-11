import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { IChartOptions } from '../../../../../shared/models/budget-panel/IChartOptions';
import { ECharts, EChartsOption } from 'echarts';
import { AvailableThemes, getAvailableThemesStyles } from '../../../../../@theme/theme.module';
import { ChartDataConfig } from '../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { NbThemeService } from '@nebular/theme';

export type GroupingMode = 'YEAR_GND' | 'GND';

@Component({
  selector: 'ngx-org-chart-opposite',
  templateUrl: './org-chart-opposite.component.html',
  imports: [
    CommonModule,
    NgxEchartsModule
  ],
  standalone: true,
  styles: [
    `
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
    `
  ]
})
export class OrgChartOppositeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chart!: IChartOptions;
  @Input() height!: number;
  @Input() isMaximized!: boolean;
  @Input() chartDataConfig!: ChartDataConfig;
  @Input() groupingMode: GroupingMode = 'YEAR_GND';

  echartsInstance: ECharts | null = null;
  chartOptions!: EChartsOption;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimeout: any;
  private lastYear: string = '';
  private lastGnd: string = '';

  private colorPalette = [
    '#6385EA',
    '#53D6AA',
    '#FFCA5F',
    '#EF8A9E',
    '#B28AFE',
    '#59B6F9'
  ];


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


  ngOnInit(): void {
    this.currentTheme = (this.themeService.currentTheme as AvailableThemes);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chart'] || changes['groupingMode'] || changes['isMaximized']) {
      this.updateChart();
    }
    if (changes['height'] && this.echartsInstance) {
      this.resizeChart();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resizeTimeout);
    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
    this.resizeChart();
  }

  private updateChart() {
    if (!this.chart?.data || !this.chart.data.datasets || this.chart.data.datasets.length < 2) {
      this.chartOptions = null!;
      return;
    }

    const labelsRaw = this.chart.data.labels || [];
    const datasetsRaw = this.chart.data.datasets;

    if (labelsRaw.length === 0 || datasetsRaw.length < 2) {
      this.chartOptions = null!;
      return;
    }

    let processedLabels: string[] = [];
    const series: any[] = [];
    const uniqueYears = Array.from(new Set(labelsRaw.map(l => l.split('|#|')[0]))).sort().reverse();
    const uniqueGnds = Array.from(new Set(labelsRaw.map(l => l.includes('|#|') ? l.split('|#|')[1] : l))).sort();

    const barWidth = this.isMaximized ? 25 : 20;

    if (this.groupingMode === 'YEAR_GND') {
      processedLabels = labelsRaw;

      uniqueGnds.forEach((gnd) => {
        const empenhadoData = labelsRaw.map((label, idx) => {
          const currentGnd = label.includes('|#|') ? label.split('|#|')[1] : label;
          return currentGnd === gnd ? datasetsRaw[0].data[idx] : null;
        });

        const liquidadoData = labelsRaw.map((label, idx) => {
          const currentGnd = label.includes('|#|') ? label.split('|#|')[1] : label;
          return currentGnd === gnd ? datasetsRaw[1].data[idx] : null;
        });

        const baseColor = this.getGndColor(gnd, 1);
        const fadedColor = this.getGndColor(gnd, 0.4);

        series.push({
          name: `${gnd} (Empenhado)`,
          type: 'bar',
          data: empenhadoData,
          barWidth: barWidth,
          barCategoryGap: '30%',
          itemStyle: { color: fadedColor, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'insideRight', formatter: (p: any) => p.value !== null ? `${p.value.toFixed(1)}%` : '', color: '#777', fontSize: 10 },
          z: 1
        });

        series.push({
          name: `${gnd} (Liquidado)`,
          type: 'bar',
          data: liquidadoData,
          barWidth: barWidth,
          barGap: '-100%',
          barCategoryGap: '30%',
          itemStyle: { color: baseColor, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'inside', formatter: (p: any) => p.value !== null ? `${p.value.toFixed(1)}%` : '', color: '#fff', fontSize: 10, textBorderColor: 'rgba(0,0,0,0.5)', textBorderWidth: 1 },
          z: 2
        });
      });
    } else {
      // MODO DESPESAS: Agrupar por GND, mantendo anos separados em linhas e cores por ano
      processedLabels = [];
      uniqueGnds.forEach(gnd => {
        uniqueYears.forEach(year => {
          processedLabels.push(`${gnd}|#|${year}`);
        });
      });

      uniqueYears.forEach((year, yIdx) => {
        const baseColor = this.colorPalette[yIdx % this.colorPalette.length];
        const fadedColor = this.getOpacityColor(baseColor, 0.4);

        // Empenhado do Ano
        series.push({
          name: `${year} (Empenhado)`,
          type: 'bar',
          data: processedLabels.map(label => {
            const [lGnd, lYear] = label.split('|#|');
            if (lYear === year.toString()) {
              const idx = labelsRaw.findIndex(l => l === `${year}|#|${lGnd}`);
              return idx !== -1 ? datasetsRaw[0].data[idx] : null;
            }
            return null;
          }),
          barWidth: barWidth,
          barCategoryGap: '30%',
          itemStyle: { color: fadedColor, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'insideRight', formatter: (p: any) => p.value !== null ? `${p.value.toFixed(1)}%` : '', color: '#777', fontSize: 10 },
          z: 1
        });

        // Liquidado do Ano
        series.push({
          name: `${year} (Liquidado)`,
          type: 'bar',
          data: processedLabels.map(label => {
            const [lGnd, lYear] = label.split('|#|');
            if (lYear === year.toString()) {
              const idx = labelsRaw.findIndex(l => l === `${year}|#|${lGnd}`);
              return idx !== -1 ? datasetsRaw[1].data[idx] : null;
            }
            return null;
          }),
          barWidth: barWidth,
          barGap: '-100%',
          barCategoryGap: '30%',
          itemStyle: { color: baseColor, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'inside', formatter: (p: any) => p.value !== null ? `${p.value.toFixed(1)}%` : '', color: '#fff', fontSize: 10, textBorderColor: 'rgba(0,0,0,0.5)', textBorderWidth: 1 },
          z: 2
        });
      });
    }

    const theme = getAvailableThemesStyles(this.currentTheme);
    const isMobile = window.innerWidth <= 768;
    this.lastYear = '';
    this.lastGnd = '';

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: theme.themePrimaryColor,
        borderColor: theme.themePrimaryColor,
        textStyle: { color: theme.textPrimaryColor, fontSize: 12 },
        // extraCssText: 'box-shadow: 0 0 6px rgba(0,0,0,0.1); border-radius: 4px; padding: 8px;',
        formatter: (params: any) => {
          const validParams = params.filter((p: any) => p.value !== null && p.value !== undefined);
          if (validParams.length === 0) return '';

          const nameParts = validParams[0].name.split('|#|');
          const year = this.groupingMode === 'YEAR_GND' ? nameParts[0] : (nameParts.length > 1 ? nameParts[1] : '');
          const gnd = this.groupingMode === 'YEAR_GND' ? (nameParts.length > 1 ? nameParts[1] : nameParts[0]) : nameParts[0];

          const dataIndex = labelsRaw.findIndex(l => l === `${year}|#|${gnd}`);
          const extra = this.chart.data.datasets[0].extra ? this.chart.data.datasets[0].extra[dataIndex] : null;

          if (!extra) return '';

          let tooltipHtml = `<div style="line-height: 1.6;">
                    <div style="font-weight: 600; font-size: 13px;">${gnd}</div>
                    <div style="margin-bottom: 8px;">Exercício ${year}</div>
                    <div>Empenhado: <b>${extra.percCom.toFixed(1)}%</b></div>
                    <div>Liquidado: <b>${extra.percLiq.toFixed(1)}%</b></div>
                  </div>`;
          
          return tooltipHtml;
        }
      },
      legend: {
        show: true,
        textStyle: { color: theme.textPrimaryColor },
        bottom: 0,
        type: 'scroll',
        padding: [5, 10]
      },
      grid: {
        left: '5%',
        right: '8%',
        bottom: '15%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? 14 : 11,
          formatter: '{value}%'
        },
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.1 } }
      },
      yAxis: {
        type: 'category',
        data: processedLabels,
        inverse: true,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: this.isMaximized ? 12 : 10,
          width: isMobile ? 100 : 200,
          overflow: 'truncate',
          interval: 0,
          margin: 15,
          formatter: (value: string) => {
            if (this.groupingMode === 'GND') {
              const [gnd, year] = value.split('|#|');
              if (gnd !== this.lastGnd) {
                this.lastGnd = gnd;
                return gnd;
              }
              return '';
            }
            const year = value.split('|#|')[0];
            if (year !== this.lastYear) {
              this.lastYear = year;
              return year;
            }
            return '';
          },
        },
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { color: theme.textPrimaryColor } }
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: [0],
          start: 0,
          end: (9 / processedLabels.length) * 100,
          zoomLock: true,
          orient: 'vertical',
          handleSize: '50%',
          width: 0,
          left: '97%',
          labelFormatter: '',
        },
        {
          type: 'inside',
          yAxisIndex: [0],
          start: 0,
          end: (9 / processedLabels.length) * 100,
          zoomLock: true,
        },
      ],
      series: series
    };
  }

  private getGndColor(label: string, opacity: number): string {
    const gnd = label.includes(' - ') ? label.split(' - ')[1] : label;
    let hash = 0;
    for (let i = 0; i < gnd.length; i++) {
      hash = gnd.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % this.colorPalette.length;
    const color = this.colorPalette[colorIndex];

    if (opacity === 1) return color;
    return this.getOpacityColor(color, opacity);
  }

  private getOpacityColor(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  private formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.echartsInstance) {
        this.echartsInstance.resize();
      }
    }, 150);
  }

  private resizeChart(): void {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance?.resize();
      }, 100);
    }
  }
}
