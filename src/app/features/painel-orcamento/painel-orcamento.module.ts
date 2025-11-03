import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NbCardModule, NbSelectModule, NbIconModule } from "@nebular/theme"; // <-- ESSENCIAL

import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxEchartsModule } from "ngx-echarts";
import { CardsModule } from "../../shared/components/cards/cards.module";
import { OrgChartHorizontalComponent } from "./org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { OrgChartVerticalComponent } from "./org-chart-bar/org-chart-vertical/org-chart-vertical.component";
import { PainelOrcamentoComponent } from "./painel-orcamento.component";
import { VerticalBarChartModelComponent } from "../strategic-projects/bar-chart-model/vertical-bar-chart-model/vertical-bar-chart-model.component";
import { FilterComponent } from "../../shared/components/filter/filter.component";
import { PieChartComponent } from "./org-chart-pie/org-chart-pie.component";

@NgModule({
  declarations: [
    PainelOrcamentoComponent,
    OrgChartHorizontalComponent,
    OrgChartHorizontalComponent,
    OrgChartVerticalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    CardsModule,
    NgxChartsModule,
    NgxEchartsModule,
    NbSelectModule,
    VerticalBarChartModelComponent,
    NbIconModule,
    FilterComponent,
    PieChartComponent,
  ],
})
export class PainelOrcamentoModule {}
