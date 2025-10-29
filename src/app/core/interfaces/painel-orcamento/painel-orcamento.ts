export interface IPainelOrcamentoRequest {
  ano: number;
  mes: number[];
  tipoFonte: number[];
}

export interface IReceitaTotalOrcamentoResponse {
  ano: number;
  vlr_receita_prevista: number;
  vlr_receita_liquida: number;
}

export interface IPainelOrcamentoReceitaOrigem {
  ano: number;
  mes: number[];
  tipoFonte: number[];
}

export interface IReceitaOrigemOrcamentoResponse {
  ano:number;
  origem:string;
  receitaLiquida:number;
}

export interface IReceitaCategoriaOrcamentoResponse {
  ano:number;
  categoria:string;
  receitaLiquida:number;
}
