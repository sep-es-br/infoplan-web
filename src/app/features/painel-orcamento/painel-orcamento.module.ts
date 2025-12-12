import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NbCardModule, NbSelectModule, NbIconModule, NbButtonModule, NbDatepickerModule, NbInputModule, NbTooltipModule, NbLayoutModule } from "@nebular/theme"; // <-- ESSENCIAL

import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxEchartsModule } from "ngx-echarts";
import { CardsModule } from "../../shared/components/cards/cards.module";
import { OrgChartHorizontalComponent } from "./org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { OrgChartVerticalComponent } from "./org-chart-bar/org-chart-vertical/org-chart-vertical.component";
import { PainelOrcamentoComponent } from "./painel-orcamento.component";
import { VerticalBarChartModelComponent } from "../strategic-projects/bar-chart-model/vertical-bar-chart-model/vertical-bar-chart-model.component";
import { FilterComponent } from "../../shared/components/filter/filter.component";
import { PieChartComponent } from "./org-chart-pie/org-chart-pie.component";
import { ReceitaTotalComponent } from "./data/receita-total/receita-total.component";
import { FlipTableComponent } from "../strategic-projects/flip-table-model/flip-table.component";

import { ReceitaOrigemComponent } from "./data/receita-origem/receita-origem.component";
import { ReceitaCategoriaComponent } from "./data/receita-categoria/receita-categoria.component";
import { ReceitaImpostosComponent } from "./data/receita-impostos/receita-impostos.component";
import { ReceitaParticipacaoComponent } from "./data/receita-participacao/receita-participacao.component";
import { ReceitaTransferenciaComponent } from "./data/receita-transferencia/receita-transferencia.component";
import { ReceitaDespesaGndTotalComponent } from "./data/receita-despesa-gnd-total/receita-despesa-gnd-total.component";
import { ReceitaDespesaGndComponent } from "./data/receita-despesa-gnd/receita-despesa-gnd.component";
import { ShortNumberPipe } from "../../@theme/pipes";
import { ReceitaICMSComponent } from "./data/receita-icms/receita-icms.component";
import { ThemeModule } from "../../@theme/theme.module";
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";

@NgModule({
  declarations: [
    PainelOrcamentoComponent,
    OrgChartHorizontalComponent,
    OrgChartHorizontalComponent,
    OrgChartVerticalComponent,
    ReceitaTotalComponent,
    ReceitaOrigemComponent,
    ReceitaCategoriaComponent,
    ReceitaImpostosComponent,
    ReceitaParticipacaoComponent,
    ReceitaTransferenciaComponent,
    ReceitaDespesaGndTotalComponent,
    ReceitaDespesaGndComponent,
    ReceitaICMSComponent,
    ReceitaParticipacaoComponent,
    ReceitaTransferenciaComponent
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
  ],
  providers: [
    ShortNumberPipe
  ]
})
export class PainelOrcamentoModule { }
