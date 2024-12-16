import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'ngx-pie-chart-model',
  templateUrl: './pieChartModel.component.html',
  styleUrls: ['./pieChartModel.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class PieChartModelComponent implements OnChanges, OnInit{

  @Input() data: { value: number, name: string }[] = [];
  @Input() colors: string[] = [];
  @Input() height: number;

  chartOptions: EChartsOption;
  echartsInstance: any = null
  centerX: number = 70;
  centerY: number = 50;

  constructor() {
    this.updateTitlePosition();
  }

  ngOnInit() {
    this.updateTitlePosition();
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateTitlePosition();
  }

  updateTitlePosition() {
    const screenWidth = window.innerWidth;

    if (screenWidth >= 1600 || screenWidth <= 1000 && screenWidth >= 768) {
      if (this.echartsInstance) {
        this.echartsInstance.setOption({
          title: {
            left: `${this.centerX - 2}%`,
          }
        });
      }
    } else {
      if (this.echartsInstance) {
        this.echartsInstance.setOption({
          title: {
            left: `${this.centerX - 1}%`,
          }
        });
      }
    }
    
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
          fontSize: 16,
          fontWeight: 'bold',
        },
      },

      legend: {
        orient: 'vertical', 
        left: 'left', 
        top: 'top',
        tooltip: {
          show: true
        }, 
        data: data.map(item => item.name),
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
