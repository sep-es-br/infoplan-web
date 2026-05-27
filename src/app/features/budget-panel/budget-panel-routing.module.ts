import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutBudgetPanel } from "./layout/layout-budget-panel";
import { BudgetPanelComponent } from "./budget-panel.component";
import { BudgetPanelIndicatorComponent } from "./budget-panel-indicator/budget-panel-indicator.component";

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
        component: BudgetPanelComponent
      },
      {
        path: "indicador",
        component: BudgetPanelIndicatorComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetPanelRoutingModule { }
