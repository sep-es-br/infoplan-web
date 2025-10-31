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
  ano: number;
  origem: string;
  receitaLiquida: number;
}

export interface IReceitaCategoriaOrcamentoResponse {
  ano: number;
  categoria: string;
  receitaLiquida: number;
}

export interface IReceitaParticipacaoOrcamentoResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}

export interface IReceitaImpostoOrcamentoResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}

export interface IReceitaDespesaGNDOrcamentoResponse {
  ano: number;
  mes: number;
  nome_gnd: string;
  vlr_orcado: string;
  vlr_autorizado: number;
  vlr_empenhado: number;
  vlr_liquidado: number;
  vlr_pago_com_rap: number;
}

export interface IReceitaDespesaGNDTotalOrcamentoResponse {
  ano: number;
  vlr_orcado: string;
  vlr_autorizado: number;
  vlr_empenhado: number;
  vlr_liquidado: number;
  vlr_pago_com_rap: number;
}

export interface IReceitaICMSOrcamentoResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}

export interface IReceitaImpostoOrcamentoResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}
