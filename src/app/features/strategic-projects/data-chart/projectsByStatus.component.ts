import { Component } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';

@Component({
  selector: 'ngx-projects-by-status',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
})
export class ProjectsByStatusComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { value: 34, name: 'Em Planejamento' },
      { value: 52, name: 'Concluídas' },
      { value: 92, name: 'Em Execução' },
      { value: 58, name: 'Canceladas' },
      { value: 70, name: 'Paralisadas' },
    ];

    this.chartColors = ['#EC78EA', '#118DFF', '#55B95E', '#CC2C52', '#EA9D42' ]

  }
  
}


