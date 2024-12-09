import { Component } from '@angular/core';
import { HorizontalBarChartModelComponent } from '../bar-chart-model/horizontalBarChartModel.component';

@Component({
  selector: 'ngx-deliveries-by-selected',
  template: '<ngx-horizontal-bar-chart-model [data]="chartData" [colors]="chartColors" [height]="290"></ngx-horizontal-bar-chart-model>',
  standalone: true,
  imports: [HorizontalBarChartModelComponent],
})
export class DeliveriesBySelectedComponent {

  chartData: any;
  chartColors: any;

  constructor() {
    this.loadData()
  }

  loadData(){
    
    this.chartData  = [
      { category: "Educação, Cultura, Esporte e Lazer", emExecucao: 400, concluida: 350 },
      { category: "Segurança Pública e Justiça", emExecucao: 300, concluida: 280 },
      { category: "Proteção Social, Saúde e Direitos Humanos", emExecucao: 250, concluida: 200 },
      { category: "Agricultura e Meio Ambiente", emExecucao: 200, concluida: 180 },
      { category: "D. Econ, C, T & Inovação, Turismo", emExecucao: 150, concluida: 120 },
      { category: "Gestão Pública Inovadora", emExecucao: 100, concluida: 80 },
      { category: "Emprego, Trabalho e Renda", emExecucao: 80, concluida: 50 },
      { category: "Redução das Desigualdades Sociais", emExecucao: 50, concluida: 30 },
    ]

    this.chartColors = ['#42726F', '#0081C1'];
  };
  
  
}