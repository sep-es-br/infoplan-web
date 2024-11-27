import { Component } from '@angular/core';
import { InfoplanPieChartComponent } from '../../../@theme/components/infoplan-pie-chart/infoplanPieChart.component';

@Component({
  selector: 'ngx-critical-milestones-for-performance',
  template: '<ngx-infoplan-pie-chart [data]="chartData" [colors]="chartColors"></ngx-infoplan-pie-chart>',
  standalone: true,
  imports: [InfoplanPieChartComponent],
})
export class CriticalMilestonesForPerformanceComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { value: 2233, name: 'No Prazo' },
      { value: 3608, name: 'Concluídas' },
      { value: 945, name: 'Concluídas c/ Atraso' },
      { value: 1804, name: 'Atrasadas' },
    ];

    this.chartColors = ['#00B89C', '#0081C1', '#7C75B9', '#FA4C4F'];

  }
  
}
