import { Component } from '@angular/core';
import { HorizontalBarChartModel } from '../bar-chart-model/horizontalBarChartModel.component';

@Component({
  selector: 'ngx-investment-by-selected',
  template: '<ngx-horizontal-bar-chart-model [data]="chartData" [colors]="chartColors" [height]="290"></ngx-horizontal-bar-chart-model>',
  standalone: true,
  imports: [HorizontalBarChartModel],
})
export class InvestmentBySelectedComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { category: "Cais das Artes", previsto: 40, realizado: 35 },
      { category: "Gestão de Riscos e Desastres", previsto: 30, realizado: 28 },
      { category: "Proteção Social, Saúde e Direitos Humanos", previsto: 25, realizado: 20 },
      { category: "Construção de Barragens", previsto: 20, realizado: 18 },
      { category: "Desenv. Sustentável da Cadeia do Leite", previsto: 15, realizado: 12 },
      { category: "HUB Criativo ES+", previsto: 10, realizado: 8 },
      { category: "Energia Mais Produtiva", previsto: 8, realizado: 5 },
      { category: "Caficultura Sustentável do Espírito Santo", previsto: 5, realizado: 3 }
    ];

    this.chartColors = ['#CE4543', '#FB7800', '#FFC300']

  }
  
}