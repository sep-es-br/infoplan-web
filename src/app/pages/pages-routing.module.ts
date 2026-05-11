import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CapitationComponent } from "../features/capitation/capitation.component";
import { HomeComponent } from "../features/home/home.component";
import { BudgetPanelComponent } from "../features/budget-panel/budget-panel.component";
import { StrategicProjectsComponent } from "../features/strategic-projects/strategicProjects.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";
import { PagesComponent } from "./pages.component";
import { PlanejamentoOrcamentarioComponent } from "../features/planejamento-orcamentario/planejamento-orcamentario.component";
import { NavigationBudgetPanel } from "../features/budget-panel/navigation-budget-panel/navigation-budget-panel";

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
        loadChildren: () =>  import('../features/budget-panel/budget-panel.module').then(m => m.BudgetPanelModule),
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
export class PagesRoutingModule { }
