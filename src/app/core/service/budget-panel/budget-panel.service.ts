import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import {
  IBudgetExecutionRequest,
  IRevenueTotalBudgetExecutionResponse,
  IRevenueOriginBudgetExecutionResponse,
  IRevenueCategoryBudgetExecutionResponse,
  IRevenueParticipationBudgetExecutionResponse,
  IRevenueExpenseGndBudgetExecutionResponse,
  IRevenueExpenseGndTotalBudgetExecutionResponse,
  IRevenueIcmsBudgetExecutionResponse,
  IRevenueTaxesBudgetExecutionResponse,
  IRevenueTransferBudgetExecutionResponse,
} from "../../interfaces/budget-panel/budget-panel";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class BudgetPanelService {
  private _URI = `${environment.apiUrl}/budget-execution`;

  private router: Router;

  constructor(private _http: HttpClient, private _router: Router) {
    this.router = _router;
  }
  public getRevenueTotal(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueTotalBudgetExecutionResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http
      .get<IRevenueTotalBudgetExecutionResponse>(`${this._URI}/revenue-total`, {
        params,
      })
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueOrigin(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueOriginBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParams(request);

    return this._http
      .get<IRevenueOriginBudgetExecutionResponse[]>(
        `${this._URI}/revenue-origin`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByCategory(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueCategoryBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParams(request);

    return this._http
      .get<IRevenueCategoryBudgetExecutionResponse[]>(
        `${this._URI}/revenue-category`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByParticipation(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueParticipationBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http
      .get<IRevenueParticipationBudgetExecutionResponse[]>(
        `${this._URI}/revenue-participation`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByExpenseGND(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueExpenseGndBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParamsExecutiveBranch(request);
    return this._http
      .get<IRevenueExpenseGndBudgetExecutionResponse[]>(
        `${this._URI}/revenue-expense-gnd`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByExpenseGNDTotal(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueExpenseGndTotalBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParamsExecutiveBranch(request);
    return this._http
      .get<IRevenueExpenseGndTotalBudgetExecutionResponse[]>(
        `${this._URI}/revenue-expense-gnd-total`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByICMS(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueIcmsBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http
      .get<IRevenueIcmsBudgetExecutionResponse[]>(`${this._URI}/revenue-icms`, {
        params,
      })
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByTaxes(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueTaxesBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http
      .get<IRevenueTaxesBudgetExecutionResponse[]>(
        `${this._URI}/revenue-taxes`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRevenueByTransfer(
    request: IBudgetExecutionRequest
  ): Observable<IRevenueTransferBudgetExecutionResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http
      .get<IRevenueTransferBudgetExecutionResponse[]>(
        `${this._URI}/revenue-transfer-current`,
        { params }
      )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  private returnParams(
    budgetExecution: IBudgetExecutionRequest
  ): HttpParams {
    let params = new HttpParams()
      .set("year", String(budgetExecution.year))
      .set(
        "month",
        Array.isArray(budgetExecution.month)
          ? budgetExecution.month.join(",")
          : String(budgetExecution.month)
      )
      .set("sourceType", String(budgetExecution.sourceType));

    if (budgetExecution.uo) {
      params = params.set("uo", budgetExecution.uo);
    }

    if (budgetExecution.po) {
      params = params.set("po", budgetExecution.po);
    }
    return params;
  }

  returnParamsExecutiveBranch(
    budgetExecution: IBudgetExecutionRequest
  ): HttpParams {
    let params = new HttpParams()
      .set("year", String(budgetExecution.year))
      .set(
        "month",
        Array.isArray(budgetExecution.month)
          ? budgetExecution.month.join(",")
          : String(budgetExecution.month)
      )
      .set("branchCode", budgetExecution.branchCode !== undefined
        ? budgetExecution.branchCode : "-1")
      .set("sourceType", String(budgetExecution.sourceType));

    if (budgetExecution.uo) {
      params = params.set("uo", budgetExecution.uo);
    }

    if (budgetExecution.po) {
      params = params.set("po", budgetExecution.po);
    }

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
