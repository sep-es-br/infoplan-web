import { Component } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';

@Component({
  selector: 'ngx-risks-by-classification',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
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



