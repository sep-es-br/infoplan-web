import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableAlignment, FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';
import { ExportDataService } from '../../../../core/service/export-data';
import { RequestStatus } from '../../strategicProjects.component';

@Component({
  selector: 'ngx-deliveries-by-type',
  templateUrl: './deliveriesByType.component.html',
  styleUrls: ['./deliveriesByType.component.scss'],
  standalone: true,
  imports: [
    PieChartModelComponent,
    FlipTableComponent,
  ],
})
export class DeliveriesByTypeComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  typeData: IStrategicProjectDeliveries[];

  typeShow: IStrategicProjectDeliveriesShow[];

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
    this.typeShow = [];

    this.strategicProjectsService.getDeliveriesByType(cleanedFilter)
      .subscribe((data: IStrategicProjectDeliveries[]) => {
        this.typeData = data;
      
        this.typeData.forEach(type => {
          if (type.statusId !== 0 || type.nomeStatus !== 'null') {
            let tShow = this.typeShow.find((s) => s.nomeStatus == type.nomeStatus);

            if (tShow === undefined) {
              this.typeShow.push(
                {
                  statusId: type.statusId,
                  nomeStatus: type.nomeStatus,
                  count: type.contagemPE
                }
              );
            } else {
              tShow.count = tShow.count + type.contagemPE;
            }
          }
        });

        this.typeShow.sort((a, b) => (a.statusId < b.statusId ? -1 : 1));
  
        this.chartData = this.typeShow.map(val => <any> {
          value: val.count,
          name: val.nomeStatus
        });

        this.assembleFlipTableContent(data);

        this.requestStatus = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por tipo:', error);
        this.requestStatus = RequestStatus.ERROR;
      }
    );
    
    this.chartColors = [
      '#005073', 
      '#006BA1', 
      '#107DAC', 
      '#189AD3', 
      '#28AED3', 
      '#1EBBD7', 
      '#71C7EC', 
    ];
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveries[], shouldStartExpanded: boolean = false) {
    const tableColumns = [
      { propertyName: 'nomeStatus', displayName: 'Tipo' },
      {
        propertyName: 'contagemPE',
        displayName: 'Cont.PE',
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      },
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
      const filteredItems = this.typeData.filter((entrega) => (
        entrega.nomeArea.toLowerCase().includes(preparedSearchTerm) ||
        entrega.nomeProjeto.toLowerCase().includes(preparedSearchTerm) ||
        entrega.nomeEntrega.toLowerCase().includes(preparedSearchTerm) ||
        entrega.nomeStatus.toLowerCase().includes(preparedSearchTerm)
      ));
  
      this.assembleFlipTableContent(filteredItems, true);
    } else {
      this.assembleFlipTableContent(this.typeData);
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
      this.typeData,
      columns,
      'InfoPlan_Entregas_por_Tipo.xlsx'
    );
  }
}
