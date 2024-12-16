import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'ngx-horizontal-bar-chart-model',
  templateUrl: './barChartModel.component.html',
  styleUrls: ['./barChartModel.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class HorizontalBarChartModelComponent implements OnChanges{

  @Input() data: { category: string, previsto?: number, realizado?: number, emExecucao?: number, concluida?: number }[] = [];
  @Input() colors:  string[] = [];
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

  initChartOptions(data: { category: string, previsto?: number, realizado?: number, emExecucao?: number, concluida?: number }[], colors: string[] ) {

    const hasPrevistoRealizado = data.some(item => item.previsto !== undefined && item.realizado !== undefined);
    const hasEmExecucaoConcluida = data.some(item => item.emExecucao !== undefined && item.concluida !== undefined);
    

    if (hasPrevistoRealizado) {
    this.chartOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
            // formatter: function (params) {
            //   let tooltipText = '';
            //   params.forEach((item) => {
            //     tooltipText += `${item.seriesName}: ${item.value}M<br>`;
            //   });
            //   return tooltipText;
            // },
          },
          legend: {
            orient: 'horizontal',
            top: 'top',
            right: '3%',
            data: ['Previsto', 'Realizado'],
            itemWidth: 10, 
            itemHeight: 10, 
            itemGap: 15,
            selectedMode: true,
            textStyle: {
              fontSize: 12,
            },
          },
          grid: {
            top: '10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true, 
          },
          xAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 9, 
              formatter: '{value} M', 
            },
          },
          yAxis: {
            type: 'category',
            inverse: true, 
            axisLabel: {
              fontSize: 9, 
            },
            data: data.map(item => item.category),
          },
          series: [
            {
              name: 'Previsto',
              type: 'bar',
              data: data.map(item => item.previsto), 
              itemStyle: {
                color: colors[0],
              },
            },
            {
              name: 'Realizado',
              type: 'bar',
              data: data.map(item => item.realizado), 
              itemStyle: {
                color: colors[1],
              },
            },
          ],
        };
      } else if (hasEmExecucaoConcluida) { 
        this.chartOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
            // formatter: function (params) {
            //   let tooltipText = '';
            //   params.forEach((item) => {
            //     tooltipText += `${item.seriesName}: ${item.value}M<br>`;
            //   });
            //   return tooltipText;
            // },
          },
          legend: {
            orient: 'horizontal',
            top: 'top',
            right: '3%',
            data: ['Em Execução', 'Concluída'],
            itemWidth: 10, 
            itemHeight: 10, 
            itemGap: 15,
            selectedMode: true,
            textStyle: {
              fontSize: 12,
            },
          },
          grid: {
            top: '10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true, 
          },
          xAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 9, 
              formatter: '{value} M', 
            },
          },
          yAxis: {
            type: 'category',
            inverse: true, 
            axisLabel: {
              fontSize: 9, 
            },
            data: data.map(item => item.category),
          },
          series: [
            {
              name: 'Em Execução',
              type: 'bar',
              data: data.map(item => item.emExecucao), 
              itemStyle: {
                color: colors[0],
              },
            },
            {
              name: 'Concluída',
              type: 'bar',
              data: data.map(item => item.concluida ), 
              itemStyle: {
                color: colors[1],
              },
            },
          ],
        };
      }
    }
}
