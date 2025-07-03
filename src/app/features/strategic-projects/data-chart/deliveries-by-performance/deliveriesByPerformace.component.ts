import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { ExportDataService } from '../../../../core/service/export-data';

@Component({
  selector: 'ngx-deliveries-by-performace',
  templateUrl: './deliveriesByPerformance.component.html',
  styleUrls: ['./deliveriesByPerformance.component.scss'],
  standalone: true,
  imports: [
    PieChartModelComponent,
    FlipTableComponent,
  ],
})
export class DeliveriesByPerformaceComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  performanceData: IStrategicProjectDeliveries[];

  performanceShow: IStrategicProjectDeliveriesShow[];

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

    this.strategicProjectsService.getDeliveriesByPerformace(cleanedFilter)
      .subscribe((data: IStrategicProjectDeliveries[]) => {
        this.performanceData = data;

        this.performanceData.forEach(performace => {
          if (performace.statusId !== 0 || performace.nomeStatus !== 'null') {
            let pShow = this.performanceShow.find((s) => s.nomeStatus == performace.nomeStatus);

            if (pShow === undefined) {
              this.performanceShow.push(
                {
                  statusId: performace.statusId,
                  nomeStatus: performace.nomeStatus,
                  corStatus: performace.corStatus,
                  count: performace.contagemPE
                }
              );
            } else {
              pShow.count = pShow.count + performace.contagemPE;
            }
          }
        });

        this.performanceShow.sort((a, b) => (a.statusId < b.statusId ? -1 : 1));

        this.chartData = this.performanceShow.map(val => <any> {
          value: val.count,
          name: val.nomeStatus
        });

        this.chartColors = this.performanceShow.map(val => val.corStatus);

        this.assembleFlipTableContent(data);
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por desempenho:', error);
      }
    );
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveries[], shouldStartExpanded: boolean = false) {
    const tableColumns = [
      { propertyName: 'nomeStatus', displayName: 'Desempenho' },
      { propertyName: 'contagemPE', displayName: 'Cont.PE' },
    ];

    const finalData: Array<TreeNode> = [];
    
    rawData.forEach((entrega) => {
      const areaIsAlreadyListed = finalData.find((area) => {
        const areaName = area.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === entrega.nomeArea);

        if (areaName) return area;
      });

      if (areaIsAlreadyListed) {
        // A área em questão já está listada

        const projectIsAlreadyListed = areaIsAlreadyListed.children.find((project) => {
          const projectName = project.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === entrega.nomeProjeto);

          if (projectName) return project;
        });

        if (projectIsAlreadyListed) {
          // O projeto em questão já está listado

          projectIsAlreadyListed.children.push({
            data: [
              { originalPropertyName: 'nomeEntrega', propertyName: 'firstColumn', value: entrega.nomeEntrega },
              { propertyName: 'nomeStatus', value: entrega.nomeStatus },
              { propertyName: 'contagemPE', value: entrega.contagemPE },
            ],
            expanded: shouldStartExpanded,
          });
        } else {
          // O projeto em questão ainda não foi listado

          areaIsAlreadyListed.children.push({
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: entrega.nomeProjeto },
            ],
            children: [{
              data: [
                { originalPropertyName: 'nomeEntrega', propertyName: 'firstColumn', value: entrega.nomeEntrega },
                { propertyName: 'nomeStatus', value: entrega.nomeStatus },
                { propertyName: 'contagemPE', value: entrega.contagemPE },
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
            { originalPropertyName: 'nomeArea', propertyName: 'firstColumn', value: entrega.nomeArea },
          ],
          children: [{
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: entrega.nomeProjeto },
            ],
            children: [{
              data: [
                { originalPropertyName: 'nomeEntrega', propertyName: 'firstColumn', value: entrega.nomeEntrega },
                { propertyName: 'nomeStatus', value: entrega.nomeStatus },
                { propertyName: 'contagemPE', value: entrega.contagemPE },
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
      const filteredItems = this.performanceData.filter((entrega) => (
        entrega.nomeArea.toLowerCase().includes(preparedSearchTerm) ||
        entrega.nomeProjeto.toLowerCase().includes(preparedSearchTerm) ||
        entrega.nomeEntrega.toLowerCase().includes(preparedSearchTerm) ||
        entrega.nomeStatus.toLowerCase().includes(preparedSearchTerm)
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
      { key: 'programaId', label: 'ID Programa' },
      { key: 'nomePrograma', label: 'Programa' },
      { key: 'projetoId', label: 'ID Projeto' },
      { key: 'nomeProjeto', label: 'Projeto' },
      { key: 'entregaId', label: 'ID Entrega' },
      { key: 'nomeEntrega', label: 'Entrega' },
      { key: 'contagemPE', label: 'Contagem PE' },
      { key: 'nomeStatus', label: 'Status' },
      { key: 'orgaoId', label: 'ID Órgão' },
      { key: 'nomeOrgao', label: 'Órgão' },
      { key: 'portfolioId', label: 'ID Portifólio' },
      { key: 'nomePortfolio', label: 'Portifólio' },
    ];

    this.exportDataService.exportXLSXWithCustomHeaders(
      this.performanceData,
      columns,
      'InfoPlan_Entregas_por_Desempenho.xlsx'
    );
  }
}
