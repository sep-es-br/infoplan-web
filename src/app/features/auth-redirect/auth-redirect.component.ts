import {Component} from '@angular/core';
import {Router} from '@angular/router';



import { IProfile } from '../../core/interfaces/profile.interface';
import { ProfileService } from '../../core/service/profile.service';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { off } from 'process';


@Component({
  selector: 'ngx-infoplan-auth-redirect',
  standalone: false,
  templateUrl: './auth-redirect.component.html',
})
export class AuthRedirectComponent {
  constructor(
    private _router: Router,
    private _profileService: ProfileService
  ) {
    const tokenQueryParamMap =
      this._router.getCurrentNavigation()?.initialUrl.queryParamMap;

    if (tokenQueryParamMap?.has('token')) {
      sessionStorage.setItem(
        'token',
        atob(tokenQueryParamMap.get('token') as string)
      );
    }

    this._profileService
      .getUserInfo()
      .pipe(
        tap((response: IProfile) => {
          const infoplanToken = response.token;

          sessionStorage.setItem('token', infoplanToken);
        }),
        tap((response: IProfile) => {
          const userProfile = {
            name: response.name,
            email: response.email,
            role: response.role,
          };

        const userRoles = response.role ?? [];

        const allowedRoles = Object.values(environment.allowedRoles).filter(role => role); 

        const hasAccess = userRoles.some(role => allowedRoles.includes(role));

        if (!hasAccess) {
          sessionStorage.clear();
          this._router.navigate(['/login'], {
            state: { authError: 'Acesso negado: Você não tem autorização para acessar esta aplicação.' }
          });
          return;
        }

          sessionStorage.setItem('user-profile', JSON.stringify(userProfile));
          this._router.navigate(['pages']);
        }), catchError(() => {
          sessionStorage.clear();
          this._router.navigate(['/login'], {
            state: { authError: 'Acesso negado: Você não tem autorização para acessar esta aplicação.' }
          });
          return of(null);
        })
      )
      .subscribe();
    }
}
