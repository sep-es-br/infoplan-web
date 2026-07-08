import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IUsuarioLogado } from '../interfaces/profile.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment.apiUrl}/oauth2/authorization/acessocidadao`;


  constructor(private _http: HttpClient, private router: Router) {}

  public acessoCidadaoSignIn() {
    document.location.href = this._url;
  }

  public getUsuarioLogado(): IUsuarioLogado | null {
    const userProfile = sessionStorage.getItem('user-profile');
    if (userProfile) {
      try {
        return JSON.parse(userProfile) as IUsuarioLogado;
      } catch (e) {
        console.error('Erro ao fazer parse do perfil do usuário:', e);
        return null;
      }
    }
    return null;
  }

}
