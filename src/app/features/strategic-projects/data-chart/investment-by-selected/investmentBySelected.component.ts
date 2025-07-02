import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizontalBarChartModelComponent } from '../../bar-chart-model/horizontalBarChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectInvestmentSelected } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { NbSelectModule } from '@nebular/theme';
import { ExportDataService } from '../../../../core/service/export-data';

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

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
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

    this.assembleFlipTableContent(this.investmentData);
  }

  assembleFlipTableContent(rawData: IStrategicProjectInvestmentSelected[], shouldStartExpanded: boolean = false) {
      const tableColumns = [
        { propertyName: 'custoPrevisto', displayName: 'Previsto' },
        { propertyName: 'custoRealizado', displayName: 'Realizado' },
      ];
  
      const finalData: Array<TreeNode> = rawData.map((investimento) => ({
        data: [
          { originalPropertyName: 'nome', propertyName: 'firstColumn', value: investimento.nome },
          { propertyName: 'custoPrevisto', value: this.formatCurrencyString(investimento.custoPrevisto) },
          { propertyName: 'custoRealizado', value: this.formatCurrencyString(investimento.custoRealizado) },
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
      // if (searchTerm.length > 0) {
      //   const preparedSearchTerm = searchTerm.toLowerCase();
      //   const filteredItems = this.statusData.filter((entrega) => (
      //     entrega.nomeArea.toLowerCase().includes(preparedSearchTerm) ||
      //     entrega.nomeProjeto.toLowerCase().includes(preparedSearchTerm) ||
      //     entrega.nomeEntrega.toLowerCase().includes(preparedSearchTerm) ||
      //     entrega.nomeStatus.toLowerCase().includes(preparedSearchTerm)
      //   ));
    
      //   this.assembleFlipTableContent(filteredItems, true);
      // } else {
      //   this.assembleFlipTableContent(this.statusData);
      // }
    }
  
    handleUserTableDownload() {
      const columns: Array<{ key: string; label: string; }> = [
        { key: 'areaId', label: 'ID Área' },
        { key: 'nomeArea', label: 'Área Temática' },
        { key: 'projetoId', label: 'ID Projeto' },
        { key: 'nomeProjeto', label: 'Projeto' },
        { key: 'programaId', label: 'ID Programa' },
        { key: 'nomePrograma', label: 'Programa' },
        { key: 'entregaId', label: 'ID Entrega' },
        { key: 'nomeEntrega', label: 'Entrega' },
        { key: 'nomeStatus', label: 'Status' },
        { key: 'orgaoId', label: 'ID Órgão' },
        { key: 'nomeOrgao', label: 'Órgão' },
        { key: 'portfolioId', label: 'ID Portifólio' },
        { key: 'nomePortfolio', label: 'Portifólio' },
        { key: 'contagemPE', label: 'Contagem PE' }
      ];
  
      // this.exportToCSVService.exportWithCustomHeaders(
      //   this.statusData,
      //   columns,
      //   'InfoPlan_Entregas_por_Status.csv'
      // );
      // 123 456 789 *
    }
  
    formatCurrencyString(original: number) {
      let suffix = '';
      const originalInText = original.toString();
      const beforeDecimals = originalInText.split('.')[0];
      // Divide o número no ponto ".", e seleciona a primeira parte

      if (beforeDecimals.length >= 4 && beforeDecimals.length <= 6) {
        // Se tiver 4-6 dígitos, é na faixa dos milhares
        suffix = 'k';
      }
      if (beforeDecimals.length >= 7 && beforeDecimals.length <= 9) {
        // Se tiver 7-9 dígitos, é na faixa dos milhões
        suffix = 'mi';
      } else if (beforeDecimals.length >= 10 && beforeDecimals.length <= 12) {
        // Se tiver 10-12 dígitos, é na faixa dos bilhões
        suffix = 'bi';
      } else if (beforeDecimals.length >= 13 && beforeDecimals.length <= 15) {
        // Se tiver 13-15 dígitos, é na faixa dos trilhões
        suffix = 'tri';
      }
      
      if (originalInText.length > 2) {
        return `R$ ${originalInText.slice(0, 2)},${originalInText.slice(2, 4)} ${suffix}`;
      }

      return `R$ ${originalInText}`;
    }
}