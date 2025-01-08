import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VerticalBarChartModelComponent } from '../bar-chart-model/verticalBarChartModel.component';
import { IStrategicProjectAccumulatedInvestment } from '../../../core/interfaces/strategic-project.interface';
import { IStrategicProjectFilterValuesDto } from '../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../core/service/strategic-projects.service';


@Component({
  selector: 'ngx-accumulated-investment',
  template: '<ngx-vertical-bar-chart-model [data]="chartData" [colors]="chartColors" [height]="290"></ngx-vertical-bar-chart-model>',
  standalone: true,
  imports: [VerticalBarChartModelComponent],
})
export class AccumulatedInvestmentComponent implements OnChanges {

  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;
  chartColors = [];
  accumulatedInvestmentData: IStrategicProjectAccumulatedInvestment[] = []
  hasData: boolean = false;

  constructor(private strategicProjectsService: StrategicProjectsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  loadData(){
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];

        this.strategicProjectsService.getAccumulatedInvestment(cleanedFilter).subscribe(
          (data: IStrategicProjectAccumulatedInvestment[]) => {
            this.accumulatedInvestmentData = data;

            this.chartData = this.accumulatedInvestmentData.map(item => ({
              date: this.formatDate(item.anoMes),
              previsto: item.custoPrevisto, 
              realizado: item.custoRealizado, 
            }));
    
          },
          (error) => {
            console.error('Erro ao carregar os dados das entregas por status:', error);
          }
        );
    
  //   this.chartData  = [
  //   { "date": "01-2023", "previsto": 0, "realizado": 0 },
  //   { "date": "02-2023", "previsto": 2, "realizado": 1 },
  //   { "date": "03-2023", "previsto": 4, "realizado": 3 },
  //   { "date": "04-2023", "previsto": 6, "realizado": 5 },
  //   { "date": "05-2023", "previsto": 9, "realizado": 7 },
  //   { "date": "06-2023", "previsto": 12, "realizado": 10 },
  //   { "date": "07-2023", "previsto": 16, "realizado": 14 },
  //   { "date": "08-2023", "previsto": 20, "realizado": 18 },
  //   { "date": "09-2023", "previsto": 25, "realizado": 23 },
  //   { "date": "10-2023", "previsto": 30, "realizado": 28 },
  //   { "date": "11-2023", "previsto": 35, "realizado": 33 },
  //   { "date": "12-2023", "previsto": 40, "realizado": 38 },
  //   { "date": "01-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "02-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "03-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "04-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "05-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "06-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "07-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "08-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "09-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "10-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "11-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "12-2024", "previsto": 42, "realizado": 40 },
  //   { "date": "01-2025", "previsto": 42, "realizado": 40 }
  // ]

  this.chartColors = ['#42726F', '#00A261'];

  }

  private formatDate(anoMes: number): string {
    const anoMesStr = anoMes.toString(); // Converte o número para string
    const year = anoMesStr.substring(0, 4); // Extrai os 4 primeiros dígitos (ano)
    const month = anoMesStr.substring(4, 6); // Extrai os últimos 2 dígitos (mês)
    return `${month}-${year}`; // Retorna no formato MM-YYYY
  }
}