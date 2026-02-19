import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NbCardModule, NbSelectModule, NbIconModule, NbButtonModule, NbDatepickerModule, NbInputModule, NbTooltipModule, NbLayoutModule, NbToggleModule } from "@nebular/theme"; // <-- ESSENCIAL

import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxEchartsModule } from "ngx-echarts";
import { CardsModule } from "../../shared/components/cards/cards.module";
import { OrgChartVerticalComponent } from "./org-chart-bar/org-chart-vertical/org-chart-vertical.component";
import { BudgetPanelComponent } from "./budget-panel.component";
import { VerticalBarChartModelComponent } from "../strategic-projects/bar-chart-model/vertical-bar-chart-model/vertical-bar-chart-model.component";
import { FilterComponent } from "../../shared/components/filter/filter.component";
import { PieChartComponent } from "./org-chart-pie/org-chart-pie.component";
import { RevenueTotalComponent } from "./data/revenue-total/revenue-total.component";
import { FlipTableComponent } from "../strategic-projects/flip-table-model/flip-table.component";

import { RevenueOriginComponent } from "./data/revenue-origin/revenue-origin.component";
import { RevenueCategoryComponent } from "./data/revenue-category/revenue-category.component";
import { RevenueTaxesComponent } from "./data/revenue-taxes/revenue-taxes.component";
import { RevenueParticipationComponent } from "./data/revenue-participation/revenue-participation.component";
import { RevenueTransferComponent } from "./data/revenue-transfer/revenue-transfer.component";
import { RevenueExpenseGndTotalComponent } from "./data/revenue-expense-gnd-total/revenue-expense-gnd-total.component";
import { RevenueExpenseGndComponent } from "./data/revenue-expense-gnd/revenue-expense-gnd.component";
import { ShortNumberPipe } from "../../@theme/pipes";
import { RevenueIcmsComponent } from "./data/revenue-icms/revenue-icms.component";
import { ThemeModule } from "../../@theme/theme.module";
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";

@NgModule({
  declarations: [
    BudgetPanelComponent,
    RevenueTotalComponent,
    RevenueExpenseGndTotalComponent,
    RevenueExpenseGndComponent,
    RevenueIcmsComponent,
    RevenueParticipationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    ThemeModule,
    NbSelectModule,
    NbDatepickerModule,
    CardsModule,
    NgxChartsModule,
    NgxEchartsModule,
    NbInputModule,
    NbTooltipModule,
    TextTruncatePipe,
    NbIconModule,
    VerticalBarChartModelComponent,
    FilterComponent,
    PieChartComponent,
    FlipTableComponent,
    NbLayoutModule,
    RevenueTaxesComponent,
    RevenueCategoryComponent,
    RevenueOriginComponent,
    RevenueTransferComponent,
    OrgChartVerticalComponent,
    NbToggleModule
  ],
  providers: [
    ShortNumberPipe,
  ],
})
export class BudgetPanelModule { }
