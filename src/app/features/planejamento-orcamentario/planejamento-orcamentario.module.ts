import { CommonModule } from "@angular/common";
import { PlanejamentoOrcamentarioComponent } from "./planejamento-orcamentario.component";
import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule, NbSelectModule, NbLayoutModule, NbAutocompleteModule, NbTagModule } from "@nebular/theme";
import { FormsModule } from "@angular/forms";
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";
import { ThemeModule } from "../../@theme/theme.module";
import { DashboardUoComponent } from "./data/dashboard-uo/dashboard-uo/dashboard-uo.component";

@NgModule({
  declarations: [
    PlanejamentoOrcamentarioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
    NbCardModule,
    TextTruncatePipe,
    NbLayoutModule,
    ThemeModule,
    NbAutocompleteModule,
    NbTagModule,
    DashboardUoComponent
],
})
export class PlanejamentoOrcamentarioModule {}
