import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizacaoGuardGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const usuario = this.authService.getUsuarioLogado();

    // Validação básica: O usuário precisa estar logado
    if (!usuario) {
      return this.router.createUrlTree(['/login']);
    }

    const allowedRoles = route.data['allowedRoles'] as Array<string>;
    const allowedOrgs = route.data['allowedOrgs'] as Array<string>;
    const roleOnly = route.data['roleOnly'] as boolean;

    // Se a rota não possui nenhuma restrição de role ou org, permite acesso
    if (!allowedRoles && !allowedOrgs) {
      return true;
    }

    // 1. Verifica as Roles primeiro
    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles = usuario.role || [];
      const temRole = allowedRoles.some(role => userRoles.includes(role));
      if (temRole) {
        return true; // Se tem a role necessária, tem acesso total garantido!
      }
    }

    // Se exige apenas a Role (e o usuário não passou no check acima), bloqueia:
    if (roleOnly) {
      const fallback = route.data['fallbackRoute'] || '/pages/home';
      this.router.navigate([fallback]);
      return false;
    }

    // 2. Se não tem role, verifica a Sigla. Se a sigla for vazia, não mostra nada
    const siglaUsuario = usuario.sigla || (usuario as any).orgao;
    if (!siglaUsuario || String(siglaUsuario).trim() === '') {
      const fallback = route.data['fallbackRoute'] || '/pages/home';
      this.router.navigate([fallback]);
      return false;
    }

    // 3. Verifica se a sigla tem permissão na lista de orgs permitidas (caso haja restrição específica)
    if (allowedOrgs && allowedOrgs.length > 0) {
      const temOrg = allowedOrgs.includes(String(siglaUsuario).trim());
      if (temOrg) {
        return true; // Se a organização está permitida, concede acesso!
      }
      
      // Se há restrições e o usuário não pertence a elas:
      const fallback = route.data['fallbackRoute'] || '/pages/home';
      this.router.navigate([fallback]);
      return false;
    }

    // Se o usuário tem sigla preenchida e não há restrição específica de allowedOrgs:
    return true;
  }
}
