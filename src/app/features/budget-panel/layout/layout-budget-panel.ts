import { Component, OnInit } from "@angular/core";
import { NavigationTag } from "../../../shared/components/sticky-tag-nav/sticky-tag-nav.component";
import { AuthenticationService } from "../../../core/service/authentication.service";
import { ActivatedRoute } from "@angular/router";

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
export class LayoutBudgetPanel implements OnInit {
  menuExecucao: NavigationTag[] = [];

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioLogado();
    const childRoutes = this.route.routeConfig?.children || [];

    const staticMenu = [
      {
        label: 'Resumo Executivo',
        path: 'resumo-executivo',
        route: ['/pages/execucao-orcamentaria/resumo-executivo'],
        exact: true,
        visibleIn: ['/pages/execucao-orcamentaria']
      },
      {
        label: 'Indicadores',
        path: 'indicador',
        route: ['/pages/execucao-orcamentaria/indicador'],
        exact: true,
        visibleIn: ['/pages/execucao-orcamentaria']
      }
    ];

    // this.menuExecucao = staticMenu.filter(item => {
    //   const routeConfig = childRoutes.find(r => r.path === item.path);
    //   if (!routeConfig) return true;

    //   const allowedRoles = routeConfig.data?.['allowedRoles'] as string[];
    //   const allowedOrgs = routeConfig.data?.['allowedOrgs'] as string[];

    //   // Se a rota não possui nenhuma restrição de role ou org, exibe por padrão
    //   if (!allowedRoles && !allowedOrgs) {
    //     return true;
    //   }

    //   // 1. Verifica as Roles primeiro
    //   if (usuario && allowedRoles && allowedRoles.length > 0) {
    //     const userRoles = usuario.role || [];
    //     const temRole = allowedRoles.some(role => userRoles.includes(role));
    //     if (temRole) {
    //       return true; // Se tem a role necessária, exibe a aba!
    //     }
    //   }

    //   // 2. Se não tem role, verifica a Sigla. Se a sigla for vazia, não mostra a aba
    //   const siglaUsuario = usuario?.sigla || (usuario as any)?.orgao;
    //   if (!usuario || !siglaUsuario || String(siglaUsuario).trim() === '') {
    //     return false;
    //   }

    //   // 3. Verifica se a sigla tem permissão
    //   if (allowedOrgs && allowedOrgs.length > 0) {
    //     return allowedOrgs.includes(String(siglaUsuario).trim());
    //   }

    //   return false;
    // });
    this.menuExecucao = staticMenu.filter(item => {
      const routeConfig = childRoutes.find(r => r.path === item.path);
      if (!routeConfig) return true;

      const allowedRoles = routeConfig.data?.['allowedRoles'] as string[];
      const roleOnly = routeConfig.data?.['roleOnly'] as boolean;

      if (!allowedRoles) {
        return true;
      }

      if (usuario && allowedRoles && allowedRoles.length > 0) {
        const userRoles = Array.isArray(usuario.role)
          ? usuario.role
          : (usuario.role ? [usuario.role] : []);

        const temRole = allowedRoles.some(role => userRoles.includes(role));
        if (temRole) {
          return true;
        }
      }

      if (roleOnly) {
        return false;
      }

      const siglaUsuario = usuario?.sigla || (usuario as any)?.orgao;
      if (!usuario || !siglaUsuario || String(siglaUsuario).trim() === '') {
        return false;
      }

      return true;
    });
  }
}
