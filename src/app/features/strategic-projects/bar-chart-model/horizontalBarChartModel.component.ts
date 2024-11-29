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
export class HorizontalBarChartModel implements OnChanges{

  @Input() data: { category: string, previsto: number, realizado: number }[] = [];
  @Input() colors: []
  @Input() height: number;

  chartOptions: EChartsOption;
  echartsInstance: any = null

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['colors']) {
      this.initChartOptions(this.data);
    }
  }

  initChartOptions(data: { category: string, previsto: number, realizado: number }[] ) {
    
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
            containLabel: true, // Garante que o conteúdo esteja dentro do grid
          },
          xAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 10, // Tamanho das letras no eixo X
              formatter: '{value} M', // Formato em milhões
            },
          },
          yAxis: {
            type: 'category',
            inverse: true, // Inverte a ordem do eixo Y
            axisLabel: {
              fontSize: 10, // Tamanho das letras no eixo Y
            },
            data: data.map(item => item.category),
          },
          series: [
            {
              name: 'Previsto',
              type: 'bar',
              data: data.map(item => item.previsto), // Valores correspondentes
              itemStyle: {
                color: '#42726F',
              },
            },
            {
              name: 'Realizado',
              type: 'bar',
              data: data.map(item => item.realizado), // Valores correspondentes
              itemStyle: {
                color: '#00A261',
              },
            },
          ],
        };
      }
}
