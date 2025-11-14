import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
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

@Injectable({
  providedIn: "root",
})
export class PainelOrcamentoService {
  private _URI = `${environment.apiUrl}/painelOrcamento`;

  constructor(private _http: HttpClient) {}

  public getReceitaTotal(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaTotalOrcamentariaResponse> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaTotalOrcamentariaResponse>(
      `${this._URI}/receita-total`,
      { params }
    );
  }

  public getReceitaOrigem(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaOrigemOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);

    return this._http.get<IReceitaOrigemOrcamentariaResponse[]>(
      `${this._URI}/receita-origem`,
      { params }
    );
  }

  public getReceitaPorCategoria(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaCategoriaOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);

    return this._http.get<IReceitaCategoriaOrcamentariaResponse[]>(
      `${this._URI}/receita-categoria`,
      { params }
    );
  }

  public getReceitaPorParticipacao(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaParticipacaoOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaParticipacaoOrcamentariaResponse[]>(
      `${this._URI}/receita-participacao`,
      { params }
    );
  }

  public getRceitaPorDespesaGND(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaDespesaGNDOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaDespesaGNDOrcamentariaResponse[]>(
      `${this._URI}/receita-despesas-gnd`,
      { params }
    );
  }

  public getRceitaPorDespesaGNDTotal(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaDespesaGNDTotalOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaDespesaGNDTotalOrcamentariaResponse[]>(
      `${this._URI}/receita-despesas-gnd-total`,
      { params }
    );
  }

  public getRceitaPorICMS(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaICMSOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaICMSOrcamentariaResponse[]>(
      `${this._URI}/receita-icms`,
      { params }
    );
  }

  public getRceitaPorImpostos(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaImpostoOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaImpostoOrcamentariaResponse[]>(
      `${this._URI}/receita-impostos`,
      { params }
    );
  }

  public getRceitaPorTransferenciaCorrente(
    request: IExecucaoOrcamentariaRequest
  ): Observable<IReceitaTransfereciaCorrenteOrcamentariaResponse[]> {
    const params: HttpParams = this.returnParams(request);
    return this._http.get<IReceitaTransfereciaCorrenteOrcamentariaResponse[]>(
      `${this._URI}/receita-transferencia-corrente`,
      { params }
    );
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

}
