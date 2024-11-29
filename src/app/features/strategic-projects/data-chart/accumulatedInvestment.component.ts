import { Component } from '@angular/core';
import { VerticalBarChartModelComponent } from '../bar-chart-model/VerticalBarChartModel.component';

@Component({
  selector: 'ngx-teste2',
  template: '<ngx-vertical-bar-chart-model [data]="chartData" [colors]="chartColors" [height]="290"></ngx-vertical-bar-chart-model>',
  standalone: true,
  imports: [VerticalBarChartModelComponent],
})
export class AccumulatedInvestmentComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
    { "date": "01-2023", "previsto": 0, "realizado": 0 },
    { "date": "02-2023", "previsto": 2, "realizado": 1 },
    { "date": "03-2023", "previsto": 4, "realizado": 3 },
    { "date": "04-2023", "previsto": 6, "realizado": 5 },
    { "date": "05-2023", "previsto": 9, "realizado": 7 },
    { "date": "06-2023", "previsto": 12, "realizado": 10 },
    { "date": "07-2023", "previsto": 16, "realizado": 14 },
    { "date": "08-2023", "previsto": 20, "realizado": 18 },
    { "date": "09-2023", "previsto": 25, "realizado": 23 },
    { "date": "10-2023", "previsto": 30, "realizado": 28 },
    { "date": "11-2023", "previsto": 35, "realizado": 33 },
    { "date": "12-2023", "previsto": 40, "realizado": 38 },
    { "date": "01-2024", "previsto": 42, "realizado": 40 },
    { "date": "02-2024", "previsto": 42, "realizado": 40 },
    { "date": "03-2024", "previsto": 42, "realizado": 40 },
    { "date": "04-2024", "previsto": 42, "realizado": 40 },
    { "date": "05-2024", "previsto": 42, "realizado": 40 },
    { "date": "06-2024", "previsto": 42, "realizado": 40 },
    { "date": "07-2024", "previsto": 42, "realizado": 40 },
    { "date": "08-2024", "previsto": 42, "realizado": 40 },
    { "date": "09-2024", "previsto": 42, "realizado": 40 },
    { "date": "10-2024", "previsto": 42, "realizado": 40 },
    { "date": "11-2024", "previsto": 42, "realizado": 40 },
    { "date": "12-2024", "previsto": 42, "realizado": 40 },
    { "date": "01-2025", "previsto": 42, "realizado": 40 }
  ]

  this.chartColors = ['#42726F', '#00A261'];

  }
  
}