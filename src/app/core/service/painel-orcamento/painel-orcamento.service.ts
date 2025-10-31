import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  IPainelOrcamentoRequest,
  IReceitaTotalOrcamentoResponse,
  IReceitaOrigemOrcamentoResponse,
  IReceitaCategoriaOrcamentoResponse,
  IReceitaParticipacaoOrcamentoResponse,
  IReceitaDespesaGNDOrcamentoResponse,
  IReceitaDespesaGNDTotalOrcamentoResponse,
  IReceitaICMSOrcamentoResponse,
  IReceitaImpostoOrcamentoResponse,
} from "../../interfaces/painel-orcamento/painel-orcamento";

@Injectable({
  providedIn: "root",
})
export class PainelOrcamentoService {
  private _URI = `${environment.apiUrl}/painelOrcamento`;

  constructor(private _http: HttpClient) {}

  public getReceitaTotal(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaTotalOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaTotalOrcamentoResponse>(
      `${this._URI}/receita-total`,
      { params }
    );
  }

  public getReceitaOrigem(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaOrigemOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);

    return this._http.get<IReceitaOrigemOrcamentoResponse>(
      `${this._URI}/receita-origem`,
      { params }
    );
  }

  public getReceitaPorCategoria(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaCategoriaOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);

    return this._http.get<IReceitaCategoriaOrcamentoResponse>(
      `${this._URI}/receita-categoria`,
      { params }
    );
  }

  public getRceitaPorParticipacao(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaParticipacaoOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaParticipacaoOrcamentoResponse>(
      `${this._URI}/receita-participacao`,
      { params }
    );
  }

  public getRceitaPorDespesaGND(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaDespesaGNDOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaDespesaGNDOrcamentoResponse>(
      `${this._URI}/receita-despesasGnd`,
      { params }
    );
  }

  public getRceitaPorDespesaGNDTotal(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaDespesaGNDTotalOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaDespesaGNDTotalOrcamentoResponse>(
      `${this._URI}/receita-despesasGnd-total`,
      { params }
    );
  }

  public getRceitaPorICMS(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaICMSOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaICMSOrcamentoResponse>(
      `${this._URI}/receita-icms`,
      { params }
    );
  }

  public getRceitaPorImpostos(
    request: IPainelOrcamentoRequest
  ): Observable<IReceitaImpostoOrcamentoResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaImpostoOrcamentoResponse>(
      `${this._URI}/receita-impostos`,
      { params }
    );
  }

  private returnParams(painelOrcamento: IPainelOrcamentoRequest): HttpParams {
    let params = new HttpParams()
      .set("ano", String(painelOrcamento.ano))
      .set(
        "mes",
        Array.isArray(painelOrcamento.mes)
          ? painelOrcamento.mes.join(",")
          : String(painelOrcamento.mes)
      )
      .set("tipoFonte", String(painelOrcamento.tipoFonte));
    return params;
  }
}
