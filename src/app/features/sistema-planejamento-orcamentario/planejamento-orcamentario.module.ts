import { CommonModule } from "@angular/common";
import { PlanejamentoOrcamentarioComponent } from "./planejamento-orcamentario.component";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule, NbSelectModule, NbLayoutModule } from "@nebular/theme";
import { FormsModule } from "@angular/forms";
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";
import { ChartHorizontalPOSComponent } from "./data/programas-orcamentarias/grafico-pos/chart-horizontal-pos.component";
import { FlipTableComponent } from "../strategic-projects/flip-table-model/flip-table.component";
import { ThemeModule } from "../../@theme/theme.module";

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
    ChartHorizontalPOSComponent,
    NbLayoutModule,
    ThemeModule
],
})
export class PlanejamentoOrcamentarioModule {}
