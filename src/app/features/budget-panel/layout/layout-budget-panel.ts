import { Component} from "@angular/core";
import { NavigationTag } from "../../../shared/components/sticky-tag-nav/sticky-tag-nav.component";

export const APP_ROUTES = {
  EXECUCAO: {
    RESUMO: "/pages/execucao-orcamentaria/resumo-executivo",
    INDICADOR: "/pages/execucao-orcamentaria/indicador",
  },
};
@Component({
  selector: "ngx-layout--budget-panel",
  templateUrl: "./layout-budget-panel.html",
  styleUrls: ["./layout-budget-panel.scss"],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class LayoutBudgetPanel {
  menuExecucao: NavigationTag[] = [
      {
        label: 'Resumo Executivo',
        route: ['/pages/execucao-orcamentaria/resumo-executivo'],
        exact: true,
        visibleIn: ['/pages/execucao-orcamentaria']
      },
      {
        label: 'Indicadores',
        route: ['/pages/execucao-orcamentaria/indicador'],
        exact: true,
        visibleIn: ['/pages/execucao-orcamentaria']
      }
    ];
}
