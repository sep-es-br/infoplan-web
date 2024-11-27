import { Component } from '@angular/core';
import { InfoplanPieChartComponent } from '../../../@theme/components/infoplan-pie-chart/infoplanPieChart.component';

@Component({
  selector: 'ngx-projects-by-status',
  template: '<ngx-infoplan-pie-chart [data]="chartData" [colors]="chartColors"></ngx-infoplan-pie-chart>',
  standalone: true,
  imports: [InfoplanPieChartComponent],
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


