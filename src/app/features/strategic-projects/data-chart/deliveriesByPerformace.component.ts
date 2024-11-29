import { Component } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';

@Component({
  selector: 'ngx-deliveries-by-performace',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
})
export class DeliveriesByPerformaceComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { value: 822, name: 'No Prazo' },
      { value: 1248, name: 'Concluídas' },
      { value: 304, name: 'Concluídas c/ Atraso' },
      { value: 669, name: 'Atrasadas' },
    ];

    this.chartColors = ['#00B89C', '#0081C1', '#7C75B9', '#FA4C4F'];

  }
  
}


