import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizontalBarChartModelComponent } from '../../bar-chart-model/horizontalBarChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectDeliveriesBySelected } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { NbSelectModule } from '@nebular/theme';
import { ExportDataService } from '../../../../core/service/export-data';

@Component({
  selector: 'ngx-deliveries-by-selected',
  templateUrl: './deliveriesBySelected.component.html',
  styleUrls: ['./deliveriesBySelected.component.scss'],
  standalone: true,
  imports: [
    HorizontalBarChartModelComponent,
    FlipTableComponent,
    NbSelectModule,
  ],
})
export class DeliveriesBySelectedComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors: any;

  deliveriesData: IStrategicProjectDeliveriesBySelected[];

  deliveriesSelectedOption: string = 'Área Temática';

  flipTableContent: FlipTableContent;

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['filter'] && this.filter)) {
      if (this.deliveriesSelectedOption != undefined) {
        this.loadData(); 
      }
    }
  }

  loadData() {
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];

    switch (this.deliveriesSelectedOption) {
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
        console.warn('Opção não reconhecida:', this.deliveriesSelectedOption);
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

    this.assembleFlipTableContent(this.deliveriesData);
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveriesBySelected[], shouldStartExpanded: boolean = false) {
    const tableColumns = [
      { propertyName: 'concluida', displayName: 'Concluída' },
      { propertyName: 'execucao', displayName: 'Em execução' },
    ];

    const finalData: Array<TreeNode> = rawData.map((entrega) => ({
      data: [
        { originalPropertyName: 'nome', propertyName: 'firstColumn', value: entrega.nome },
        { propertyName: 'concluida', value: entrega.concluida },
        { propertyName: 'execucao', value: entrega.execucao },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }));

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'nome',
        propertyName: 'firstColumn',
        displayName: this.deliveriesSelectedOption,
      },
      data: finalData,
    };
  }

  handleUserTableSearch(searchTerm: string) {
    if (searchTerm.length > 0) {
      const preparedSearchTerm = searchTerm.toLowerCase();
      const filteredItems = this.deliveriesData.filter((entrega) => (
        entrega.nome.toLowerCase().includes(preparedSearchTerm) ||
        entrega.concluida.toString().includes(preparedSearchTerm) ||
        entrega.execucao.toString().includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.deliveriesData);
    }
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string; }> = [
      { key: 'nome', label: this.deliveriesSelectedOption },
      { key: 'concluida', label: 'Concluídas' },
      { key: 'execucao', label: 'Em execução' },
    ];

    this.exportDataService.exportXLSXWithCustomHeaders(
      this.deliveriesData,
      columns,
      `InfoPlan_Entregas_por_${this.deliveriesSelectedOption}.xlsx`,
    );
  }
}
