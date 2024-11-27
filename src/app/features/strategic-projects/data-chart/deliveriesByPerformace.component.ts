import { Component } from '@angular/core';
import { InfoplanPieChartComponent } from '../../../@theme/components/infoplan-pie-chart/infoplanPieChart.component';

@Component({
  selector: 'ngx-deliveries-by-performace',
  template: '<ngx-infoplan-pie-chart [data]="chartData" [colors]="chartColors"></ngx-infoplan-pie-chart>',
  standalone: true,
  imports: [InfoplanPieChartComponent],
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


