import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { IFiltroMunicipio, IFiltroOrgao, IFiltroStatus, INumeroEntregasPorMunicipioStatus, IPainelObrasRequest , IPainelObrasTimestmp , IQuantidadeMaiorEntrega, IQuantidadeMaiorEntregaPrevista, ITotalEntregaPorMes, ITotalEntregasPorOrgao, ITotalEntregasPorOrgaoExecucao, ITotalMunicipioStatus, ITotalTotalizador } from '../../interfaces/painel-obras/painel-obras';
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
  ) { }

  public getOrgaos(): Observable<IFiltroOrgao[]> {
    return this._http.get<IFiltroOrgao[]>(`${this._URI}/filtros/orgaos`).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTimestmp(): Observable<IPainelObrasTimestmp> {
    return this._http.get<IPainelObrasTimestmp>(`${this._URI}/timestamp`).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getMunicipios(filtro: IFiltroMunicipioRequest): Observable<IFiltroMunicipio[]> {
    const params: HttpParams = this.returnParamsMunicipio(filtro);

    return this._http.get<IFiltroMunicipio[]>(`${this._URI}/filtros/municipios`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getStatus(filtro: IFiltroStatusRequest): Observable<IFiltroStatus[]> {
    const params: HttpParams = this.returnParamsStatus(filtro);
    return this._http.get<IFiltroStatus[]>(`${this._URI}/filtros/status`, { params }).pipe(
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


  public getQuantidadeStatus(request: IPainelObrasRequest): Observable<{ quantidadeEntregas: number, status: string }[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ quantidadeEntregas: number, status: string }[]>(`${this._URI}/quantidade-por-status`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalEntregasPorAnoEStatus(request: IPainelObrasRequest): Observable<{ ano: string, status: string, planejado: number, realizado: number }[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<{ ano: string, status: string, planejado: number, realizado: number }[]>(`${this._URI}/total-entregas-por-ano-e-status`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalEntregasPorOrgao(request: IPainelObrasRequest): Observable<ITotalEntregasPorOrgao[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<ITotalEntregasPorOrgao[]>(`${this._URI}/total-entregas-por-orgao`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalEntregasPorOrgaoExecucao(request: IPainelObrasRequest): Observable<ITotalEntregasPorOrgaoExecucao[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<ITotalEntregasPorOrgaoExecucao[]>(`${this._URI}/total-entregas-orgao-execucao`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getTotalEntregasPorMunicipioStatus(request: IPainelObrasRequest): Observable<ITotalMunicipioStatus[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<ITotalMunicipioStatus[]>(`${this._URI}/total-entregas-por-municipio-status`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getNumeroEntregasPorMunicipioStatus(request: IPainelObrasRequest): Observable<INumeroEntregasPorMunicipioStatus[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<INumeroEntregasPorMunicipioStatus[]>(`${this._URI}/numero-entregas-por-status`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  public getQuantidadeMaiorEntrega(request: IPainelObrasRequest): Observable<IQuantidadeMaiorEntrega[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IQuantidadeMaiorEntrega[]>(`${this._URI}/quantidade-maior-entrega`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    )
  }

  public getQuantidadeMaiorEntregaPrevista(request: IPainelObrasRequest): Observable<IQuantidadeMaiorEntregaPrevista[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IQuantidadeMaiorEntregaPrevista[]>(`${this._URI}/quantidade-maior-prevista`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    )
  }

  public getTotalEntregaPorMes(request: IPainelObrasRequest): Observable<ITotalEntregaPorMes[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<ITotalEntregaPorMes[]>(`${this._URI}/total-entrega-por-mes`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    )
  }

  public getTotalTotalizador(request: IPainelObrasRequest): Observable<ITotalTotalizador> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<ITotalTotalizador>(`${this._URI}/total-totalizador`, { params }).pipe(
      catchError((err) => this.handleError(err, this._router))
    )
  }

  private returnParams(request: IPainelObrasRequest): HttpParams {
    let params = new HttpParams();

    const sanitizeValue = (value: any): string => {
      if (value === undefined || value === null) return '';

      let strValue = String(value).trim();

      if (strValue === '""') {
        return '';
      }

      return strValue;
    };

    params = params.append('orgao', sanitizeValue(request.orgao));
    params = params.append('municipio', sanitizeValue(request.municipio));
    params = params.append('status', sanitizeValue(request.status));

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
