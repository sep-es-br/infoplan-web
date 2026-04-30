import { Observable, pipe, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from "@angular/common/http";
import { Router } from "@angular/router";
import {
  IActionResponse,
  IBudgetaryUnitResponse,
  IIndicatorExecutionFilter,
} from "../../interfaces/indicator-execution/indicator-execution";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class IndicatorExecutionService {
  private _URI = `${environment.apiUrl}/indicador`;
  private _http = inject(HttpClient);
  private _router = inject(Router);

  public getSearchBugataryUnit(
    filter: IIndicatorExecutionFilter,
  ): Observable<IBudgetaryUnitResponse[]> {
    return this._http
      .get<IBudgetaryUnitResponse[]>(this._URI + "/buscar-uo", {
        params: this.params(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getSearchAction(filter: IIndicatorExecutionFilter): Observable<IActionResponse[]> {
    return this._http
      .get<IActionResponse[]>(this._URI + "/buscar-acao", {
        params: this.paramsAction(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getSearchFullSource(filter: IIndicatorExecutionFilter): Observable<IActionResponse[]> {
    return this._http
      .get<IActionResponse[]>(this._URI + "/buscar-fonte-completa", {
        params: this.paramsFullSource(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  private params(filter: IIndicatorExecutionFilter): HttpParams {
    const params = new HttpParams().set("year", Array.isArray(filter.year) ? filter.year.join(",") :  filter.year);

    return params;
  }

  private paramsAction(filter: IIndicatorExecutionFilter): HttpParams {
    const params = new HttpParams()
    .set("year", Array.isArray(filter.year) ? filter.year.join(",") : filter.year)
    .set("uo", Array.isArray(filter.uo) ? filter.uo.join(",") : filter.uo);

    return params;
  }

  private paramsFullSource(filter: IIndicatorExecutionFilter): HttpParams {
    const params = new HttpParams()
    .set("year", Array.isArray(filter.year) ? filter.year.join(",") : filter.year)
    .set("uo", Array.isArray(filter.uo) ? filter.uo.join(",") : filter.uo)
    .set("action", Array.isArray(filter.action) ? filter.action.join(",") : filter.action);

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
