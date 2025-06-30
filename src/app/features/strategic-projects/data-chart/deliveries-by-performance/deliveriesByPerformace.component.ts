import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent, FlipTableContent } from '../../flip-table-model/flip-table.component';

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

  performaceData: IStrategicProjectDeliveries[];

  performaceShow: IStrategicProjectDeliveriesShow[];

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
    this.performaceShow = [];

    this.strategicProjectsService.getDeliveriesByPerformace(cleanedFilter)
      .subscribe((data: IStrategicProjectDeliveries[]) => {
        this.performaceData = data;

        this.performaceData.forEach(performace => {
          if (performace.statusId !== 0 || performace.nomeStatus !== 'null') {
            let pShow = this.performaceShow.find((s) => s.nomeStatus == performace.nomeStatus);

            if (pShow === undefined) {
              this.performaceShow.push(
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

        this.performaceShow.sort((a, b) => (a.statusId < b.statusId ? -1 : 1));

        this.chartData = this.performaceShow.map(val => <any> {
          value: val.count,
          name: val.nomeStatus
        });

        this.chartColors = this.performaceShow.map(val => val.corStatus);

        this.assembleFlipTableContent(data);
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por desempenho:', error);
      }
    );
  }

  assembleFlipTableContent(rawData: IStrategicProjectDeliveries[]) {
    const tableColumns = [
      { propertyName: 'nomeArea', displayName: 'Nome da Área' },
      { propertyName: 'nomeEntrega', displayName: 'Nome da Entrega' },
      { propertyName: 'nomeProjeto', displayName: 'Nome do Projeto' },
      { propertyName: 'nomeStatus', displayName: 'Status' },
    ];

    const tableLines = rawData.map((item) => ({
      nomeArea: item.nomeArea,
      nomeEntrega: item.nomeEntrega,
      nomeProjeto: item.nomeProjeto,
      nomeStatus: item.nomeStatus,
    }));

    // this.flipTableContent = {
    //   columns: tableColumns,
    //   lines: tableLines,
    // };
  }
}
