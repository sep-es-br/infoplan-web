import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import {
  ISPODashboardPo,
  ISPODashboardUo,
  ISPOFiltroPos,
  ISPOFiltroUos,
  ISPOTotalAno,
  ISPOTotalAnoSigefes,
  ISPOTotalAutorizadoDTO,
  ISPOTotalAutorizadoFilter,
  ISPOTotalAutorizadoProgressPo,
  ISPOTotalAutorizadoProgressUo,
  ISPOTotalPrevistoDTO,
  ISPOTotalPrevistoFilter,
} from "../../interfaces/planejamento-orcamentario/planejamento-orcamentario";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PlanejamentoOrcamentarioService {
  readonly API_URL: string = `${environment.apiUrl}/planejamentoOrcamentario`;
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _router: Router = inject(Router);

  constructor() { }


  getDashboardUo(filtro: ISPOTotalAutorizadoFilter) : Observable<ISPODashboardUo[]> {
    const params: HttpParams = this.returnParamsAutorizado(filtro);
    return this._http
      .get<ISPODashboardUo[]>(`${this.API_URL}/dashboardUo`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getTotalPrevisto(
    filter: ISPOTotalPrevistoFilter
  ): Observable<ISPOTotalPrevistoDTO[]> {
    const params: HttpParams = this.returnParamsPrevisto(filter);
    return this._http
      .get<ISPOTotalPrevistoDTO[]>(`${this.API_URL}/totalPrevisto`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getTotalAutorizado(
    filter: ISPOTotalAutorizadoFilter
  ): Observable<ISPOTotalAutorizadoDTO[]> {
    const params: HttpParams = this.returnParamsAutorizado(filter);
    return this._http
      .get<ISPOTotalAutorizadoDTO[]>(`${this.API_URL}/totalAutorizado`, {
        params,
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getFiltroUos() : Observable<ISPOFiltroUos[]> {
    return this._http
      .get<ISPOFiltroUos[]>(`${this.API_URL}/filtroUos`)
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }


  getFiltroPos(ano: number,codUosList: string[]) : Observable<ISPOFiltroPos[]> {
    return this._http
      .get<ISPOFiltroPos[]>(`${this.API_URL}/filtroPos/${ano}/${codUosList}`)
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getDashboardPoList(filtro: ISPOTotalAutorizadoFilter) : Observable<ISPODashboardPo[]> {
    const params: HttpParams = this.returnParamsAutorizado(filtro);
    return this._http
      .get<ISPODashboardPo[]>(`${this.API_URL}/dashboardPo`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getTotalAutorizadoUoList(filtro: ISPOTotalAutorizadoFilter) : Observable<ISPOTotalAutorizadoProgressUo[]> {
    const params: HttpParams = this.returnParamsAutorizado(filtro);
    return this._http
      .get<ISPOTotalAutorizadoProgressUo[]>(`${this.API_URL}/totalAutorizadoUo`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getTotalAutorizadoPoList(filtro: ISPOTotalAutorizadoFilter) : Observable<ISPOTotalAutorizadoProgressPo[]> {
    const params: HttpParams = this.returnParamsAutorizado(filtro);
    return this._http
      .get<ISPOTotalAutorizadoProgressPo[]>(`${this.API_URL}/totalAutorizadoPo`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getTotalAnos(filtro: ISPOTotalAutorizadoFilter): Observable<ISPOTotalAno[]> {
    const params: HttpParams = this.returnParamsAutorizado(filtro);
    return this._http
      .get<ISPOTotalAno[]>(`${this.API_URL}/totalAno`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  getTotalAnoSigefes(filtro: ISPOTotalAutorizadoFilter): Observable<ISPOTotalAnoSigefes[]> {
    const params: HttpParams = this.returnParamsAutorizado(filtro);
    return this._http
      .get<ISPOTotalAnoSigefes[]>(`${this.API_URL}/totalAnoSigefes`, { params })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  private returnParamsPrevisto(filter: ISPOTotalPrevistoFilter): HttpParams {
    let params = new HttpParams()
      .set("ano", String(filter.ano))
      .set(
        "uo",
        Array.isArray(filter.uo) ? filter.uo.join(",") : String(filter.uo)
      )
      .set(
        "po",
        Array.isArray(filter.po) ? filter.po.join(",") : String(filter.po)
      )
      .set("tipoFonte", String(filter.tipoFonte))
      .set("gnd", String(filter.gnd));
    return params;
  }

  private returnParamsAutorizado(filter: ISPOTotalAutorizadoFilter): HttpParams {
    let params = new HttpParams()
      .set("ano", String(filter.ano))
      .set(
        "uo",
        Array.isArray(filter.uo) ? filter.uo.join(",") : String(filter.uo)
      )
      .set(
        "mes",
        Array.isArray(filter.mes)
          ? filter.mes.join(",")
          : String(filter.mes)
      )
      .set(
        "po",
        Array.isArray(filter.po) ? filter.po.join(",") : String(filter.po)
      )
      .set("tipoFonte", String(filter.tipoFonte))
      .set("gnd", String(filter.gnd));
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
