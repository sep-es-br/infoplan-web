import { CommonModule } from "@angular/common";
import { PlanejamentoOrcamentarioComponent } from "./planejamento-orcamentario.component";
import { CardsModule } from "../../shared/components/cards/cards.module";
import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule, NbSelectModule, NbLayoutModule, NbAutocompleteModule, NbTagModule, NbTooltipComponent, NbTooltipModule } from "@nebular/theme";
import { FormsModule } from "@angular/forms";
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";
import { ThemeModule } from "../../@theme/theme.module";
import { DashboardUoComponent } from "./data/dashboard/dashboard-uo/dashboard-uo.component";
import { ProgressBarUoComponent } from "./data/total-autorizado-progress-bar/progress-bar-uo/progress-bar-uo.component";
import { DashboardPoComponent } from './data/dashboard/dashboard-po/dashboard-po.component';
import { ProgressBarPoComponent } from "./data/total-autorizado-progress-bar/progress-bar-po/progress-bar-po.component";
import { GraficoTotalAnoComponent } from "./data/dashboard/grafico-total/grafico-total-ano.component";
import { GraficoTotalAnoSigefesComponent } from "./data/dashboard/grafico-total-ano-sigefes/grafico-total-ano-sigefes.component";

@NgModule({
  declarations: [
    PlanejamentoOrcamentarioComponent
  ],
  imports: [
    CardsModule,
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
    NbCardModule,
    NbTooltipModule,
    TextTruncatePipe,
    NbLayoutModule,
    ThemeModule,
    NbAutocompleteModule,
    NbTagModule,
    DashboardUoComponent,
    ProgressBarUoComponent,
    DashboardPoComponent,
    ProgressBarPoComponent,
    GraficoTotalAnoComponent,
    GraficoTotalAnoSigefesComponent
],
})
export class PlanejamentoOrcamentarioModule {}
