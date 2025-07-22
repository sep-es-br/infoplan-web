import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveriesShow, IStrategicProjectRisksByClassification } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { ExportDataService } from '../../../../core/service/export-data';
import { RequestStatus } from '../../strategicProjects.component';

@Component({
  selector: 'ngx-risks-by-classification',
  templateUrl: './risksByClassification.component.html',
  styleUrls: ['./risksByClassification.component.scss'],
  standalone: true,
  imports: [
    PieChartModelComponent,
    FlipTableComponent,
  ],
})
export class RisksByClassificationComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  riskData: IStrategicProjectRisksByClassification[];

  riskShow: IStrategicProjectDeliveriesShow[];

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
    this.riskShow = [];

    this.strategicProjectsService.getRisksByClassification(cleanedFilter)
      .subscribe((data: IStrategicProjectRisksByClassification[]) => {
        this.riskShow = [];
        this.riskData = data;

        this.riskData.forEach(risk => {
          if (risk.importanciaId !== 0 || risk.riscoImportancia !== 'null') {
            let sShow = this.riskShow.find((s) => s.nomeStatus == risk.riscoImportancia);

            if (sShow === undefined) {
              this.riskShow.push(
                {
                  statusId: risk.importanciaId,
                  nomeStatus: risk.riscoImportancia,
                  corStatus: risk.corImportancia,
                  count: 1
                }
              );
            } else {
              sShow.count++;
            }
          }
        });

        this.riskShow.sort((a, b) => (a.statusId < b.statusId ? -1 : 1));

        this.chartData = this.riskShow.map(val => <any> {
          value: val.count,
          name: val.nomeStatus
        });

        this.chartColors = this.riskShow.map(val => val.corStatus);

        this.assembleFlipTableContent(data);

        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados dos riscos por classificação:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
  }

  assembleFlipTableContent(rawData: IStrategicProjectRisksByClassification[], shouldStartExpanded: boolean = false) {
    const tableColumns = [{ propertyName: 'riscoImportancia', displayName: 'Importância' }];

    const finalData: Array<TreeNode> = [];
    
    rawData.forEach((risco) => {
      const areaIsAlreadyListed = finalData.find((area) => {
        const areaName = area.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === risco.nomeArea);

        if (areaName) return area;
      });

      if (areaIsAlreadyListed) {
        // A área em questão já está listada

        const projectIsAlreadyListed = areaIsAlreadyListed.children.find((project) => {
          const projectName = project.data.find((prop) => prop.propertyName === 'firstColumn' && prop.value === risco.nomeProjeto);

          if (projectName) return project;
        });

        if (projectIsAlreadyListed) {
          // O projeto em questão já está listado

          projectIsAlreadyListed.children.push({
            data: [
              { originalPropertyName: 'nomeRisco', propertyName: 'firstColumn', value: risco.nomeRisco },
              { propertyName: 'riscoImportancia', value: risco.riscoImportancia },
            ],
            expanded: shouldStartExpanded,
          });
        } else {
          // O projeto em questão ainda não foi listado

          areaIsAlreadyListed.children.push({
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: risco.nomeProjeto },
            ],
            children: [{
              data: [
                { originalPropertyName: 'nomeRisco', propertyName: 'firstColumn', value: risco.nomeRisco },
                { propertyName: 'riscoImportancia', value: risco.riscoImportancia },
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
            { originalPropertyName: 'nomeArea', propertyName: 'firstColumn', value: risco.nomeArea },
          ],
          children: [{
            data: [
              { originalPropertyName: 'nomeProjeto', propertyName: 'firstColumn', value: risco.nomeProjeto },
            ],
            children: [{
              data: [
                { originalPropertyName: 'nomeRisco', propertyName: 'firstColumn', value: risco.nomeRisco },
                { propertyName: 'riscoImportancia', value: risco.riscoImportancia },
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
      const filteredItems = this.riskData.filter((risco) => (
        risco.nomeArea.toLowerCase().includes(preparedSearchTerm) ||
        risco.nomeProjeto.toLowerCase().includes(preparedSearchTerm) ||
        risco.nomeRisco.toLowerCase().includes(preparedSearchTerm) ||
        risco.riscoImportancia.toLowerCase().includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.riskData);
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
      { key: 'riscoId', label: 'ID Risco' },
      { key: 'nomeRisco', label: 'Risco' },
      { key: 'riscoImportancia', label: 'Importância' },
      { key: 'portfolioId', label: 'ID Portifólio' },
      { key: 'nomePortfolio', label: 'Portifólio' },
    ];

    this.exportDataService.exportXLSXWithCustomHeaders(
      this.riskData,
      columns,
      'InfoPlan_Riscos_por_Importância.xlsx'
    );
  }
}
