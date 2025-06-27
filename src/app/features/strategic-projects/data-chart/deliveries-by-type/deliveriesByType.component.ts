import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveries, IStrategicProjectDeliveriesShow } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent } from '../../flip-table-model/flip-table.component';

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

  constructor(private strategicProjectsService: StrategicProjectsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  loadData() {
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
      },
      (error) => {
        console.error('Erro ao carregar os dados das entregas por tipo:', error);
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
}
