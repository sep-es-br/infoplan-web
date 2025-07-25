import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { ExportDataService } from '../../../../core/service/export-data';
import { RequestStatus } from '../../strategicProjects.component';

@Component({
  selector: 'ngx-projects-by-status',
  templateUrl: './projectsByStatus.component.html',
  styleUrls: ['./projectsByStatus.component.scss'],
  standalone: true,
  imports: [
    PieChartModelComponent,
    FlipTableComponent,
  ],
})
export class ProjectsByStatusComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  statusData: IStrategicProjectDeliveries[];

  statusShow: IStrategicProjectDeliveriesShow[];

  flipTableContent: FlipTableContent;

  requestStatus: RequestStatus = RequestStatus.EMPTY;

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
    this.requestStatus = RequestStatus.LOADING;
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];
    this.statusShow = [];

    this.strategicProjectsService.getProjectByStatus(cleanedFilter)
      .subscribe((data: IStrategicProjectDeliveries[]) => {
        this.statusShow = [];
        this.statusData = data;

        this.statusData.forEach(status => {
          if (status.statusId !== 0 || status.nomeStatus !== 'null') {
            let sShow = this.statusShow.find((s) => s.nomeStatus == status.nomeStatus);

            if (sShow === undefined) {
              this.statusShow.push(
                {
                  statusId: status.statusId,
                  nomeStatus: status.nomeStatus,
                  corStatus: status.corStatus,
                  count: 1
                }
              );
            } else {
              sShow.count++;
            }
          }
        });

        this.statusShow.sort((a, b) => (a.statusId < b.statusId ? -1 : 1));

        this.chartData = this.statusShow.map(val => <any> {
          value: val.count,
          name: val.nomeStatus
        });

        this.chartColors = this.statusShow.map(val => val.corStatus);

        this.assembleFlipTableContent(data);

        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por status:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveries[], shouldStartExpanded: boolean = false) {
    const tableColumns = [{ propertyName: 'nomeStatus', displayName: 'Status' }];

    const finalData: Array<TreeNode> = [];
    
    rawData.forEach((projeto) => {
      const areaIsAlreadyListed = finalData.find((area) => {
        const areaName = area.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === projeto.nomeArea);

        if (areaName) return area;
      });

      if (areaIsAlreadyListed) {
        // A área em questão já está listada

        areaIsAlreadyListed.children.push({
          data: [
            { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: projeto.nomeProjeto },
            { propertyName: 'nomeStatus', value: projeto.nomeStatus },
          ],
          children: [],
          expanded: shouldStartExpanded,
        });
      } else {
        // A área em questão ainda não foi listada

        finalData.push({
          data: [
            { originalPropertyName: 'nomeArea', propertyName: 'firstColumn', value: projeto.nomeArea },
          ],
          children: [{
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: projeto.nomeProjeto },
              { propertyName: 'nomeStatus', value: projeto.nomeStatus },
            ],
            children: [],
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
      const filteredItems = this.statusData.filter((projeto) => (
        projeto.nomeArea.toLowerCase().includes(preparedSearchTerm) ||
        projeto.nomeProjeto.toLowerCase().includes(preparedSearchTerm) ||
        projeto.nomeStatus.toLowerCase().includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.statusData);
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
      { key: 'nomeStatus', label: 'Status' },
      { key: 'orgaoId', label: 'ID Órgão' },
      { key: 'nomeOrgao', label: 'Órgão' },
      { key: 'portfolioId', label: 'ID Portifólio' },
      { key: 'nomePortfolio', label: 'Portifólio' },
    ];

    this.exportDataService.exportXLSXWithCustomHeaders(
      this.statusData,
      columns,
      'InfoPlan_Projetos_por_Status.xlsx'
    );
  }
}
