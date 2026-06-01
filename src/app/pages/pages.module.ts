import { NgModule } from "@angular/core";
import { NbMenuModule } from "@nebular/theme";

import { ThemeModule } from "../@theme/theme.module";
import { HomeModule } from "../features/home/home.module";
import { LoginModule } from "../features/login/login.module";
import { StrategicProjectsModule } from "../features/strategic-projects/strategicProjects.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";
import { PagesRoutingModule } from "./pages-routing.module";
import { PagesComponent } from "./pages.component";
import { PlanejamentoOrcamentarioModule } from "../features/planejamento-orcamentario/planejamento-orcamentario.module";
import { LayoutPainelObrasModule } from "../features/painel-obras/layout-painel-obras/layout-painel-obras.module";

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    HomeModule,
    StrategicProjectsModule,
    LoginModule,
    PlanejamentoOrcamentarioModule,
    LayoutPainelObrasModule
  ],
  declarations: [PagesComponent],
})
export class PagesModule { }
