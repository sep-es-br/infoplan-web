import { Component } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';

@Component({
  selector: 'ngx-critical-milestones-for-performance',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
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
