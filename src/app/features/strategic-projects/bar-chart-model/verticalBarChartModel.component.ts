import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'ngx-vertical-bar-chart-model',
  templateUrl: './barChartModel.component.html',
  styleUrls: ['./barChartModel.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class VerticalBarChartModelComponent implements OnChanges{

  @Input() data: { date: string, previsto: number, realizado: number }[] = [];
  @Input() colors: string[] = [];
  @Input() height: number;

  chartOptions: EChartsOption;
  echartsInstance: any = null

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['colors']) {
      this.initChartOptions(this.data, this.colors);
    }
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  initChartOptions(data: { date: string, previsto: number, realizado: number }[], colors: string[] ) {

    if (!Array.isArray(data) || data.length === 0) {
      data = [];
    }
    
    this.chartOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
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
              fontSize: 10,
            },
          },
          yAxis: {
            type: 'value',
            axisLabel: {
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
