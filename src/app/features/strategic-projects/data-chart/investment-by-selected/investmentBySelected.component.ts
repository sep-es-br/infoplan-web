import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HorizontalBarChartCustomConfig, HorizontalBarChartLabelClick, HorizontalBarChartModelComponent } from '../../bar-chart-model/horizontal-bar-chart-model/horizontal-bar-chart-model.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectInvestmentSelected, StrategicProjectProgramDetails, StrategicProjectProjectDetails } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { NbSelectModule } from '@nebular/theme';
import { ExportDataService } from '../../../../core/service/export-data';
import { UtilitiesService } from '../../../../core/service/utilities.service';
import { CustomTableFilteringTrigger, RequestStatus } from '../../strategicProjects.component';
import { BehaviorSubject } from 'rxjs';
import { OffcanvasInfoModelComponent } from '../../offcanvas-info-model/offcanvas-info-model.components';

@Component({
  selector: 'ngx-investment-by-selected',
  templateUrl: './investmentBySelected.component.html',
  styleUrls: ['./investmentBySelected.component.scss'],
  standalone: true,
  imports: [
    HorizontalBarChartModelComponent,
    OffcanvasInfoModelComponent,
    FlipTableComponent,
    NbSelectModule,
  ],
})
export class InvestmentBySelectedComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  @Input() tableFilteringTrigger: BehaviorSubject<CustomTableFilteringTrigger>;
  // ↳ Este BehaviorSubject é disparado toda vez que o usuário faz uma filtragem ao clicar em um elemento em uma das tabelas
  // ↳ Todos os componentes que implementam essa filtragem pela tabela devem escutar esse Subject, afim de que quando
  //   o usuário filtrar algo em qualquer uma das tabelas, a seleção da entidade seja alterada em todas as outras tabelas

  @Output() newFilter = new EventEmitter<IStrategicProjectFilterValuesDto>();

  @ViewChild('offcanvasTrigger') offcanvasTrigger: ElementRef;

  flipTableContent: FlipTableContent;

  selectedInvestmentOption: string = 'Área Temática';

  chartData: any;

  chartColors: any;

  chartCustomConfig: HorizontalBarChartCustomConfig;

  investmentData: IStrategicProjectInvestmentSelected[];

  requestStatus: RequestStatus = RequestStatus.EMPTY;

  isOffcanvasOpen: boolean = false;

  selectedProgramDetails: StrategicProjectProgramDetails;

  selectedProjectDetails: StrategicProjectProjectDetails;

  offcanvasRequestStatus: RequestStatus = RequestStatus.EMPTY;

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
    private utilitiesService: UtilitiesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['filter'] && this.filter)) {
      if (this.selectedInvestmentOption != undefined) {
        this.loadData();
      }
    }

    if (changes['tableFilteringTrigger'] && this.tableFilteringTrigger) {
      this.tableFilteringTrigger.subscribe((newFilter) => {
        if (newFilter && newFilter.source !== 'InvestmentBy') {
          this.selectedInvestmentOption = newFilter.newSelectedEntity;
        }
      });
    }
  }

  loadData(){
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];

    switch (this.selectedInvestmentOption) {
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
        console.warn('Opção não reconhecida:', this.selectedInvestmentOption);
        break;
    }

    this.chartColors = ['#42726F', '#00A261'];

  }

  loadInvestmentByArea(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getInvestmentByArea(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados das áreas temáticas:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  loadInvestmentByProgram(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getInvestmentByProgram(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  loadInvestmentByCrossProgramAt(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getInvestmentByProgramAt(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos programas transversais:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  loadInvestmentByProject(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getInvestmentByProject(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos projetos:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  loadInvestmentByDelivery(cleanedFilter: IStrategicProjectFilterValuesDto): void {
    this.requestStatus = RequestStatus.LOADING;

    this.strategicProjectsService.getInvestmentByDelivery(cleanedFilter).subscribe(
      (data: IStrategicProjectInvestmentSelected[]) => {
        this.investmentData = data;
        this.formatChartData();
        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  formatChartData(): void {
    this.chartData = this.investmentData.map(item => ({
      category: item.nome,          
      previsto: item.custoPrevisto, 
      realizado: item.custoRealizado 
    }));

    this.assembleFlipTableContent(this.investmentData);
  }

  assembleFlipTableContent(rawData: IStrategicProjectInvestmentSelected[], shouldStartExpanded: boolean = false) {
    const tableColumns = [
      {
        propertyName: 'custoPrevisto',
        displayName: 'Previsto',
        alignment: { header: FlipTableAlignment.CENTER, data: FlipTableAlignment.RIGHT },
      },
      {
        propertyName: 'custoRealizado',
        displayName: 'Realizado',
        alignment: { header: FlipTableAlignment.CENTER, data: FlipTableAlignment.RIGHT },
      },
    ];

    const finalData: Array<TreeNode> = rawData.map((investimento) => ({
      data: [
        { originalPropertyName: 'nome', propertyName: 'firstColumn', value: investimento.nome },
        { propertyName: 'custoPrevisto', value: this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoPrevisto, 'R$') },
        { propertyName: 'custoRealizado', value: this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoRealizado, 'R$') },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }));

    this.chartCustomConfig = {
      yAxisTriggerEvent: ['Programa', 'Projeto'].includes(this.selectedInvestmentOption),
    };

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'nome',
        propertyName: 'firstColumn',
        displayName: this.selectedInvestmentOption,
        enableEventClick: this.chartCustomConfig.yAxisTriggerEvent,
      },
      data: finalData,
    };
  }

  handleUserTableSearch(searchTerm: string) {
    if (searchTerm.length > 0) {
      const preparedSearchTerm = searchTerm.toLowerCase();
      const filteredItems = this.investmentData.filter((investimento) => (
        investimento.nome.toLowerCase().includes(preparedSearchTerm) ||
        this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoPrevisto, 'R$').includes(preparedSearchTerm) ||
        this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoRealizado, 'R$').includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.investmentData);
    }
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string; }> = [
      { key: 'nome', label: this.selectedInvestmentOption },
      { key: 'custoPrevisto', label: 'Custo Previsto' },
      { key: 'custoRealizado', label: 'Custo Realizado' },
    ];

    this.exportDataService.exportXLSXWithCustomHeaders(
      this.investmentData,
      columns,
      `InfoPlan_Investimento_por_${this.selectedInvestmentOption}.xlsx`,
    );
  }

  handleCustomFiltering(value: string) {
    const selectedItem = this.investmentData.find((item) => item.nome === value);
    let newFilter: IStrategicProjectFilterValuesDto;

    switch (this.selectedInvestmentOption) {
      case 'Área Temática':
        newFilter = {
          ...newFilter,
          areaId: selectedItem.id.toString(),
        };
        this.selectedInvestmentOption = 'Programa';
        break;
      case 'Programa':
        newFilter = {
          ...newFilter,
          programaOriginalId: selectedItem.id,
        };
        this.selectedInvestmentOption = 'Projeto';
        break;
      case 'Programas Transversais':
        newFilter = {
          ...newFilter,
          programaTransversalId: selectedItem.id,
        };
        this.selectedInvestmentOption = 'Projeto';
        break;
      case 'Projeto':
        newFilter = {
          ...newFilter,
          projetoId: selectedItem.id,
        };
        this.selectedInvestmentOption = 'Entrega';
        break;
      case 'Entrega':
        newFilter = {
          ...newFilter,
          entregaId: selectedItem.id,
        };
        this.selectedInvestmentOption = 'Entrega';
        break;
      default:
        console.warn('Opção não reconhecida:', this.selectedInvestmentOption);
        break;
    }

    this.newFilter.emit(newFilter);
  }

  handleChartLabelClick(event: HorizontalBarChartLabelClick) {
    const selectedInvestment = this.investmentData.find((el) => el.nome === event.value);

    /**
     * É necessário verificar e controlar se o offcanvas está aberto ou não porque por algum motivo
     * o evento de click está sendo disparado 2x ao clicar.
    */
    if (selectedInvestment && !this.isOffcanvasOpen) {
      this.offcanvasRequestStatus = RequestStatus.LOADING;      
      this.offcanvasTrigger.nativeElement.click();
      this.isOffcanvasOpen = true;

      if (this.selectedInvestmentOption === 'Programa') {
        this.strategicProjectsService.getProgramDetails(this.filter, selectedInvestment.id)
          .subscribe({
            next: (res: StrategicProjectProgramDetails) => {
              this.selectedProgramDetails = res;
              this.offcanvasRequestStatus = RequestStatus.SUCCESS;
              this.changeDetectorRef.detectChanges();
            },
            error: (err) => {
              console.error('Ocorreu um erro! \n', err);
              this.offcanvasRequestStatus = RequestStatus.ERROR;
            },
          });
      } else if (this.selectedInvestmentOption === 'Projeto') {
        this.strategicProjectsService.getProjectDetails(this.filter, selectedInvestment.id)
          .subscribe({
            next: (res: StrategicProjectProjectDetails) => {
              this.selectedProjectDetails = res;
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