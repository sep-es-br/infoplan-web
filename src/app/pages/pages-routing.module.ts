import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CapitationComponent } from "../features/capitation/capitation.component";
import { HomeComponent } from "../features/home/home.component";
import { BudgetPanelComponent } from "../features/budget-panel/budget-panel.component";
import { StrategicProjectsComponent } from "../features/strategic-projects/strategicProjects.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";
import { PagesComponent } from "./pages.component";
import { PlanejamentoOrcamentarioComponent } from "../features/planejamento-orcamentario/planejamento-orcamentario.component";
import { environment } from "../../environments/environment";
import { OrganizacaoGuardGuard } from "../core/guards/organizacao-guard.guard";

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
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "Sistema de Captação de Recursos - SISCAP",
          allowedRoles: [environment.allowedRoles.capitacao, environment.allowedRoles.geral],
          fallbackRoute: '/pages/home'
        },
      },
      {
        path: "strategicProjects",
        component: StrategicProjectsComponent,
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "OpenPMO",
          allowedRoles: [environment.allowedRoles.projetosEstrategicos, environment.allowedRoles.geral],
          fallbackRoute: '/pages/home'
        },
      },
      {
        path: "execucao-orcamentaria",
        loadChildren: () => import('../features/budget-panel/budget-panel.module').then(m => m.BudgetPanelModule),
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "Sigefes",
          allowedRoles: [environment.allowedRoles.execucaoOrcamentaria, environment.allowedRoles.geral],
          fallbackRoute: '/pages/home'
        },
      },
      {
        path: "planejamento-orcamentario",
        component: PlanejamentoOrcamentarioComponent,
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "SPO",
          allowedRoles: [environment.allowedRoles.planejamentoOrcamentario, environment.allowedRoles.geral],
          fallbackRoute: '/pages/home'
        },
      },
      {
        path: "painel-obras",
        loadChildren: () => import('../features/painel-obras/layout-painel-obras/layout-painel-obras.module').then(m => m.LayoutPainelObrasModule),
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "PMO",
          allowedRoles: [environment.allowedRoles.painelObras, environment.allowedRoles.geral],
          fallbackRoute: '/pages/home'
        },
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
