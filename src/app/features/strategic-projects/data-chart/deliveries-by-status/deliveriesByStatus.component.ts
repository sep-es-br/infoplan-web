import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { FlipTableComponent, FlipTableContent, TreeNode } from '../../flip-table-model/flip-table.component';

@Component({
  selector: 'ngx-deliveries-by-status',
  templateUrl: './deliveriesByStatus.component.html',
  styleUrls: ['./deliveriesByStatus.component.scss'],
  imports: [
    PieChartModelComponent,
    FlipTableComponent,
  ],
  standalone: true,
})
export class DeliveriesByStatusComponent implements OnChanges {
  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;

  chartColors = [];

  statusData: IStrategicProjectDeliveries[];

  statusShow: IStrategicProjectDeliveriesShow[];

  flipTableContent: FlipTableContent;

  constructor(private strategicProjectsService: StrategicProjectsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  loadData() {
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];
    this.statusShow = [];

    this.strategicProjectsService.getDeliveriesByStatus(cleanedFilter)
      .subscribe((data: IStrategicProjectDeliveries[]) => {
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
                  count: status.contagemPE
                }
              );
            } else {
              sShow.count = sShow.count + status.contagemPE;
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
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por status:', error);
      }
    );
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveries[]) {
    const tableColumns = [
      // { propertyName: 'nomeArea', displayName: 'Nome da Área' },
      { propertyName: 'nomeStatus', displayName: 'Status' },
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
            ],
            expanded: false,
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
              ],
              expanded: false,
            }],
            expanded: false,
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
              ],
              expanded: false,
            }],
            expanded: false,
          }],
          expanded: false,
        });
      }
    });

    this.flipTableContent = {
      defaultColumns: tableColumns,
      customColumn: {
        originalPropertyName: 'nomeArea',
        propertyName: 'firstColumn',
        displayName: 'Nome da Área',
      },
      data: finalData,
    };
  }

  handleUserTableSearch(searchTerm: string) {
    
  }
}
