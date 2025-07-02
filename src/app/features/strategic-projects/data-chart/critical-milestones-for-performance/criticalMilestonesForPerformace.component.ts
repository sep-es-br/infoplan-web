import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { ExportDataService } from '../../../../core/service/export-data';

@Component({
  selector: 'ngx-critical-milestones-for-performance',
  templateUrl: './criticalMilestonesForPerformance.component.html',
  styleUrls: ['./criticalMilestonesForPerformance.component.scss'],
  standalone: true,
  imports: [
    PieChartModelComponent,
    FlipTableComponent,
  ],
})
export class CriticalMilestonesForPerformanceComponent  implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  performanceData: IStrategicProjectDeliveries[];

  performanceShow: IStrategicProjectDeliveriesShow[];

  hasData: boolean = false;

  flipTableContent: FlipTableContent;

  constructor(
    private strategicProjectsService: StrategicProjectsService,
    private exportDataService: ExportDataService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  loadData() {
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];
    this.performanceShow = [];

    this.strategicProjectsService.getCriticalMilestonesForPerformace(cleanedFilter)
      .subscribe((data: IStrategicProjectDeliveries[]) => {
        this.performanceData = data;

        this.performanceData.forEach(performace => {
          if (performace.statusId !== 0 || performace.nomeStatus !== 'null') {
            let sShow = this.performanceShow.find((s) => s.nomeStatus == performace.nomeStatus);

            if (sShow === undefined) {
              this.performanceShow.push(
                {
                  statusId: performace.statusId,
                  nomeStatus: performace.nomeStatus,
                  corStatus: performace.corStatus,
                  count: 1
                }
              );
            } else{
              sShow.count++
            }
          }
        });

        this.performanceShow.sort((a, b) => (a.statusId < b.statusId ? -1 : 1));

        this.chartData = this.performanceShow.map(val => <any>{
          value: val.count,
          name: val.nomeStatus
        });

        this.chartColors = this.performanceShow.map(val => val.corStatus);
        this.hasData = this.chartData.length > 0;

        this.assembleFlipTableContent(data);
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por status:', error);
        this.hasData = false;
      }
    );
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveries[], shouldStartExpanded: boolean = false) {
    const tableColumns = [{ propertyName: 'nomeStatus', displayName: 'Desempenho' }];

    const finalData: Array<TreeNode> = [];
    
    rawData.forEach((marco) => {
      const areaIsAlreadyListed = finalData.find((area) => {
        const areaName = area.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === marco.nomeArea);

        if (areaName) return area;
      });

      if (areaIsAlreadyListed) {
        // A área em questão já está listada

        const projectIsAlreadyListed = areaIsAlreadyListed.children.find((project) => {
          const projectName = project.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === marco.nomeProjeto);

          if (projectName) return project;
        });

        if (projectIsAlreadyListed) {
          // O projeto em questão já está listado

          projectIsAlreadyListed.children.push({
            data: [
              { originalPropertyName: 'nomeMarcoCritico', propertyName: 'firstColumn', value: marco.nomeMarcoCritico },
              { propertyName: 'nomeStatus', value: marco.nomeStatus },
            ],
            expanded: shouldStartExpanded,
          });
        } else {
          // O projeto em questão ainda não foi listado

          areaIsAlreadyListed.children.push({
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: marco.nomeProjeto },
            ],
            children: [{
              data: [
                { originalPropertyName: 'nomeMarcoCritico', propertyName: 'firstColumn', value: marco.nomeMarcoCritico },
                { propertyName: 'nomeStatus', value: marco.nomeStatus },
              ],
              expanded: shouldStartExpanded,
            }],
            expanded: shouldStartExpanded,
          });
        }
      } else {
        // A área em questão ainda não foi listada

        finalData.push({
          data: [
            { originalPropertyName: 'nomeArea', propertyName: 'firstColumn', value: marco.nomeArea },
          ],
          children: [{
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: marco.nomeProjeto },
            ],
            children: [{
              data: [
                { originalPropertyName: 'nomeMarcoCritico', propertyName: 'firstColumn', value: marco.nomeMarcoCritico },
                { propertyName: 'nomeStatus', value: marco.nomeStatus },
              ],
              expanded: shouldStartExpanded,
            }],
            expanded: shouldStartExpanded,
          }],
          expanded: shouldStartExpanded,
        });
      }
    });

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'nomeArea',
        propertyName: 'firstColumn',
        displayName: 'Nome',
      },
      data: finalData,
    };
  }

  handleUserTableSearch(searchTerm: string) {
    if (searchTerm.length > 0) {
      const preparedSearchTerm = searchTerm.toLowerCase();
      const filteredItems = this.performanceData.filter((marco) => (
        marco.nomeArea.toLowerCase().includes(preparedSearchTerm) ||
        marco.nomeProjeto.toLowerCase().includes(preparedSearchTerm) ||
        marco.nomeMarcoCritico.toLowerCase().includes(preparedSearchTerm) ||
        marco.nomeStatus.toLowerCase().includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.performanceData);
    }
  }

  handleUserTableDownload() {
    const columns: Array<{ key: string; label: string; }> = [
      { key: 'areaId', label: 'ID Área' },
      { key: 'nomeArea', label: 'Área Temática' },
      { key: 'projetoId', label: 'ID Projeto' },
      { key: 'nomeProjeto', label: 'Projeto' },
      { key: 'mcId', label: 'ID Marco Crítico' },
      { key: 'nomeMarcoCritico', label: 'Marco Crítico' },
      { key: 'nomeStatus', label: 'Status' },
      { key: 'orgaoId', label: 'ID Órgão' },
      { key: 'nomeOrgao', label: 'Órgão' },
      { key: 'portfolioId', label: 'ID Portifólio' },
      { key: 'nomePortfolio', label: 'Portifólio' },
    ];

    this.exportDataService.exportCSVWithCustomHeaders(
      this.performanceData,
      columns,
      'InfoPlan_Marcos_Críticos_por_Desempenho.csv'
    );
  }
}
