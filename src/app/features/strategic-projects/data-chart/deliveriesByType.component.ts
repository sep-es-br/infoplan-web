import { Component } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';

@Component({
  selector: 'ngx-deliveries-by-type',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
})
export class DeliveriesByTypeComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData = [
      { value: 792, name: 'Obra' },
      { value: 822, name: 'Serviço' },
      { value: 730, name: 'Equipamento' },
      { value: 334, name: 'Norma' },
      { value: 304, name: 'Plano / Pesquisa' },
    ];

    this.chartColors = ['#005073', '#107DAC', '#189AD3', '#1EBBD7', '#71C7EC' ]

  }
  
}


