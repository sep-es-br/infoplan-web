import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StrategicProjectsComponent } from './strategicProjects.component';
import { NbButtonModule, NbCardModule, NbDatepickerModule, NbIconModule, NbInputModule, NbLayoutModule, NbSelectModule } from '@nebular/theme';
import { DeliveriesByStatusComponent } from './data-chart/deliveries-by-status/deliveriesByStatus.component';
import { CriticalMilestonesForPerformanceComponent } from './data-chart/critical-milestones-for-performance/criticalMilestonesForPerformace.component';
import { DeliveriesByPerformaceComponent } from './data-chart/deliveries-by-performance/deliveriesByPerformace.component';
import { DeliveriesByTypeComponent } from './data-chart/deliveries-by-type/deliveriesByType.component';
import { ProjectsByStatusComponent } from './data-chart/projects-by-status/projectsByStatus.component';
import { RisksByClassificationComponent } from './data-chart/risks-by-classification/risksByClassification.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { AccumulatedInvestmentComponent } from './data-chart/accumulated-investment/accumulatedInvestment.component';
import { DeliveriesBySelectedComponent } from './data-chart/deliveries-by-selected/deliveriesBySelected.component';
import { InvestmentBySelectedComponent } from './data-chart/investment-by-selected/investmentBySelected.component';
import { FormsModule } from '@angular/forms';
import { ThemeModule } from '../../@theme/theme.module';
import { MapEsComponent } from './map-es/mapEs.component';


@NgModule({
  declarations: [
    StrategicProjectsComponent,
    MapEsComponent
  ],
  imports: [
    FormsModule,
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
    NgxEchartsModule,
    NbLayoutModule,
    ThemeModule,
    NbSelectModule,
    NbIconModule,
    NbDatepickerModule,
    NbInputModule,
    NbButtonModule,
  ]
})
export class StrategicProjectsModule { }
