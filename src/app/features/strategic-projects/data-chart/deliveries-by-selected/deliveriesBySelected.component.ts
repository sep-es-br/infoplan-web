import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HorizontalBarChartLabelClick, HorizontalBarChartModelComponent } from '../../bar-chart-model/horizontal-bar-chart-model/horizontal-bar-chart-model.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectDeliveriesBySelected } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { NbSelectModule } from '@nebular/theme';
import { ExportDataService } from '../../../../core/service/export-data';
import { CustomTableFilteringTrigger, RequestStatus } from '../../strategicProjects.component';
import { BehaviorSubject } from 'rxjs';

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

  @Input() tableFilteringTrigger: BehaviorSubject<CustomTableFilteringTrigger>;
  // ↳ Este BehaviorSubject é disparado toda vez que o usuário faz uma filtragem ao clicar em um elemento em uma das tabelas
  // ↳ Todos os componentes que implementam essa filtragem pela tabela devem escutar esse Subject, afim de que quando
  //   o usuário filtrar algo em qualquer uma das tabelas, a seleção da entidade seja alterada em todas as outras tabelas

  @Output() newFilter = new EventEmitter<IStrategicProjectFilterValuesDto>();

  chartData: any;

  chartColors: any;

  deliveriesData: IStrategicProjectDeliveriesBySelected[];

  deliveriesSelectedOption: string = 'Área Temática';

  flipTableContent: FlipTableContent;

  requestStatus: RequestStatus = RequestStatus.EMPTY;

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

    if (changes['tableFilteringTrigger'] && this.tableFilteringTrigger) {
      this.tableFilteringTrigger.subscribe((newFilter) => {
        if (newFilter && newFilter.source !== 'DeliveriesBy') {
          if (newFilter.newSelectedEntity === 'Entrega') {
            this.deliveriesSelectedOption = 'Projeto';
          } else {
            this.deliveriesSelectedOption = newFilter.newSelectedEntity;
          }
        }
      });
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
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getDeliveriesByArea(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados das áreas de entrega:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }
  
  loadDeliveriesByProgram(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getDeliveriesByProgram(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas de entrega:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }
  
  loadDeliveriesByCrossProgramAt(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getDeliveriesByProgramAt(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas transversais de entrega:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }
  
  loadDeliveriesByProject(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getDeliveriesByProject(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveriesBySelected[]) => {
        this.deliveriesData = data;
        this.formatDeliveriesChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos projetos de entrega:', error);
        this.requestStatus = RequestStatus.ERROR;
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
      {
        propertyName: 'concluida',
        displayName: 'Concluída',
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      },
      {
        propertyName: 'execucao',
        displayName: 'Em execução',
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      },
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
        enableEventClick: true,
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

  handleCustomFiltering(value: string) {
    const selectedItem = this.deliveriesData.find((item) => item.nome === value);
    let newFilter: IStrategicProjectFilterValuesDto;

    switch (this.deliveriesSelectedOption) {
      case 'Área Temática':
        newFilter = {
          ...newFilter,
          areaId: selectedItem.id.toString(),
        };
        this.deliveriesSelectedOption = 'Programa';
        break;
      case 'Programa':
        newFilter = {
          ...newFilter,
          programaOriginalId: selectedItem.id,
        };
        this.deliveriesSelectedOption = 'Projeto';
        break;
      case 'Programas Transversais':
        newFilter = {
          ...newFilter,
          programaTransversalId: selectedItem.id,
        };
        this.deliveriesSelectedOption = 'Projeto';
        break;
      case 'Projeto':
        newFilter = {
          ...newFilter,
          projetoId: selectedItem.id,
        };
        this.deliveriesSelectedOption = 'Projeto';
        break;      
      default:
        console.warn('Opção não reconhecida:', this.deliveriesSelectedOption);
        break;
    }

    this.newFilter.emit(newFilter);
  }

  handleChartLabelClick(event: HorizontalBarChartLabelClick) {
    console.log('event: ', event);
  }
}
