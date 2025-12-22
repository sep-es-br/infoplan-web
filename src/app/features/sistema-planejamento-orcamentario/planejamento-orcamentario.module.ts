import { CommonModule } from "@angular/common";
import { PlanejamentoOrcamentarioComponent } from "./planejamento-orcamentario.component";
import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule, NbSelectModule, NbLayoutModule, NbAutocompleteModule, NbTagListComponent, NbTagModule } from "@nebular/theme";
import { FormsModule } from "@angular/forms";
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";
import { ChartHorizontalPOSComponent } from "./data/programas-orcamentarias/grafico-pos/chart-horizontal-pos.component";
import { ThemeModule } from "../../@theme/theme.module";

@NgModule({
  declarations: [
    PlanejamentoOrcamentarioComponent
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
    ThemeModule,
    NbAutocompleteModule,
    NbTagModule
],
})
export class PlanejamentoOrcamentarioModule {}
