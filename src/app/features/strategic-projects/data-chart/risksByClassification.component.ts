import { Component } from '@angular/core';
import { InfoplanPieChartComponent } from '../../../@theme/components/infoplan-pie-chart/infoplanPieChart.component';

@Component({
  selector: 'ngx-risks-by-classification',
  template: '<ngx-infoplan-pie-chart [data]="chartData" [colors]="chartColors"></ngx-infoplan-pie-chart>',
  standalone: true,
  imports: [InfoplanPieChartComponent],
})
export class RisksByClassificationComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { value: 164, name: 'Alta' },
      { value: 567, name: 'Média' },
      { value: 530, name: 'Baixa' },
    ];

    this.chartColors = ['#CE4543', '#FB7800', '#FFC300']

  }
  
}



