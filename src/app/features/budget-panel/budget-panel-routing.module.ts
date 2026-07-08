import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutBudgetPanel } from "./layout/layout-budget-panel";
import { BudgetPanelComponent } from "./budget-panel.component";
import { BudgetPanelIndicatorComponent } from "./budget-panel-indicator/budget-panel-indicator.component";
import { OrganizacaoGuardGuard } from "../../core/guards/organizacao-guard.guard"; // Import do guard
import { environment } from "../../../environments/environment";

const routes: Routes = [
  {
    path: "",
    component: LayoutBudgetPanel,
    children: [
      {
        path: "",
        redirectTo: "resumo-executivo",
        pathMatch: "full"
      },
      {
        path: "resumo-executivo",
        component: BudgetPanelComponent,
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "Sigefes",
          allowedRoles: [environment.allowedRoles.execucaoOrcamentaria],
          roleOnly: true,
          fallbackRoute: '/pages/execucao-orcamentaria/indicador'
        }
      },
      {
        path: "indicador",
        component: BudgetPanelIndicatorComponent,
        canActivate: [OrganizacaoGuardGuard],
        data: {
          dataSource: "Sigefes",
          allowedRoles: [environment.allowedRoles.execucaoOrcamentaria],
          fallbackRoute: '/pages/execucao-orcamentaria/resumo-executivo'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetPanelRoutingModule { }
