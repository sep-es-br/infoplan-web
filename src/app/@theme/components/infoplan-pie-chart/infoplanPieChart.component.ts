import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'ngx-infoplan-pie-chart',
  templateUrl: './infoplanPieChart.component.html',
  styleUrls: ['./infoplanPieChart.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule],
})
export class InfoplanPieChartComponent implements OnChanges{

  @Input() data: { value: number, name: string }[] = [];
  @Input() colors: string[] = [];

  chartOptions: any;
  echartsInstance: any = null

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

    this.data = data;
    
    this.chartOptions = { 
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `${params.name}: ${params.value} (${params.percent}%)`;
      }
      },

      title: {
        text: `${data.reduce((sum, item) => sum + item.value, 0)}`,
        left: '70%', //center: ['72%', '50%'],
        top: '45%',
        textAlign: 'center',
        textStyle: {
          fontSize: 13,
          fontWeight: 'bold',
        },
      },

      legend: {
        orient: 'vertical', 
        left: 'left', 
        top: 'top', 
        data: this.data.map(item => item.name),
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
          center: ['72%', '50%'],
          data: this.data,
          avoidLabelOverlap: false, 
          hoverAnimation: false, 
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
