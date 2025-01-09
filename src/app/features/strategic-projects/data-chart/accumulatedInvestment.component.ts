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
              previsto: item.custoPrevistoAcumulado, 
              realizado: item.custoRealizadoAcumulado, 
            }));
    
          },
          (error) => {
            console.error('Erro ao carregar os dados do investimento acumulado:', error);
          }
        );
    

  this.chartColors = ['#42726F', '#00A261'];

  }

  private formatDate(anoMes: number): string {
    const anoMesStr = anoMes.toString(); 
    const year = anoMesStr.substring(0, 4); 
    const month = anoMesStr.substring(4, 6); 
    return `${month}-${year}`; 
  }
}