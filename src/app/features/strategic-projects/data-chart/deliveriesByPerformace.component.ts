import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../core/service/strategic-projects.service';

@Component({
  selector: 'ngx-deliveries-by-performace',
  template: '<ngx-pie-chart-model [data]="chartData" [colors]="chartColors" [height]="150"></ngx-pie-chart-model>',
  standalone: true,
  imports: [PieChartModelComponent],
})
export class DeliveriesByPerformaceComponent implements OnChanges {

  @Input() filter!: IStrategicProjectFilterValuesDto;

  chartData: any;
  chartColors = [];
  performaceData: IStrategicProjectDeliveries[];
  performaceShow: IStrategicProjectDeliveriesShow[];

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

    this.strategicProjectsService.getDeliveriesByPerformace(cleanedFilter).subscribe(
      (data: IStrategicProjectDeliveries[]) => {
        this.performaceData = data;

      this.performaceData.forEach(performace => {
        if(performace.statusId !== 0 || performace.nomeStatus !== 'null'){
          let pShow = this.performaceShow.find((s) => s.nomeStatus == performace.nomeStatus)
          if(pShow === undefined){
            this.performaceShow.push(
              {
                statusId: performace.statusId,
                nomeStatus: performace.nomeStatus,
                corStatus: performace.corStatus,
                count: performace.contagemPE
              }
            )
          }else{
            pShow.count = pShow.count + performace.contagemPE
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

      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por desempenho:', error);
      }
    );

  }
}

