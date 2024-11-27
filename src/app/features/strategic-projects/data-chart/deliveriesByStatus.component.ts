import { Component } from '@angular/core';
import { InfoplanPieChartComponent } from '../../../@theme/components/infoplan-pie-chart/infoplanPieChart.component';

@Component({
  selector: 'ngx-deliveries-by-status',
  template: '<ngx-infoplan-pie-chart [data]="chartData" [colors]="chartColors"></ngx-infoplan-pie-chart>',
  standalone: true,
  imports: [InfoplanPieChartComponent],
})
export class DeliveriesByStatusComponent {

  chartData: any;
  chartColors: any;

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
