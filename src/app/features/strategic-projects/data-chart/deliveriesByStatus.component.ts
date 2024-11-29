import { Component } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';

@Component({
  selector: 'ngx-deliveries-by-status',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
})
export class DeliveriesByStatusComponent {

  chartData: any;
  chartColors: any;
  height: 150;


  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { value: 335, name: 'Em Planejamento' },
      { value: 517, name: 'Concluídas' },
      { value: 913, name: 'Em Execução' },
      { value: 578, name: 'Canceladas' },
      { value: 700, name: 'Paralisadas' },
    ];

    this.chartColors = ['#EC78EA', '#118DFF', '#55B95E', '#CC2C52', '#EA9D42' ]

  }
  
}
