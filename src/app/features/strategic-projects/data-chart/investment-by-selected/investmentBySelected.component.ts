import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizontalBarChartModelComponent } from '../../bar-chart-model/horizontalBarChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectInvestmentSelected } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { NbSelectModule } from '@nebular/theme';
import { ExportDataService } from '../../../../core/service/export-data';
import { UtilitiesService } from '../../../../core/service/utilities.service';
import { RequestStatus } from '../../strategicProjects.component';

@Component({
  selector: 'ngx-investment-by-selected',
  templateUrl: './investmentBySelected.component.html',
  styleUrls: ['./investmentBySelected.component.scss'],
  standalone: true,
  imports: [
    HorizontalBarChartModelComponent,
    FlipTableComponent,
    NbSelectModule,
  ],
})
export class InvestmentBySelectedComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  flipTableContent: FlipTableContent;

  selectedInvestmentOption: string = 'Área Temática';

  chartData: any;

  chartColors: any;

  investmentData: IStrategicProjectInvestmentSelected[];

  requestStatus: RequestStatus = RequestStatus.EMPTY;

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
    private utilitiesService: UtilitiesService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['filter'] && this.filter)) {
      if (this.selectedInvestmentOption != undefined) {
        this.loadData(); 
      }
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

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'nome',
        propertyName: 'firstColumn',
        displayName: this.selectedInvestmentOption,
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
}