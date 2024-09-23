import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment.apiUrl}/oauth2/authorization/acessocidadao`;


  constructor(private _http: HttpClient, private router: Router) {}

  public acessoCidadaoSignIn() {
    document.location.href = this._url;
  }

}
