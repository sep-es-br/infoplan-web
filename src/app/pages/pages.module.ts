import { NgModule } from "@angular/core";
import { NbMenuModule } from "@nebular/theme";

import { ThemeModule } from "../@theme/theme.module";
import { HomeModule } from "../features/home/home.module";
import { LoginModule } from "../features/login/login.module";
import { PainelOrcamentoModule } from "../features/painel-orcamento/painel-orcamento.module";
import { StrategicProjectsModule } from "../features/strategic-projects/strategicProjects.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";
import { PagesRoutingModule } from "./pages-routing.module";
import { PagesComponent } from "./pages.component";
import { PlanejamentoOrcamentarioModule } from "../features/planejamento-orcamentario/planejamento-orcamentario.module";

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    HomeModule,
    StrategicProjectsModule,
    LoginModule,
    PlanejamentoOrcamentarioModule
  ],
  declarations: [PagesComponent],
})
export class PagesModule {}
