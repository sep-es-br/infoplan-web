import { Component } from '@angular/core';
import { InfoplanPieChartComponent } from '../../../@theme/components/infoplan-pie-chart/infoplanPieChart.component';

@Component({
  selector: 'ngx-deliveries-by-type',
  template: '<ngx-infoplan-pie-chart [data]="chartData" [colors]="chartColors"></ngx-infoplan-pie-chart>',
  standalone: true,
  imports: [InfoplanPieChartComponent],
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


