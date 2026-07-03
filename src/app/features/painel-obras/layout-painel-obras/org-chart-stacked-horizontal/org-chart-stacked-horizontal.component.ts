import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, inject, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { ChartDataConfig } from '../../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getAvailableThemesStyles, AvailableThemes } from '../../../../@theme/theme.module';
import { UtilitiesService } from '../../../../core/service/utilities.service';
import { IChartOptions } from '../../../../shared/models/budget-panel/IChartOptions';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'ngx-org-chart-stacked-horizontal',
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
  template: `<div
  echarts
  class="echart"
  [options]="chartOptions"
  [style.height.px]="height"
  (chartInit)="onChartInit($event)"
></div>
`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .chart-container {
      width: 100%;
      height: 100%;
      min-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgChartStackedHorizontalComponent implements OnChanges, OnDestroy {
  @Input() chart!: IChartOptions;
  @Input() chartDataConfig?: ChartDataConfig;
  @Input() height: number = 400;
  @Input() valueType: 'currency' | 'percent' | 'number' = 'number';
  @Input() isMaximized: boolean = false;

  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _themeService = inject(NbThemeService);
  private readonly destroy$ = new Subject<void>();
  private currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  echartsInstance: echarts.ECharts | null = null;
  chartOptions!: EChartsOption;
  private readonly colorPalette: string[] = [
    '#4A7BB0', // totalizador-programas
    '#CD687B', // totalizador-projetos
    '#C68B45', // contagem-entregas
    '#5F9E7D', // monitoramento-planejado
    '#827397', // monitoramento-realizado
    '#439A9A', // filtro-temporal-critico
    '#D07A60', // Muted Coral
    '#A3B899', // Muted Sage Green
    '#D9C5B2', // Muted Sand/Beige
    '#8CA1A5'  // Muted Slate Blue
  ];

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.updateChart();
  }

  constructor() {
    this._themeService.getJsTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme.name as AvailableThemes;
        this.updateChart();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chart'] || changes['isMaximized'] || changes['height']) {
      this.updateChart();
    }

    if (changes["height"] && this.echartsInstance) {
      this.resizeChart();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  onChartInit(chartInstance: echarts.ECharts) {
    this.echartsInstance = chartInstance;
    this.resizeChart();
  }

  private updateChart(): void {
    if (!this.chart?.data?.labels || !this.chart?.data?.datasets) return;

    const theme = getAvailableThemesStyles(this.currentTheme);
    const datasetsRaw = this.chart.data.datasets;
    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;
    const labels = this.chart.data.labels;

    const lastNonZeroDsIndex = Array.from({ length: labels.length }, (_, catIdx) => {
      for (let dsIdx = datasetsRaw.length - 1; dsIdx >= 0; dsIdx--) {
        const val = Number(datasetsRaw[dsIdx].data[catIdx] || 0);
        if (val > 0) {
          return dsIdx;
        }
      }
      return -1;
    });

    const series = datasetsRaw.map((ds, dsIdx) => {
      const data = ds.data.map((val, catIdx) => {
        const numVal = Number(val || 0);
        if (dsIdx === lastNonZeroDsIndex[catIdx] && numVal > 0) {
          return {
            value: numVal,
            itemStyle: {
              borderRadius: [0, 4, 4, 0]
            }
          };
        }
        return numVal;
      });

      return {
        name: ds.label,
        type: 'bar',
        stack: 'total',
        barMaxWidth: 25,
        emphasis: { focus: 'series' },
        data: data,
        itemStyle: {
          color: this.colorPalette[dsIdx % this.colorPalette.length]
        },
        label: {
          show: this.isMaximized && window.innerWidth > 768,
          position: 'inside',
          formatter: (p: any) => p.value > 0 ? p.value : '',
          color: '#fff',
          fontSize: 10
        }
      };
    });

    this.chartOptions = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: theme.themePrimaryColor,
        borderColor: theme.themePrimaryColor,
        textStyle: { color: theme.textPrimaryColor, fontSize: 12 },
        confine: true,
        extraCssText: 'white-space: normal; word-break: break-all; max-width: 610px;',
        formatter: (params: any[]) => {
          let html = `<div style="padding:4px"><b style="font-size:13px">${params[0].name}</b><hr style="opacity:0.2;margin:5px 0"/>`;
          let total = 0;
          params.forEach(p => {
            if (p.value > 0) {
              const val = this.formatValue(p.value);
              html += `<div style="margin-bottom:2px">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color};margin-right:5px"></span>
                <b>${p.seriesName}:</b> ${val}
              </div>`;
              total += p.value;
            }
          });
          html += `<hr style="opacity:0.2;margin:5px 0"/><b>Total: ${this.formatValue(total)}</b></div>`;
          return html;
        }
      },
      legend: {
        type: 'scroll',
        top: 0,
        show: true,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
        textStyle: { color: theme.textPrimaryColor, fontSize: 11 },
        pageTextStyle: { color: theme.textPrimaryColor },
        pageIconColor: theme.textPrimaryColor,
        pageIconInactiveColor: theme.textSecondaryColor,
      },
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        splitNumber: isPhone ? 3 : isTablet ? 4 : 5,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isPhone ? (this.isMaximized ? 11 : 8.5) : (this.isMaximized ? 13 : 10)
        },
        splitLine: { lineStyle: { color: theme.textPrimaryColor, opacity: 0.1 } }
      },
      yAxis: {
        type: 'category',
        data: labels,
        inverse: true,
        axisLabel: {
          color: theme.textPrimaryColor,
          fontSize: isPhone ? (this.isMaximized ? 11 : 9) : (this.isMaximized ? 13 : 10),
          margin: 10,
          width: isPhone ? 100 : isTablet ? 120 : isMobile ? 130 : 150,
          lineHeight: isPhone ? 13 : 15,
          overflow: "break",
          formatter: (value: string) => this.formatAxisLabel(value)
        },
        axisLine: { lineStyle: { color: theme.textPrimaryColor, opacity: 0.2 } }
      },
      dataZoom: [
        {
          type: "slider",
          yAxisIndex: [0],
          start: 0,
          zoomLock: true,
          orient: "vertical",
          handleSize: "50%",
          width: 0,
          left: "97%",
          labelFormatter: "",
          startValue: 0,
          endValue: 15,
        },
        {
          type: "inside",
          yAxisIndex: [0],
          start: 0,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true,
        },
      ],
      series: series as any
    };

    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOptions, true);
    }
  }

  private formatAxisLabel(value: string): string {
    if (!value) return "";
    const isMobile = window.innerWidth <= 1000;
    const isPhone = window.innerWidth <= 575;
    const isTablet = window.innerWidth <= 768;

    const limit = isPhone ? 18 : isTablet ? 22 : isMobile ? 24 : 26;
    const maxLines = 3;

    const words = value.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!currentLine) {
        currentLine = word;
      } else {
        if ((currentLine + " " + word).length <= limit) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          if (lines.length === maxLines - 1) {
            let lastLine = word;
            let hasMore = false;
            for (let j = i + 1; j < words.length; j++) {
              if ((lastLine + " " + words[j]).length <= limit - 3) {
                lastLine += " " + words[j];
                i = j;
              } else {
                hasMore = true;
                break;
              }
            }
            if (hasMore || i < words.length - 1) {
              lastLine = lastLine.substring(0, limit - 3).trim() + "...";
            }
            lines.push(lastLine);
            currentLine = "";
            break;
          } else {
            currentLine = word;
          }
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  }

  private formatValue(val: number): string {
    if (this.valueType === 'currency') {
      return this._utilitiesService.formatCurrencyUsingBrazilianStandards(val, 'R$');
    }
    return val.toLocaleString('pt-BR');
  }

  private resizeChart() {
    setTimeout(() => this.echartsInstance?.resize(), 100);
  }
}
