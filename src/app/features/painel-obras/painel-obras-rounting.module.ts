import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrgaoComponent } from "./orgao/orgao.component";
import { VisaoGeralComponent } from "./visao-geral/visao-geral.component";
import { CarteiraComponent } from "./carteira/carteira.component";
import { MunicipioComponent } from "./municipio/municipio.component";
import { LayoutPainelObrasComponent } from "./layout-painel-obras/layout-painel-obras.component";

export const routes: Routes = [
    {
      path: "",
      component: LayoutPainelObrasComponent,
      children: [
        {
          path: "",
          redirectTo: "visao-geral",
          pathMatch: "full",
        },
        {
          path: "visao-geral",
          component: VisaoGeralComponent,
        },
        {
          path: "orgao",
          component: OrgaoComponent,
        },
        {
          path: "municipio",
          component: MunicipioComponent,
        },
        {
          path: "carteira",
          component: CarteiraComponent,
        }
      ]
    }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PainelObrasRoutingModule {}
