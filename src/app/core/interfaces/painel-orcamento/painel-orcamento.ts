export interface IExecucaoOrcamentariaRequest {
  ano: number;
  mes: number[];
  tipoFonte: number[];
  uo?: string;
  po?: string;
  codPoder?: any
}

export interface IReceitaTotalOrcamentariaResponse {
  ano: number;
  vlr_receita_prevista: number;
  vlr_receita_liquida: number;
  porcentagem: number;
  timesTemp: string;
}

export interface IExecucaoOrcamentariaReceitaOrigem {
  ano: number;
  mes: number[];
  tipoFonte: number[];
}

export interface IReceitaOrigemOrcamentariaResponse {
  ano: number;
  origem: string;
  receitaLiquida: number;
}

export interface IReceitaCategoriaOrcamentariaResponse {
  ano: number;
  categoria: string;
  receitaLiquida: number;
}

export interface IReceitaParticipacaoOrcamentariaResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}

export interface IReceitaImpostoOrcamentariaResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}

export interface IReceitaDespesaGNDOrcamentariaResponse {
  ano: number;
  mes: number;
  nome_gnd: string;
  tipo_fonte: number;
  vlr_orcado: string;
  vlr_autorizado: number;
  vlr_empenhado: number;
  vlr_liquidado: number;
  vlr_pago_com_rap: number;
}

// eqewqe

export interface IReceitaDespesaGNDTotalOrcamentariaResponse {
  ano: number;
  vlr_orcado: string;
  vlr_autorizado: number;
  vlr_empenhado: number;
  vlr_liquidado: number;
  vlr_pago_com_rap: number;
  porcentagem_empenhada: number
  porcentagem_liquidada: number
}

export interface IReceitaICMSOrcamentariaResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}



export interface IReceitaTransfereciaCorrenteOrcamentariaResponse {
  ano: number;
  nome_item_patrimonial: string;
  receitaLiquida: number;
}


export interface IExecucaoOrcamentariaTotals {
  totalReceitaPrevista: number;
  totalReceitaRealizada: number;
  porcentagemReceitaRealizadaPrevista: number;
  porcentagemReceitaEmpenhadaAutorizada: number;
  porcentagemReceitaLiquidadaAutorizada: number;
}
