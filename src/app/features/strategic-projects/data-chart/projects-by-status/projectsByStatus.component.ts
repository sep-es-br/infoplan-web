import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent } from '../../flip-table-model/flip-table.component';

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

    this.strategicProjectsService.getProjectByStatus(cleanedFilter)
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
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por status:', error);
      }
    );
  }
}
