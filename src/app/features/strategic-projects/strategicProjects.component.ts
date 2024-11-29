import { Component } from '@angular/core';

@Component({
  selector: 'ngx-strategic-projects',
  templateUrl: './strategicProjects.component.html',
  styleUrls: ['./strategicProjects.component.scss']
})
export class StrategicProjectsComponent {

  chartOptions: any
  chartOptions2: any
  chartOptions3:any

  constructor() {
    // this.load()
  }

  // load(){
  //   this.chartOptions = {
  //     tooltip: {
  //       trigger: 'axis', // Aqui usamos 'item' para que o tooltip mostre informações de cada item individualmente
  //       axisPointer: {
  //         type: 'shadow', // Tipo de sombra no eixo
  //       },
  //       // formatter: function (params) {
  //       //   let tooltipText = '';
  //       //   params.forEach((item) => {
  //       //     tooltipText += `${item.seriesName}: ${item.value}M<br>`;
  //       //   });
  //       //   return tooltipText;
  //       // },
  //     },
  //     legend: {
  //       orient: 'horizontal',
  //       top: 'top',
  //       right: '3%',
  //       data: ['Previsto', 'Realizado'],
  //       itemWidth: 10, 
  //       itemHeight: 10, 
  //       itemGap: 15,
  //       selectedMode: true,
  //       textStyle: {
  //         fontSize: 12,
  //       },
  //     },
  //     grid: {
  //       top: '10%',
  //       left: '3%',
  //       right: '4%',
  //       bottom: '3%',
  //       containLabel: true, // Garante que o conteúdo esteja dentro do grid
  //     },
  //     xAxis: {
  //       type: 'value',
  //       axisLabel: {
  //         fontSize: 10, // Tamanho das letras no eixo X
  //         formatter: '{value} M', // Formato em milhões
  //       },
  //     },
  //     yAxis: {
  //       type: 'category',
  //       inverse: true, // Inverte a ordem do eixo Y
  //       axisLabel: {
  //         fontSize: 10, // Tamanho das letras no eixo Y
  //       },
  //       data: [
  //         'Cais das Artes',
  //         'Gestão de Riscos e Desastres',
  //         'Proteção Social, Saúde e Direitos Humanos',
  //         'Construção de Barragens',
  //         'Desenv. Sustentável da Cadeia do Leite',
  //         'HUB Criativo ES+',
  //         'Energia Mais Produtiva',
  //         'Caficultura Sustentável do Espírito Santo',
  //       ],
  //     },
  //     series: [
  //       {
  //         name: 'Previsto',
  //         type: 'bar',
  //         data: [40, 30, 25, 20, 15, 10, 8, 5], // Valores correspondentes
  //         itemStyle: {
  //           color: '#42726F',
  //         },
  //       },
  //       {
  //         name: 'Realizado',
  //         type: 'bar',
  //         data: [35, 28, 20, 18, 12, 8, 5, 3], // Valores correspondentes
  //         itemStyle: {
  //           color: '#00A261',
  //         },
  //       },
  //     ],
  //   };


  //   //------------//
  //   this.chartOptions2 = {
  //     tooltip: {
  //       trigger: 'axis', // Aqui usamos 'item' para que o tooltip mostre informações de cada item individualmente
  //       axisPointer: {
  //         type: 'shadow', // Tipo de sombra no eixo
  //       },
  //       // formatter: function (params) {
  //       //   let tooltipText = '';
  //       //   params.forEach((item) => {
  //       //     tooltipText += `${item.seriesName}: ${item.value}<br>`;
  //       //   });
  //       //   return tooltipText;
  //       // },
  //     },
  //     legend: {
  //       orient: 'horizontal',
  //       top: 'top',
  //       right: '3%',
  //       data: ['Em Execução', 'Concluídas'],
  //       itemWidth: 10, 
  //       itemHeight: 10, 
  //       itemGap: 15,
  //       selectedMode: true,
  //       textStyle: {
  //         fontSize: 12,
  //       },
  //     },
  //     grid: {
  //       top: '10%',
  //       left: '3%',
  //       right: '4%',
  //       bottom: '3%',
  //       containLabel: true, // Garante que o conteúdo esteja dentro do grid
  //     },
  //     xAxis: {
  //       type: 'value',
  //       axisLabel: {
  //         fontSize: 10, // Tamanho das letras no eixo X
  //       },
  //     },
  //     yAxis: {
  //       type: 'category',
  //       inverse: true, // Inverte a ordem do eixo Y
  //       axisLabel: {
  //         fontSize: 10, // Tamanho das letras no eixo Y
  //       },
  //       data: [
  //         "Educação, Cultura, Esporte e Lazer",
  //         "Segurança Pública e Justiça",
  //         "Proteção Social, Saúde e Direitos Humanos",
  //         "Agricultura e Meio Ambiente",
  //         "D. Econ, C, T & Inovação, Turismo",
  //         "Gestão Pública Inovadora",
  //         "Emprego, Trabalho e Renda",
  //         "Redução das Desigualdades Sociais"
  //       ],
  //     },
  //     series: [
  //       {
  //         name: 'Em Execução',
  //         type: 'bar',
  //         data: [400, 300, 250, 200, 150, 100, 80, 50], // Valores correspondentes
  //         itemStyle: {
  //           color: '#42726F',
  //         },
  //       },
  //       {
  //         name: 'Concluídas',
  //         type: 'bar',
  //         data: [350, 280, 200, 180, 120, 80, 50, 30], // Valores correspondentes
  //         itemStyle: {
  //           color: '#0081C1',
  //         },
  //       },
  //     ],
  //   };
    

  //   //-------------//
  //   this.chartOptions3 = {
  //     tooltip: {
  //       trigger: 'axis',
  //       axisPointer: {
  //         type: 'shadow',
  //       },
  //     },
  //     legend: {
  //       data: ['Previsto', 'Realizado'],
  //       top: '5%',
  //       itemWidth: 10, 
  //       itemHeight: 10,
  //       itemGap: 15, 
  //     },
  //     grid: {
  //       left: '5%',
  //       right: '5%',
  //       bottom: '10%',
  //       containLabel: true,
  //     },
  //     xAxis: {
  //       type: 'category',
  //       data: [
  //         'Jan/23', 'Fev/23', 'Mar/23', 'Abr/23', 'Mai/23', 'Jun/23',
  //         'Jul/23', 'Ago/23', 'Set/23', 'Out/23', 'Nov/23', 'Dez/23',
  //         'Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24', 'Jun/24',
  //         'Jul/24', 'Ago/24', 'Set/24', 'Out/24', 'Nov/24', 'Dez/24',
  //         'Jan/25',
  //       ],
  //       axisLabel: {
  //         fontSize: 10,
  //       },
  //     },
  //     yAxis: {
  //       type: 'value',
  //       axisLabel: {
  //         fontSize: 10,
  //       },
  //     },
  //     series: [
  //       {
  //         name: 'Previsto',
  //         type: 'bar',
  //         barWidth: '40%',
  //         data: [0, 2, 4, 6, 9, 12, 16, 20, 25, 30, 35, 40, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42],
  //         itemStyle: {
  //           color: '#42726F', // Cor para 'Previsto'
  //         },
  //       },
  //       {
  //         name: 'Realizado',
  //         type: 'bar',
  //         barWidth: '40%',
  //         data: [0, 1, 3, 5, 7, 10, 14, 18, 23, 28, 33, 38, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
  //         itemStyle: {
  //           color: '#00A261', // Cor para 'Realizado'
  //         },
  //       },
  //     ],
  //   };    

  // }

}
