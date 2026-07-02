import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IProfile, IUsuarioLogado } from '../interfaces/profile.interface';
import { ErrorHandlerService } from './error-handler.service';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _url = `${environment.apiUrl}/signin/user-info`;
  private _sessionProfileSubject = new BehaviorSubject<IProfile>({ token: "", name: "", email: "", role: [], Sigla: "" });
  public sessionProfile$ = this._sessionProfileSubject.asObservable();

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService,
  ) { }

  public getUserInfo(): Observable<IProfile> {
    return this._http.get<IProfile>(`${this._url}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
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
