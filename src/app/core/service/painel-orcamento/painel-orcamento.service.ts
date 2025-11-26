import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaTotalOrcamentariaResponse,
  IReceitaOrigemOrcamentariaResponse,
  IReceitaCategoriaOrcamentariaResponse,
  IReceitaParticipacaoOrcamentariaResponse,
  IReceitaDespesaGNDOrcamentariaResponse,
  IReceitaDespesaGNDTotalOrcamentariaResponse,
  IReceitaICMSOrcamentariaResponse,
  IReceitaImpostoOrcamentariaResponse,
  IReceitaTransfereciaCorrenteOrcamentariaResponse,
} from "../../interfaces/painel-orcamento/painel-orcamento";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PainelOrcamentoService {
  private _URI = `${environment.apiUrl}/execucaoOrcamentaria`;

  private router: Router;


  constructor(private _http: HttpClient, private _router: Router) {
    this.router = _router;
  }
  public getReceitaTotal(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaTotalOrcamentariaResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaTotalOrcamentariaResponse>(
      `${this._URI}/receita-total`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getReceitaOrigem(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaOrigemOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);

    return this._http.get<IReceitaOrigemOrcamentariaResponse[]>(
      `${this._URI}/receita-origem`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getReceitaPorCategoria(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaCategoriaOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);

    return this._http.get<IReceitaCategoriaOrcamentariaResponse[]>(
      `${this._URI}/receita-categoria`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getReceitaPorParticipacao(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaParticipacaoOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaParticipacaoOrcamentariaResponse[]>(
      `${this._URI}/receita-participacao`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRceitaPorDespesaGND(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaDespesaGNDOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaDespesaGNDOrcamentariaResponse[]>(
      `${this._URI}/receita-despesas-gnd`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRceitaPorDespesaGNDTotal(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaDespesaGNDTotalOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaDespesaGNDTotalOrcamentariaResponse[]>(
      `${this._URI}/receita-despesas-gnd-total`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRceitaPorICMS(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaICMSOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaICMSOrcamentariaResponse[]>(
      `${this._URI}/receita-icms`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRceitaPorImpostos(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaImpostoOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaImpostoOrcamentariaResponse[]>(
      `${this._URI}/receita-impostos`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  public getRceitaPorTransferenciaCorrente(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaTransfereciaCorrenteOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaTransfereciaCorrenteOrcamentariaResponse[]>(
      `${this._URI}/receita-transferencia-corrente`,
      { params }
    )
      .pipe(catchError((err) => this.handleError(err, this.router)));
  }

  private returnParams(execucaoOrcamentaria: IExecucaoOrcamentariaRequest): HttpParams {
    let params = new HttpParams()
      .set("ano", String(execucaoOrcamentaria.ano))
      .set(
        "mes",
        Array.isArray(execucaoOrcamentaria.mes)
          ? execucaoOrcamentaria.mes.join(",")
          : String(execucaoOrcamentaria.mes)
      )
      .set("tipoFonte", String(execucaoOrcamentaria.tipoFonte));
    return params;
  }

  // private handleError(
  //   err: HttpErrorResponse,
  //   router: Router,
  //   callback?: (error: any) => void
  // ): Observable<never> {
  //   console.log(err);

  //   if (err.status === HttpStatusCode.Unauthorized) {
  //     router.navigate(['pages/home']);
  //   } else if (err.status === HttpStatusCode.Forbidden) {
  //     router.navigate(['login']);
  //   }

  //   if (callback) {
  //     callback(err);
  //   }

  //   // Retorna um Observable que emite erro
  //   return throwError(() => err);
  // }

  private handleError(err: any, router: Router): Observable<never> {
    console.log(err, "dasdsadas");
    if ((err as HttpErrorResponse).status == HttpStatusCode.Unauthorized) {
      router.navigate(['pages/home']);
    } else if ((err as HttpErrorResponse).status == HttpStatusCode.Forbidden) {
      console.log("Forbidden");
      router.navigate(['login']);
    }

    return throwError(() => err);
  }

}
