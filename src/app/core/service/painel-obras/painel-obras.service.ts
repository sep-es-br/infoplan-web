import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { IFiltroMunicipio, IFiltroOrgao, IFiltroStatus, IPainelObrasRequest } from '../../interfaces/painel-obras/painel-obras';
import { catchError } from 'rxjs/operators';

interface IFiltroStatusRequest {
  orgao: string;
  municipio: string;
}
interface IFiltroMunicipioRequest {
  orgao: string;
}
@Injectable({
  providedIn: 'root'
})
export class PainelObrasService {
  private readonly _URI = `${environment.apiUrl}/painel-obras`;

  constructor(
    private _http: HttpClient,
    private _router: Router
  ) {}

  public getOrgaos(): Observable<IFiltroOrgao[]> {
    return this._http.get<IFiltroOrgao[]>(`${this._URI}/filtros/orgaos`).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getMunicipios(filtro: IFiltroMunicipioRequest): Observable<IFiltroMunicipio[]> {
    const params: HttpParams = this.returnParamsMunicipio(filtro);
    return this._http.get<IFiltroMunicipio[]>(`${this._URI}/filtros/municipios/${params.get('orgao')}`).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getStatus(filtro: IFiltroStatusRequest): Observable<IFiltroStatus[]> {
    const params: HttpParams = this.returnParamsStatus(filtro);
    return this._http.get<IFiltroStatus[]>(`${this._URI}/filtros/status/${params.get('orgao')}/${params.get('municipio')}`).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalProgramas(request: IPainelObrasRequest): Observable<{ totalPrograma: number }> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ totalPrograma: number }>(`${this._URI}/total-programa`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalProjetos(request: IPainelObrasRequest): Observable<{ totalProjetos: number }> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ totalProjetos: number }>(`${this._URI}/total-projetos`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalPlanejado(request: IPainelObrasRequest): Observable<{ totalPlanejado: number }> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ totalPlanejado: number }>(`${this._URI}/total-planejado`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalRealizado(request: IPainelObrasRequest): Observable<{ totalRealizado: number }> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ totalRealizado: number }>(`${this._URI}/total-realizado`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getContagemPE(request: IPainelObrasRequest): Observable<{ contagemPE: number }> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ contagemPE: number }>(`${this._URI}/total-contagem-pe`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getContagemEntregas(request: IPainelObrasRequest): Observable<{ totalEntregas: number }> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ totalEntregas: number }>(`${this._URI}/total-contagem-entregas`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  private returnParams(request: IPainelObrasRequest): HttpParams {
    let params = new HttpParams();
    params = params.append('orgao', request.orgao);
    params = params.append('municipio', request.municipio);
    params = params.append('status', request.status);
    return params;
  }

  private returnParamsMunicipio(request: IFiltroMunicipioRequest): HttpParams {
    let params = new HttpParams();
    params = params.append('orgao', request.orgao);
    return params;
  }

  private returnParamsStatus(request: IFiltroStatusRequest): HttpParams {
    let params = new HttpParams();
    params = params.append('orgao', request.orgao);
    params = params.append('municipio', request.municipio);
    return params;
  }

  private handleError(err: any, router: Router): Observable<never> {
    if ((err as HttpErrorResponse).status == HttpStatusCode.Unauthorized) {
      router.navigate(["pages/home"]);
    } else if ((err as HttpErrorResponse).status == HttpStatusCode.Forbidden) {
      router.navigate(["login"]);
    }

    return throwError(() => err);
  }
}
