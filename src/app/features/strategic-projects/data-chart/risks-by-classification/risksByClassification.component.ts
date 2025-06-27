import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PieChartModelComponent } from '../../pie-chart-model/pieChartModel.component';
import { IStrategicProjectFilterValuesDto } from '../../../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectDeliveriesShow, IStrategicProjectRisksByClassification } from '../../../../core/interfaces/strategic-project.interface';
import { StrategicProjectsService } from '../../../../core/service/strategic-projects.service';
import { FlipTableComponent } from '../../flip-table-model/flip-table.component';

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

  constructor(private strategicProjectsService: StrategicProjectsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.loadData();
    }
  }

  loadData() {
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.filter);
    this.chartColors = [];
    this.riskShow = [];

    this.strategicProjectsService.getRisksByClassification(cleanedFilter)
      .subscribe((data: IStrategicProjectRisksByClassification[]) => {
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
      },
      (error) => {
        console.error('Erro ao carregar os dados dos riscos por classificação:', error);
      }
    );
  }
}
