import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VerticalBarChartModelComponent } from '../../bar-chart-model/verticalBarChartModel.component';
import { IStrategicProjectAccumulatedInvestment } from '../../../../core/interfaces/strategic-project.interface';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { ExportDataService } from '../../../../core/service/export-data';
import { UtilitiesService } from '../../../../core/service/utilities.service';


@Component({
  selector: 'ngx-accumulated-investment',
  templateUrl: './accumulatedInvestment.component.html',
  styleUrls: ['./accumulatedInvestment.component.scss'],
  standalone: true,
  imports: [
    VerticalBarChartModelComponent,
    FlipTableComponent,
  ],
})
export class AccumulatedInvestmentComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  accumulatedInvestmentData: IStrategicProjectAccumulatedInvestment[] = []

  hasData: boolean = false;

  flipTableContent: FlipTableContent;

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
    private utilitiesService: UtilitiesService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  loadData() {
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];

    this.strategicProjectsService.getAccumulatedInvestment(cleanedFilter)
      .subscribe((data: IStrategicProjectAccumulatedInvestment[]) => {
        this.accumulatedInvestmentData = data;

        this.chartData = this.accumulatedInvestmentData.map(item => ({
          date: this.formatDate(item.anoMes),
          previsto: item.custoPrevistoAcumulado, 
          realizado: item.custoRealizadoAcumulado, 
        }));

        this.assembleFlipTableContent(this.accumulatedInvestmentData);
      },
      (error) => {
        console.error('Erro ao carregar os dados do investimento acumulado:', error);
      });

    this.chartColors = ['#42726F', '#00A261'];
  }

  private formatDate(anoMes: number): string {
    const anoMesStr = anoMes.toString(); 
    const year = anoMesStr.substring(0, 4); 
    const month = anoMesStr.substring(4, 6);

    return `${month}-${year}`; 
  }

  assembleFlipTableContent(rawData: IStrategicProjectAccumulatedInvestment[], shouldStartExpanded: boolean = false) {
    const standardMonetaryAlignment = {
      header: FlipTableAlignment.CENTER,
      data: FlipTableAlignment.RIGHT,
    };

    const tableColumns = [
      { propertyName: 'custoPrevisto', displayName: 'Previsto', alignment: standardMonetaryAlignment },
      { propertyName: 'custoPrevistoAcumulado', displayName: 'Previsto Acumulado', alignment: standardMonetaryAlignment },
      { propertyName: 'custoRealizado', displayName: 'Realizado', alignment: standardMonetaryAlignment },
      { propertyName: 'custoRealizadoAcumulado', displayName: 'Realizado Acumulado', alignment: standardMonetaryAlignment },
    ];

    const finalData: Array<TreeNode> = rawData.map((investimento) => ({
      data: [
        { originalPropertyName: 'anoMes', propertyName: 'firstColumn', value: `${this.formatDate(investimento.anoMes)}` },
        { propertyName: 'custoPrevisto', value: this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoPrevisto, 'R$') },
        { propertyName: 'custoPrevistoAcumulado', value: this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoPrevistoAcumulado, 'R$') },
        { propertyName: 'custoRealizado', value: this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoRealizado, 'R$') },
        { propertyName: 'custoRealizadoAcumulado', value: this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoRealizadoAcumulado, 'R$') },
      ],
      children: [],
      expanded: shouldStartExpanded,
    }));

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'anoMes',
        propertyName: 'firstColumn',
        displayName: 'Mês / Ano',
      },
      data: finalData,
    };
  }
  
  handleUserTableSearch(searchTerm: string) {
    if (searchTerm.length > 0) {
      const preparedSearchTerm = searchTerm.toLowerCase();
      const filteredItems = this.accumulatedInvestmentData.filter((investimento) => (
        investimento.anoMes.toString().includes(preparedSearchTerm) ||
        this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoPrevisto, 'R$').includes(preparedSearchTerm) ||
        this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoPrevistoAcumulado, 'R$').includes(preparedSearchTerm) ||
        this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoRealizado, 'R$').includes(preparedSearchTerm) ||
        this.utilitiesService.formatCurrencyUsingBrazilianStandards(investimento.custoRealizadoAcumulado, 'R$').includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.accumulatedInvestmentData);
    }
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string; }> = [
      { key: 'anoMes', label: 'Ano / Mês' },
      { key: 'custoPrevisto', label: 'Custo Previsto' },
      { key: 'custoPrevistoAcumulado', label: 'Custo Previsto Acumulado' },
      { key: 'custoRealizado', label: 'Custo Realizado' },
      { key: 'custoRealizadoAcumulado', label: 'Custo Realizado Acumulado' },
    ];

    this.exportDataService.exportXLSXWithCustomHeaders(
      this.accumulatedInvestmentData,
      columns,
      `InfoPlan_Investimento_Acumulado.xlsx`,
    );
  }
}
