import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../core/interfaces/strategic-project-deliveries.interface';
import { StrategicProjectsService } from '../../../core/service/strategic-projects.service';

@Component({
  selector: 'ngx-critical-milestones-for-performance',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
})
export class CriticalMilestonesForPerformanceComponent  implements OnChanges {

  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;
  chartColors = [];
  performaceData: IStrategicProjectDeliveries[];
  performaceShow: IStrategicProjectDeliveriesShow[];
  hasData: boolean = false;

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

    this.strategicProjectsService.getCriticalMilestonesForPerformace(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveries[]) => {
        this.performaceData = data;

      this.performaceData.forEach(performace => {
        if(performace.statusId !== 0 || performace.nomeStatus !== 'null'){
          let sShow = this.performaceShow.find((s) => s.nomeStatus == performace.nomeStatus)
          if(sShow === undefined){
            this.performaceShow.push(
              {
                statusId: performace.statusId,
                nomeStatus: performace.nomeStatus,
                corStatus: performace.corStatus,
                count: 1
              }
            )
          }else{
            sShow.count++
          }
        }
      });
      this.performaceShow
        .sort((a, b) => (a.statusId < b.statusId ? -1 : 1));

      this.chartData = this.performaceShow.map(val => <any>{
        value: val.count,
        name: val.nomeStatus
      });

      this.chartColors = this.performaceShow.map(val => val.corStatus);

      this.hasData = this.chartData.length > 0;

      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por status:', error);
        this.hasData = false;
      }
    );

  }
}