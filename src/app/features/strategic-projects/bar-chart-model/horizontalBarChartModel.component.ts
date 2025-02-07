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

  formatNumber(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  

  initChartOptions(data: { category: string, previsto?: number, realizado?: number, emExecucao?: number, concluida?: number }[], colors: string[] ) {

    if (!Array.isArray(data) || data.length === 0) {
      data = [];
    }

    const hasPrevistoRealizado = data.some(item => item.previsto !== undefined && item.realizado !== undefined);
    const hasEmExecucaoConcluida = data.some(item => item.emExecucao !== undefined && item.concluida !== undefined);
    

    if (hasPrevistoRealizado) {
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
            formatter: function (value: number) {
              return formatValue(value); 
            },
          },
        },
        yAxis: {
          type: 'category',
          inverse: true,
          axisLabel: {
            fontSize: 9,
            formatter: function (value: string) {
              const maxLength = 50;
              if (value.length > maxLength) {
                return value.substring(0, maxLength) + '...'; 
              }
              return value;
            },
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
        dataZoom: [
          {
            type: 'slider',
            yAxisIndex: [0],
            start: 0, 
            end: (9 / data.length) * 100, 
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
            end: (9 / data.length) * 100,
            zoomLock: true, 
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
            formatter: (params: any) => {
              let tooltipContent = `${params[0].name}<br>`;
              params.forEach((param: any) => {
                tooltipContent += `${param.seriesName}: ${this.formatNumber(param.value)}<br>`;
              });
              return tooltipContent;
            },
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
              formatter: function (value: number) {
                return formatValue(value); 
              },
            },
          },
          yAxis: {
            type: 'category',
            inverse: true, 
            axisLabel: {
              fontSize: 9,
              formatter: function (value: string) {
                const maxLength = 50;
                if (value.length > maxLength) {
                  return value.substring(0, maxLength) + '...';
                }
                return value;
              }, 
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
          dataZoom: [
            {
              type: 'slider',
              yAxisIndex: [0],
              start: 0, 
              end: (9 / data.length) * 100, 
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
              end: (9 / data.length) * 100,
              zoomLock: true, 
            },
          ],
        };
      }else{
        this.chartOptions = {}
      }

      function formatValue(value: number): string {
        if (value >= 1_000_000_000) {
          return (value / 1_000_000_000).toFixed(2) + ' B'; 
        } else if (value >= 1_000_000) {
          return (value / 1_000_000).toFixed(2) + ' M'; 
        } else {
          return value.toString();
        }
      }
    }
}
