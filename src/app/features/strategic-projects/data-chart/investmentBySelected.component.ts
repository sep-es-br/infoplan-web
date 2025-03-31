import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizontalBarChartModelComponent } from '../bar-chart-model/horizontalBarChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../core/service/strategic-projects.service';
import { IStrategicProjectInvestmentSelected } from '../../../core/interfaces/strategic-project.interface';

@Component({
  selector: 'ngx-investment-by-selected',
  template: '<ngx-horizontal-bar-chart-model [data]="chartData" [colors]="chartColors" [height]="290"></ngx-horizontal-bar-chart-model>',
  standalone: true,
  imports: [HorizontalBarChartModelComponent],
})
export class InvestmentBySelectedComponent implements OnChanges{

  @Input() filter!: IStrategicProjectFilterValuesDto;
  @Input() selectedOption: string;

  chartData: any;
  chartColors: any;
  investmentData: IStrategicProjectInvestmentSelected[];

  constructor(private strategicProjectsService: StrategicProjectsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['filter'] && this.filter) || changes['selectedOption']) {
      if (this.selectedOption != undefined) {
        this.loadData(); 
      }
    }
  }

  loadData(){
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];

    switch (this.selectedOption) {
      case 'Área Temática':
        this.loadInvestmentByArea(cleanedFilter);
        break;
      case 'Programa':
        this.loadInvestmentByProgram(cleanedFilter);
        break;
      case 'Programas Transversais':
        this.loadInvestmentByCrossProgramAt(cleanedFilter);
        break;
      case 'Projeto':
        this.loadInvestmentByProject(cleanedFilter);
        break;
      case 'Entrega':
        this.loadInvestmentByDelivery(cleanedFilter);
        break;
      default:
        console.warn('Opção não reconhecida:', this.selectedOption);
        break;
    }

    this.chartColors = ['#42726F', '#00A261'];

  }

  loadInvestmentByArea(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getInvestmentByArea(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados das áreas temáticas:', error);
      }
    );
  }

  loadInvestmentByProgram(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getInvestmentByProgram(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas:', error);
      }
    );
  }

  loadInvestmentByCrossProgramAt(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getInvestmentByProgramAt(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas transversais:', error);
      }
    );
  }

  loadInvestmentByProject(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getInvestmentByProject(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados dos projetos:', error);
      }
    );
  }

  loadInvestmentByDelivery(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getInvestmentByDelivery(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas:', error);
      }
    );
  }

  formatChartData(): void {
    this.chartData = this.investmentData.map(item => ({
      category: item.nome,          
      previsto: item.custoPrevisto, 
      realizado: item.custoRealizado 
    }));
  }
  
  
}