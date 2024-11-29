import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StrategicProjectsComponent } from './strategicProjects.component';
import { NbCardModule } from '@nebular/theme';
import { DeliveriesByStatusComponent } from './data-chart/deliveriesByStatus.component';
import { CriticalMilestonesForPerformanceComponent } from './data-chart/criticalMilestonesForPerformace.component';
import { DeliveriesByPerformaceComponent } from './data-chart/deliveriesByPerformace.component';
import { DeliveriesByTypeComponent } from './data-chart/deliveriesByType.component';
import { ProjectsByStatusComponent } from './data-chart/projectsByStatus.component';
import { RisksByClassificationComponent } from './data-chart/risksByClassification.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { AccumulatedInvestmentComponent } from './data-chart/accumulatedInvestment.component';
import { DeliveriesBySelectedComponent } from './data-chart/deliveriesBySelected.component';
import { InvestmentBySelectedComponent } from './data-chart/investmentBySelected.component';


@NgModule({
  declarations: [
    StrategicProjectsComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    DeliveriesByStatusComponent,
    CriticalMilestonesForPerformanceComponent,
    DeliveriesByPerformaceComponent,
    InvestmentBySelectedComponent,
    DeliveriesBySelectedComponent,
    AccumulatedInvestmentComponent,
    DeliveriesByTypeComponent,
    ProjectsByStatusComponent,
    RisksByClassificationComponent,
    NgxEchartsModule
  ]
})
export class StrategicProjectsModule { }
