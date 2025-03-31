import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizontalBarChartModelComponent } from '../bar-chart-model/horizontalBarChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../core/service/strategic-projects.service';
import { IStrategicProjectDeliveriesBySelected } from '../../../core/interfaces/strategic-project.interface';

@Component({
  selector: 'ngx-deliveries-by-selected',
  template: '<ngx-horizontal-bar-chart-model [data]="chartData" [colors]="chartColors" [height]="290"></ngx-horizontal-bar-chart-model>',
  standalone: true,
  imports: [HorizontalBarChartModelComponent],
})
export class DeliveriesBySelectedComponent implements OnChanges{

  @Input() filter!: IStrategicProjectFilterValuesDto;
  @Input() selectedOption: string;

  chartData: any;
  chartColors: any;
  deliveriesData: IStrategicProjectDeliveriesBySelected[];

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
        this.loadDeliveriesByArea(cleanedFilter);
        break;
      case 'Programa':
        this.loadDeliveriesByProgram(cleanedFilter);
        break;
      case 'Programas Transversais':
        this.loadDeliveriesByCrossProgramAt(cleanedFilter);
        break;
      case 'Projeto':
        this.loadDeliveriesByProject(cleanedFilter);
        break;
      default:
        console.warn('Opção não reconhecida:', this.selectedOption);
        break;
    }

    this.chartColors = ['#42726F', '#0081C1'];
  };

  loadDeliveriesByArea(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getDeliveriesByArea(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados das áreas de entrega:', error);
      }
    );
  }
  
  loadDeliveriesByProgram(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getDeliveriesByProgram(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas de entrega:', error);
      }
    );
  }
  
  loadDeliveriesByCrossProgramAt(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getDeliveriesByProgramAt(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas transversais de entrega:', error);
      }
    );
  }
  
  loadDeliveriesByProject(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.strategicProjectsService.getDeliveriesByProject(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
      },
      (error) => {
        console.error('Erro ao carregar os dados dos projetos de entrega:', error);
      }
    );
  }
  
  formatDeliveriesChartData(): void {
    this.chartData = this.deliveriesData.map(item => ({
      category: item.nome,         
      emExecucao: item.execucao,     
      concluida: item.concluida     
    }));
  }
  
  
  
}