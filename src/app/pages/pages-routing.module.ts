import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CapitationComponent } from "../features/capitation/capitation.component";
import { HomeComponent } from "../features/home/home.component";
import { PainelOrcamentoComponent } from "../features/painel-orcamento/painel-orcamento.component";
import { StrategicProjectsComponent } from "../features/strategic-projects/strategicProjects.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";
import { PagesComponent } from "./pages.component";
import { PlanejamentoOrcamentarioComponent } from "../features/sistema-planejamento-orcamentario/planejamento-orcamentario.component";

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "home",
        component: HomeComponent,
      },
      {
        path: "capitation",
        component: CapitationComponent,
        data: { dataSource: "Sistema de Captação de Recursos - SISCAP" },
      },
      {
        path: "strategicProjects",
        component: StrategicProjectsComponent,
        data: { dataSource: "OpenPMO" },
      },
      {
        path: "execucao-orcamentaria",
        component: PainelOrcamentoComponent,
        data: { dataSource: "Sigefes" },
      },
      {
        path: "planejamento-orcamentario",
        component: PlanejamentoOrcamentarioComponent,
        data: { dataSource: "SPO" },
      },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full",
      },
      {
        path: "**",
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
