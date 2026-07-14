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
  IDashAvailabilityToUoResponse,
  IDashPlannedBudgetResponse,
  IDashSuccessPlannedResponse,
  IIndicatorExecutionFilter,
  IPO,
} from "../../interfaces/indicator-execution/indicator-execution";
import { catchError } from "rxjs/operators";
import { AuthenticationService } from "../authentication.service";

@Injectable({
  providedIn: "root",
})
export class IndicatorExecutionService {
  private _URI = `${environment.apiUrl}/indicador`;
  private _http = inject(HttpClient);
  private _router = inject(Router);
  private _authService = inject(AuthenticationService);

  public getSearchBugataryUnit(
    filter: IIndicatorExecutionFilter,
  ): Observable<IBudgetaryUnitResponse[]> {
    return this._http
      .get<IBudgetaryUnitResponse[]>(this._URI + "/buscar-uo", {
        params: this.params(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getSearchAction(
    filter: IIndicatorExecutionFilter,
  ): Observable<IActionResponse[]> {
    return this._http
      .get<IActionResponse[]>(this._URI + "/buscar-acao", {
        params: this.paramsAction(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getSearchFullSource(
    filter: IIndicatorExecutionFilter,
  ): Observable<IActionResponse[]> {
    return this._http
      .get<IActionResponse[]>(this._URI + "/buscar-fonte-completa", {
        params: this.paramsFullSource(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getSearchPo(
    filter: IIndicatorExecutionFilter,
  ) : Observable<IPO> {
    return this._http
      .get<IPO>(this._URI + "/buscar-po", {
        params: this.paramsCodPo(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardAvailableWithoutReversation(
    filter: IIndicatorExecutionFilter,
  ): Observable<number> {
    return this._http
      .get<number>(this._URI + "/card-totais-disponivel-sem-reserva", {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardPlannedSuccess(
    filter: IIndicatorExecutionFilter,
  ): Observable<{ sucesso: number; timesTamp: number }> {
    return this._http
      .get<{ sucesso: number; timesTamp: number }>(
        this._URI + "/card-totais-sucesso-planejado",
        {
          params: this.paramsFilterGeneral(filter),
        },
      )
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardComparative(
    filter: IIndicatorExecutionFilter,
  ): Observable<number> {
    return this._http
      .get<number>(this._URI + "/card-totais-comparativo", {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardPoWithHighestSettlement(
    filter: IIndicatorExecutionFilter,
  ): Observable<number> {
    return this._http
      .get<number>(this._URI + "/card-totais-po-maior-liquidacao", {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardBudgetFeasibility(
    filter: IIndicatorExecutionFilter,
  ): Observable<number> {
    return this._http
      .get<number>(this._URI + "/card-totais-exequibilidade", {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardFocusOnTheMission(
    filter: IIndicatorExecutionFilter,
  ): Observable<number> {
    return this._http
      .get<number>(this._URI + "/card-totais-missao", {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardBudgetChanges(
    filter: IIndicatorExecutionFilter,
  ): Observable<number> {
    return this._http
      .get<number>(`${this._URI}/card-totais-alteracao`, {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getCardIGO(
    filter: IIndicatorExecutionFilter,
  ): Observable<{ IGO: number; nota: string }> {
    return this._http
      .get<{ IGO: number; nota: string }>(`${this._URI}/card-totais-IGO`, {
        params: this.paramsFilterGeneral(filter),
      })
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getDashAvailabilityToUo(
    filter: IIndicatorExecutionFilter,
  ): Observable<IDashAvailabilityToUoResponse> {
    return this._http
      .get<IDashAvailabilityToUoResponse>(
        `${this._URI}/dash/disponibilidade-por-uo`,
        {
          params: this.paramsDashAvailabilityToUo(filter),
        },
      )
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getDashSuccessPlanned(
    filter: IIndicatorExecutionFilter,
  ): Observable<IDashSuccessPlannedResponse[]> {
    return this._http
      .get<IDashSuccessPlannedResponse[]>(
        `${this._URI}/dash/grupo-de-despesas`,
        {
          params: this.paramsFilterGeneral(filter),
        },
      )
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  public getDashPlannedBudget(
    filter: IIndicatorExecutionFilter,
  ): Observable<IDashPlannedBudgetResponse[]> {
    return this._http
      .get<IDashPlannedBudgetResponse[]>(
        `${this._URI}/dash/plano-orcamentario`,
        {
          params: this.paramsFilterGeneral(filter),
        },
      )
      .pipe(catchError((err) => this.handleError(err, this._router)));
  }

  private getCommonParams(): HttpParams {
    const orgao = this._authService.getUsuarioLogado()?.sigla || "";
    return new HttpParams().set("orgao", orgao);
  }

  private params(filter: IIndicatorExecutionFilter): HttpParams {
    return this.getCommonParams().set(
      "year",
      Array.isArray(filter.year) ? filter.year.join(",") : filter.year,
    );
  }

  private paramsAction(filter: IIndicatorExecutionFilter): HttpParams {
    return this.getCommonParams()
      .set(
        "year",
        Array.isArray(filter.year) ? filter.year.join(",") : filter.year,
      )
      .set(
        "codUo",
        Array.isArray(filter.codUo) ? filter.codUo.join(",") : filter.codUo,
      );
  }

  private paramsFullSource(filter: IIndicatorExecutionFilter): HttpParams {
    return this.getCommonParams()
      .set(
        "year",
        Array.isArray(filter.year) ? filter.year.join(",") : filter.year,
      )
      .set(
        "codUo",
        Array.isArray(filter.codUo) ? filter.codUo.join(",") : filter.codUo,
      )
      .set(
        "codAction",
        Array.isArray(filter.codAction)
          ? filter.codAction.join(",")
          : filter.codAction,
      );
  }

  private paramsCodPo(filter: IIndicatorExecutionFilter): HttpParams {
    return this.getCommonParams()
      .set(
        "year",
        Array.isArray(filter.year) ? filter.year.join(",") : filter.year,
      )
      .set(
        "codAction",
        Array.isArray(filter.codAction)
          ? filter.codAction.join(",")
          : filter.codAction,
      );
  }

  private paramsFilterGeneral(filter: IIndicatorExecutionFilter): HttpParams {
    return this.getCommonParams()
      .set(
        "year",
        Array.isArray(filter.year) ? filter.year.join(",") : filter.year,
      )
      .set(
        "month",
        Array.isArray(filter.month) ? filter.month.join(",") : filter.month,
      )
      .set(
        "codUo",
        Array.isArray(filter.codUo) ? filter.codUo.join(",") : filter.codUo,
      )
      .set(
        "codAction",
        Array.isArray(filter.codAction)
          ? filter.codAction.join(",")
          : filter.codAction,
      )
      .set(
        "codGnd",
        Array.isArray(filter.codGnd) ? filter.codGnd.join(",") : filter.codGnd,
      )
      .set(
        "codSource",
        Array.isArray(filter.codSource)
          ? filter.codSource.join(",")
          : filter.codSource,
      )
      .set("codAmendment", filter.codAmendment)
      .set(
        "typeSource",
        Array.isArray(filter.typeSource)
          ? filter.typeSource.join(",")
          : filter.typeSource,
      )
      .set(
        "codPo",
        Array.isArray(filter.codPo) ? filter.codPo.join(",") : filter.codPo,
      );
  }

  private paramsDashAvailabilityToUo(
    filter: IIndicatorExecutionFilter,
  ): HttpParams {
    return this.getCommonParams()
      .set("year", filter.year.toString())
      .set(
        "month",
        Array.isArray(filter.month) ? filter.month.join(",") : filter.month,
      )
      .set(
        "codUo",
        Array.isArray(filter.codUo) ? filter.codUo.join(",") : filter.codUo,
      )
      .set(
        "codAction",
        Array.isArray(filter.codAction)
          ? filter.codAction.join(",")
          : filter.codAction,
      )
      .set(
        "codGnd",
        Array.isArray(filter.codGnd) ? filter.codGnd.join(",") : filter.codGnd,
      )
      .set(
        "codSource",
        Array.isArray(filter.codSource)
          ? filter.codSource.join(",")
          : filter.codSource,
      )
      .set("codAmendment", filter.codAmendment)
      .set(
        "typeSource",
        Array.isArray(filter.typeSource)
          ? filter.typeSource.join(",")
          : filter.typeSource,
      )
      .set(
        "codPo",
        Array.isArray(filter.codPo) ? filter.codPo.join(",") : filter.codPo,
      );
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
