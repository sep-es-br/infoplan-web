import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HorizontalBarChartCustomConfig, HorizontalBarChartLabelClick, HorizontalBarChartModelComponent } from '../../bar-chart-model/horizontal-bar-chart-model/horizontal-bar-chart-model.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectDeliveriesBySelected, StrategicProjectProgramDetails, StrategicProjectProjectDetails } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { NbSelectModule } from '@nebular/theme';
import { ExportDataService } from '../../../../core/service/export-data';
import { CustomTableFilteringTrigger, RequestStatus } from '../../strategicProjects.component';
import { BehaviorSubject } from 'rxjs';
import { OffcanvasInfoModelComponent } from '../../offcanvas-info-model/offcanvas-info-model.components';

@Component({
  selector: 'ngx-deliveries-by-selected',
  templateUrl: './deliveriesBySelected.component.html',
  styleUrls: ['./deliveriesBySelected.component.scss'],
  standalone: true,
  imports: [
    HorizontalBarChartModelComponent,
    FlipTableComponent,
    NbSelectModule,
    OffcanvasInfoModelComponent,
  ],
})
export class DeliveriesBySelectedComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  @Input() tableFilteringTrigger: BehaviorSubject<CustomTableFilteringTrigger>;
  // ↳ Este BehaviorSubject é disparado toda vez que o usuário faz uma filtragem ao clicar em um elemento em uma das tabelas
  // ↳ Todos os componentes que implementam essa filtragem pela tabela devem escutar esse Subject, afim de que quando
  //   o usuário filtrar algo em qualquer uma das tabelas, a seleção da entidade seja alterada em todas as outras tabelas

  @Output() newFilter = new EventEmitter<IStrategicProjectFilterValuesDto>();

  @ViewChild('offcanvasTrigger2') offcanvasTrigger: ElementRef;

  chartData: any;

  chartColors: any;

  chartCustomConfig: HorizontalBarChartCustomConfig;

  deliveriesData: IStrategicProjectDeliveriesBySelected[];

  deliveriesSelectedOption: string = 'Área Temática';

  flipTableContent: FlipTableContent;

  isOffcanvasOpen: boolean = false;
  
  selectedItemDetails: StrategicProjectProgramDetails | StrategicProjectProjectDetails;
  
  offcanvasRequestStatus: RequestStatus = RequestStatus.EMPTY;

  requestStatus: RequestStatus = RequestStatus.EMPTY;

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
    private changeDetectorRef: ChangeDetectorRef,
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

    this.chartCustomConfig = {
      yAxisTriggerEvent: ['Programa', 'Programas Transversais', 'Projeto'].includes(this.deliveriesSelectedOption),
    };

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'nome',
        propertyName: 'firstColumn',
        displayName: this.deliveriesSelectedOption,
        enableEventClick: this.chartCustomConfig.yAxisTriggerEvent,
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
    const selectedDelivery = this.deliveriesData.find((el) => el.nome === event.value);
    
    /**
     * É necessário verificar e controlar se o offcanvas está aberto ou não porque por algum motivo
     * o evento de click está sendo disparado 2x ao clicar.
    */
    if (selectedDelivery && !this.isOffcanvasOpen) {
      this.offcanvasRequestStatus = RequestStatus.LOADING;      
      this.offcanvasTrigger.nativeElement.click();
      this.isOffcanvasOpen = true;

      if (['Programa', 'Programas Transversais'].includes(this.deliveriesSelectedOption)) {
        this.strategicProjectsService.getProgramDetails(this.filter, selectedDelivery.id)
          .subscribe({
            next: (res: StrategicProjectProgramDetails) => {
              this.selectedItemDetails = res;
              this.offcanvasRequestStatus = RequestStatus.SUCCESS;
              this.changeDetectorRef.detectChanges();
            },
            error: (err) => {
              console.error('Ocorreu um erro! \n', err);
              this.offcanvasRequestStatus = RequestStatus.ERROR;
            },
          });
      } else if (this.deliveriesSelectedOption === 'Projeto') {
        this.strategicProjectsService.getProjectDetails(this.filter, selectedDelivery.id)
          .subscribe({
            next: (res: StrategicProjectProjectDetails) => {
              this.selectedItemDetails = res;
              this.offcanvasRequestStatus = RequestStatus.SUCCESS;
              this.changeDetectorRef.detectChanges();
            },
            error: (err) => {
              console.error("Ocorreu um erro! \n", err);
              this.offcanvasRequestStatus = RequestStatus.ERROR;
            },
          });
      }
    }
  }

  handleOffcanvasClose() {
    this.isOffcanvasOpen = false;
  }
}
