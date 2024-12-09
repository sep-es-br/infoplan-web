import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'ngx-pie-chart-model',
  templateUrl: './pieChartModel.component.html',
  styleUrls: ['./pieChartModel.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class PieChartModelComponent implements OnChanges{

  @Input() data: { value: number, name: string }[] = [];
  @Input() colors: string[] = [];
  @Input() height: number;

  chartOptions: EChartsOption;
  echartsInstance: any = null
  centerX: number = 70;
  centerY: number = 50;

  constructor() {
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
      const newTotal = this.data.reduce((sum, item) => {
        return selected[item.name] ? sum + item.value : sum;
      }, 0);
  
      chartInstance.setOption({
        title: {
          text: `${newTotal}`,
        },
      });
    });
  }

  
  initChartOptions(data: { value: number, name: string }[], colors: string[] ) {
    
    this.chartOptions = { 
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `${params.name}: ${params.value} (${params.percent}%)`;
      }
      },

      title: {
        text: `${data.reduce((sum, item) => sum + item.value, 0)}`,
        left: `${this.centerX - 2}%`,
        top: `${this.centerY}%`,
        textAlign: 'center',
        textVerticalAlign: 'middle',
        textStyle: {
          fontSize: 13,
          fontWeight: 'bold',
        },
      },

      legend: {
        orient: 'vertical', 
        left: 'left', 
        top: 'top',
        tooltip: {
          show: true,
          formatter: function (params) {
            const maxLength = 15; 
            let text = `${params.name}`;
            if (text.length <= maxLength) {
              text = ''
            }
            return text;
          }
        }, 
        data: data.map(item => item.name), 
        formatter: function (name) {
          const maxLength = 15
          if (name.length > maxLength) {
            return name.substring(0, maxLength) + '...';  
          }
          return name;  
        },
        textStyle: {
          fontSize: 10,
          color: '#000',
        },
        itemWidth: 10, 
        itemHeight: 10, 
        itemGap: 15,
        selectedMode: true,
      },

      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['60%', '100%'],
          center: [`${this.centerX}%`, `${this.centerY}%`],
          data: this.data,
          emphasis: {
            scale: false,
          },
          label: {
            show: true, 
            position: 'inside',
            formatter: function (params) {
              return Math.round(params.percent) + '%'; 
            },
            color: '#fff', 
            fontSize: 9, 
          },
          labelLine: {
            show: false,
          }
          }
      ],
      color: colors
    };
  }
}
