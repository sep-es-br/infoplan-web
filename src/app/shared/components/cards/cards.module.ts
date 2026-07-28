import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NbTooltipModule } from "@nebular/theme";
import { DashboardSummaryCardComponent } from "./cards.component";

@NgModule({
  declarations: [DashboardSummaryCardComponent],
  imports: [CommonModule, NbTooltipModule],
  exports: [DashboardSummaryCardComponent],
})
export class CardsModule {}
