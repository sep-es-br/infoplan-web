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
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
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
    `,
  ],
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

  private colorPalette = [
    '#6385EA',
    '#36b286ff',
    '#c0a359ff',
    '#EF8A9E',
    '#B28AFE',
    '#54a6e1ff'
  ];

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange().subscribe((newTheme) => {
      this.currentTheme = newTheme.name as AvailableThemes;
      this.updateChart();
    });
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
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
    if (!this.chart?.data?.datasets || this.chart.data.datasets.length < 2) {
      this.chartOptions = null!;
      return;
    }

    const labelsRaw = this.chart.data.labels || [];
    const datasetsRaw = this.chart.data.datasets;
    const theme = getAvailableThemesStyles(this.currentTheme);
    const getYear = (l: string) => l.split('|#|')[0]?.trim() || '';
    const getGnd = (l: string) => l.split('|#|')[1]?.trim() || l.trim();

    const dataRecords: any[] = [];
    labelsRaw.forEach((label, idx) => {
      dataRecords.push({
        label,
        year: getYear(label),
        gnd: getGnd(label),
        emp: (datasetsRaw[0].data[idx] as number) || 0,
        liq: (datasetsRaw[1].data[idx] as number) || 0
      });
    });

    const uniqueYears = Array.from(new Set(dataRecords.map(r => r.year))).sort((a, b) => b.localeCompare(a));
    const uniqueGnds = Array.from(new Set(dataRecords.map(r => r.gnd))).sort();

    const finalData: any[] = [];
    if (this.groupingMode === 'YEAR_GND') {
      uniqueYears.forEach(year => {
        const yearGroup = dataRecords.filter(r => r.year === year).sort((a, b) => a.gnd.localeCompare(b.gnd));
        finalData.push(...yearGroup);
      });
    } else {
      uniqueGnds.forEach(gnd => {
        const gndGroup = dataRecords.filter(r => r.gnd === gnd).sort((a, b) => b.year.localeCompare(a.year));
        finalData.push(...gndGroup);
      });
    }

    const midpointIndices = new Set<number>();
    const groupingList = this.groupingMode === 'YEAR_GND' ? uniqueYears : uniqueGnds;
    const getKey = (d: any) => this.groupingMode === 'YEAR_GND' ? d.year : d.gnd;

    groupingList.forEach(groupKey => {
      const indices = finalData.map((d, idx) => getKey(d) === groupKey ? idx : -1).filter(i => i !== -1);
      if (indices.length > 0) {
        // Encontra o meio do grupo para colocar o rótulo principal
        midpointIndices.add(indices[Math.floor(indices.length / 2)]);
      }
    });

    const barWidth = this.isMaximized ? 26 : 15;
    const empSeriesData: any[] = [];
    const liqSeriesData: any[] = [];

    finalData.forEach(d => {
      const baseColor = this.groupingMode === 'YEAR_GND'
        ? this.getGndColor(d.gnd, 1)
        : this.colorPalette[uniqueYears.indexOf(d.year) % this.colorPalette.length];

      const faded = baseColor.startsWith('#')
        ? this.getOpacityColor(baseColor, 0.4)
        : baseColor.replace('rgb', 'rgba').replace(')', ', 0.4)');

      empSeriesData.push({ value: d.emp, itemStyle: { color: faded } });
      liqSeriesData.push({ value: d.liq, itemStyle: { color: baseColor } });
    });
    const legendData: string[] = [];
    const legendSeries: any[] = [];

    const isYearGnd = this.groupingMode === 'YEAR_GND';
    const subGroups = isYearGnd ? uniqueGnds : uniqueYears;

    subGroups.forEach(subGroup => {
      const baseColor = isYearGnd
        ? this.getGndColor(subGroup, 1)
        : this.colorPalette[uniqueYears.indexOf(subGroup) % this.colorPalette.length];

      const faded = baseColor.startsWith('#')
        ? this.getOpacityColor(baseColor, 0.4)
        : baseColor.replace('rgb', 'rgba').replace(')', ', 0.4)');

      const empName = `${subGroup} (Empenhado)`;
      const liqName = `${subGroup} (Liquidado)`;

      legendData.push(empName, liqName);

      legendSeries.push({
        name: empName,
        type: 'bar',
        data: [],
        itemStyle: { color: faded, borderRadius: [0, 4, 4, 0] }
      });

      legendSeries.push({
        name: liqName,
        type: 'bar',
        data: [],
        itemStyle: { color: baseColor, borderRadius: [0, 4, 4, 0] }
      });
    });

    const maxItemsVisible = this.isMaximized ? 25 : 15;
    const endZoomValue = Math.min(maxItemsVisible, finalData.length - 1);

    this.chartOptions = {
      legend: {
        type: 'scroll',
        show: true,
        top: 0,
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 15,
        textStyle: { color: theme.textPrimaryColor, fontSize: 11 },
        pageTextStyle: { color: theme.textPrimaryColor },
        pageIconColor: theme.textPrimaryColor,
        pageIconInactiveColor: theme.textSecondaryColor,
        data: legendData
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: theme.themePrimaryColor,
        textStyle: { color: theme.textPrimaryColor },
        confine: true,
        borderWidth: 0,
        padding: 5,
        extraCssText: 'box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); border-radius: 4px;',
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const p = params[0];
          const absoluteIdx = parseInt(p.name.split('__idx__')[1], 10);
          const d = finalData[absoluteIdx];
          if (!d) return '';

          let html = `<div style="padding:4px">
                        <b style="font-size:13px">${d.gnd}</b><br/>
                        <span style="opacity:0.8">Exercício ${d.year}</span><hr style="opacity:0.2;margin:5px 0"/>`;

          params.forEach(param => {
            if (param.seriesName.includes('(Empenhado)') || param.seriesName.includes('(Liquidado)')) return;
            html += `<div style="margin-bottom: 2px;">
                       <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px;"></span>
                       <b>${param.seriesName}:</b> ${param.value.toFixed(1).replace('.', ',')}%
                     </div>`;
          });

          html += `</div>`;
          return html;
        }
      },
      grid: { left: '1%', right: '5%', bottom: '0%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', color: theme.textPrimaryColor, fontSize: 10 },
        splitLine: { show: true, lineStyle: { color: theme.textPrimaryColor, opacity: 0.1 } }
      },
      yAxis: {
        type: 'category',
        data: finalData.map((d, i) => `${d.label}__idx__${i}`),
        inverse: true,
        axisLine: { show: true, lineStyle: { color: theme.textPrimaryColor, opacity: 0.3 } },
        axisLabel: {
          interval: 0,
          margin: 15,
          color: theme.textPrimaryColor,
          rich: {
            mainGroup: { fontSize: this.isMaximized ? 14 : 12, padding: [0, 0, 4, 0] },
            subGroup: { fontSize: this.isMaximized ? 12 : 10, color: theme.textPrimaryColor }
          },
          formatter: (val: string) => {
            const absoluteIdx = parseInt(val.split('__idx__')[1], 10);
            const d = finalData[absoluteIdx];
            if (!d) return '';
            const mainLabel = this.groupingMode === 'YEAR_GND' ? d.year : d.gnd;

            if (midpointIndices.has(absoluteIdx)) {
              return `{mainGroup|${mainLabel}}`;
            }
            return '';
          }
        },
        axisTick: {
          show: true,
          length: 20, // Reduzido para não invadir muito a área do gráfico
          lineStyle: { color: theme.textPrimaryColor, opacity: 0.4 },
          interval: (_index: number, val: string) => {
            if (!val) return true;
            const absoluteIdx = parseInt(val.split('__idx__')[1], 10);
            return absoluteIdx === 0 || getKey(finalData[absoluteIdx]) !== getKey(finalData[absoluteIdx - 1]);
          }
        },
        splitLine: {
          show: true,
          lineStyle: { color: theme.textPrimaryColor, opacity: 0.2 },
          interval: (_index: number, val: string) => {
            if (!val) return true;
            const absoluteIdx = parseInt(val.split('__idx__')[1], 10);
            return absoluteIdx > 0 && getKey(finalData[absoluteIdx]) !== getKey(finalData[absoluteIdx - 1]);
          }
        }
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          right: '1%',
          width: 10,
          showDetail: false,
          brushSelect: false,
          handleSize: 0,
          borderColor: 'transparent',
          fillerColor: 'rgba(120, 120, 120, 0.2)',
          backgroundColor: 'transparent',
          startValue: 0,
          endValue: 15
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true
        }
      ],
      series: [
        {
          name: 'Empenhado',
          type: 'bar',
          barCategoryGap: '25%',
          data: empSeriesData,
          z: 1,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: theme.textPrimaryColor, fontSize: 12, formatter: (p: any) => `${p.value.toFixed(1).replace('.', ',')}%` }
        },
        {
          name: 'Liquidado',
          type: 'bar',
          barGap: '-100%',
          data: liqSeriesData,
          z: 2,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'insideLeft', color: theme.textPrimaryColor, fontSize: 12, formatter: (p: any) => `${p.value.toFixed(1).replace('.', ',')}%` }
        },
        ...legendSeries
      ]
    };
  }

  private addSeriesPair(series: any[], name: string, empData: any[], liqData: any[], color: string, faded: string, width: number, isMobile: boolean, theme: any) {
  }

  private getGndColor(label: string, opacity: number): string {
    const gnd = label.includes(' - ') ? label.split(' - ')[1] : label;
    let hash = 0;
    for (let i = 0; i < gnd.length; i++) hash = gnd.charCodeAt(i) + ((hash << 5) - hash);
    const color = this.colorPalette[Math.abs(hash) % this.colorPalette.length];
    return opacity === 1 ? color : this.getOpacityColor(color, opacity);
  }

  private getOpacityColor(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  @HostListener('window:resize')
  onWindowResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.echartsInstance?.resize(), 150);
  }

  private resizeChart() {
    setTimeout(() => this.echartsInstance?.resize(), 100);
  }
}